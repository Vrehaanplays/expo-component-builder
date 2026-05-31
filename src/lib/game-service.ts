import { supabase } from './supabase';
import { generateDailyScenariosFn } from '@/server/ai';

export interface Scenario {
  id: string;
  category: string;
  difficulty: string;
  scenario_text: string;
  options: Array<{ text: string; correct: boolean }>;
  correct_option: number;
  explanation: string;
  is_daily: boolean;
}

/**
 * Returns a timezone-safe date string in YYYY-MM-DD format,
 * offset by a given number of days (e.g. 0 for today, 1 for tomorrow).
 */
export function getLocalDateString(offsetDays = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

/**
 * Retrieves or creates a daily challenge scenario for a specific date.
 */
export async function getOrCreateDailyScenario(dateStr: string): Promise<Scenario> {
  // 1. Query daily_challenges for this date
  const { data: challenge, error: challengeErr } = await supabase
    .from('daily_challenges')
    .select('scenario_ids')
    .eq('date', dateStr)
    .maybeSingle();

  if (challengeErr) {
    console.error('Error fetching daily challenge mapping:', challengeErr);
  }

  if (challenge && challenge.scenario_ids && Array.isArray(challenge.scenario_ids) && challenge.scenario_ids.length > 0) {
    const scenarioId = challenge.scenario_ids[0];
    const { data: scenario, error: scenarioErr } = await supabase
      .from('scenarios')
      .select('*')
      .eq('id', scenarioId)
      .single();

    if (!scenarioErr && scenario) {
      return {
        id: scenario.id,
        category: scenario.category,
        difficulty: scenario.difficulty,
        scenario_text: scenario.scenario_text,
        options: scenario.options,
        correct_option: scenario.correct_option,
        explanation: scenario.explanation,
        is_daily: scenario.is_daily,
      } as Scenario;
    }
    console.error('Error loading referenced scenario, will regenerate:', scenarioErr);
  }

  // 2. Generate new scenario via Gemini
  console.log(`Generating new scenario for date: ${dateStr}...`);
  const gen = await generateDailyScenariosFn(dateStr);
  const correctOptionIdx = gen.options.findIndex((o: any) => o.correct);

  // 3. Save scenario to DB
  const { data: newScenario, error: insertScenarioErr } = await supabase
    .from('scenarios')
    .insert({
      category: 'Argument',
      difficulty: 'Medium',
      scenario_text: gen.premise,
      options: gen.options,
      correct_option: correctOptionIdx !== -1 ? correctOptionIdx : 0,
      explanation: gen.explanation || 'Spot the fallacy in reasoning.',
      is_daily: true,
    })
    .select()
    .single();

  if (insertScenarioErr || !newScenario) {
    console.error('Failed to save generated scenario to scenarios table:', insertScenarioErr);
    throw new Error(insertScenarioErr?.message || 'Failed to insert scenario');
  }

  // 4. Save entry in daily_challenges mapping
  const { error: insertChallengeErr } = await supabase
    .from('daily_challenges')
    .insert({
      date: dateStr,
      scenario_ids: [newScenario.id],
    });

  if (insertChallengeErr) {
    console.error('Failed to save daily challenge date mapping:', insertChallengeErr);
    // Ignore mapping error if it is a duplicate key conflict (some other client might have written it)
  }

  return {
    id: newScenario.id,
    category: newScenario.category,
    difficulty: newScenario.difficulty,
    scenario_text: newScenario.scenario_text,
    options: newScenario.options,
    correct_option: newScenario.correct_option,
    explanation: newScenario.explanation,
    is_daily: newScenario.is_daily,
  } as Scenario;
}

/**
 * Returns how many unique sessions have been recorded for a specific scenario.
 */
export async function getScenarioSessionCount(scenarioId: string): Promise<number> {
  const { count, error } = await supabase
    .from('sessions')
    .select('*', { count: 'exact', head: true })
    .eq('scenario_id', scenarioId);

  if (error) {
    console.error('Error fetching session count for scenario:', error);
    return 0;
  }
  return count || 0;
}

/**
 * Checks if a specific user has played a specific scenario.
 */
export async function hasPlayedScenario(userId: string, scenarioId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('sessions')
    .select('id')
    .eq('user_id', userId)
    .eq('scenario_id', scenarioId)
    .limit(1);

  if (error) {
    console.error('Error checking if scenario played:', error);
    return false;
  }
  return data && data.length > 0;
}

/**
 * Saves a gameplay session in the database and recalculates user statistics.
 */
export async function recordSession(
  userId: string,
  scenarioId: string,
  answerIndex: number,
  isCorrect: boolean,
  isEarly: boolean,
  responseTimeMs: number
): Promise<{ shardsEarned: number }> {
  // Determine points (150 for regular, 75 for early, 0 if incorrect)
  const shardsEarned = isCorrect ? (isEarly ? 75 : 150) : 0;

  // Insert session
  const { error: insertErr } = await supabase
    .from('sessions')
    .insert({
      user_id: userId,
      scenario_id: scenarioId,
      answer_index: answerIndex,
      is_correct: isCorrect,
      shards_earned: shardsEarned,
      response_time_ms: responseTimeMs,
    });

  if (insertErr) {
    console.error('Failed to save session:', insertErr);
    throw insertErr;
  }

  // Recalculate user profile stats based on their entire session history
  const { data: allSessions, error: fetchErr } = await supabase
    .from('sessions')
    .select('is_correct, shards_earned, played_at')
    .eq('user_id', userId);

  if (fetchErr || !allSessions) {
    console.error('Failed to fetch user sessions for stats update:', fetchErr);
    return { shardsEarned };
  }

  const sessionsPlayed = allSessions.length;
  const correctCount = allSessions.filter(s => s.is_correct).length;
  const accuracyPercent = sessionsPlayed > 0 ? (correctCount / sessionsPlayed) * 100 : 0;
  const totalShards = allSessions.reduce((acc, s) => acc + (s.shards_earned || 0), 0);

  // Compute daily streak based on unique session play dates (YYYY-MM-DD)
  const playDates = Array.from(new Set(allSessions.map(s => s.played_at.split('T')[0]))).sort().reverse();
  const todayStr = getLocalDateString(0);
  const yesterdayStr = getLocalDateString(-1);

  let currentStreak = 0;
  if (playDates.includes(todayStr) || playDates.includes(yesterdayStr)) {
    currentStreak = 1;
    let checkDate = new Date();
    // If the user hasn't played today, start back-checking from yesterday
    if (!playDates.includes(todayStr)) {
      checkDate.setDate(checkDate.getDate() - 1);
    }
    while (true) {
      checkDate.setDate(checkDate.getDate() - 1);
      const yyyy = checkDate.getFullYear();
      const mm = String(checkDate.getMonth() + 1).padStart(2, '0');
      const dd = String(checkDate.getDate()).padStart(2, '0');
      const checkStr = `${yyyy}-${mm}-${dd}`;

      if (playDates.includes(checkStr)) {
        currentStreak++;
      } else {
        break;
      }
    }
  }

  // Get current longest streak to update if beaten
  const { data: profileData, error: profileErr } = await supabase
    .from('profiles')
    .select('longest_streak')
    .eq('id', userId)
    .single();

  const prevLongest = profileErr ? 0 : (profileData?.longest_streak ?? 0);
  const longestStreak = Math.max(prevLongest, currentStreak);

  // Update profile
  const { error: updateErr } = await supabase
    .from('profiles')
    .update({
      sessions_played: sessionsPlayed,
      accuracy_percent: accuracyPercent,
      total_shards: totalShards,
      current_streak: currentStreak,
      longest_streak: longestStreak,
    })
    .eq('id', userId);

  if (updateErr) {
    console.error('Failed to update user profile stats:', updateErr);
  }

  return { shardsEarned };
}

/**
 * Maps shard scores to competitive tier rank names.
 */
export function getRankTier(shards: number): string {
  if (shards >= 10000) return 'Grandmaster';
  if (shards >= 6000) return 'Rationalist';
  if (shards >= 3000) return 'Dialectician';
  if (shards >= 1500) return 'Steelmanner';
  if (shards >= 500) return 'Analyst';
  return 'Initiate';
}
