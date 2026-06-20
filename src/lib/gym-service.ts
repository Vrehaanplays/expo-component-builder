import { supabase } from './supabase';

export interface GymSession {
  id: string;
  user_id: string;
  mode: 'debate' | 'steelman' | 'brainstorm' | 'solve';
  topic: string;
  transcript: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>;
  depth_earned: number;
  feedback_rubric: {
    score: number;
    critique: string;
    strengths: string;
    gaps: string;
  } | null;
  completed: boolean;
  created_at: string;
  completed_at?: string;
}

// Fallback key for localStorage
const LOCAL_GYM_SESSIONS_KEY = 'nuance_local_gym_sessions';

// Helper to check if a Supabase error indicates a missing table
function isMissingTableError(error: any): boolean {
  if (!error) return false;
  const msg = error.message || '';
  return msg.includes('Could not find the table') || msg.includes('relation') || msg.includes('does not exist');
}

/**
 * Retrieves all Gym sessions for a user.
 * Transparently falls back to localStorage if the database table is missing.
 */
export async function getGymSessions(userId: string): Promise<GymSession[]> {
  try {
    const { data, error } = await supabase
      .from('gym_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      if (isMissingTableError(error)) {
        console.warn('gym_sessions table missing. Loading from localStorage instead.');
        return getLocalGymSessions(userId);
      }
      throw error;
    }
    return (data || []) as GymSession[];
  } catch (err) {
    console.error('Error fetching gym sessions:', err);
    return getLocalGymSessions(userId);
  }
}

/**
 * Creates a new Gym session.
 * Transparently falls back to localStorage if the database table is missing.
 */
export async function createGymSession(
  userId: string,
  mode: 'debate' | 'steelman' | 'brainstorm' | 'solve',
  topic: string
): Promise<GymSession> {
  const initialTranscript: Array<{ role: 'user' | 'assistant' | 'system'; content: string }> = [];

  // Set up initial message depending on mode
  if (mode === 'debate') {
    initialTranscript.push({
      role: 'assistant',
      content: `Let's debate: "${topic}". What is your stance, and what evidence supports it?`
    });
  } else if (mode === 'steelman') {
    // Start with a flawed version of the argument
    initialTranscript.push({
      role: 'assistant',
      content: `Here is a weak argument regarding "${topic}":\n\n"We shouldn't invest in this topic because it is boring and probably doesn't work anyway."\n\nHow would you steelman this argument to represent its strongest logical form?`
    });
  } else {
    initialTranscript.push({
      role: 'assistant',
      content: `Welcome to the Gym. Let's analyze: "${topic}". Please share your initial thoughts.`
    });
  }

  const newSessionData = {
    user_id: userId,
    mode,
    topic,
    transcript: initialTranscript,
    depth_earned: 0,
    feedback_rubric: null,
    completed: false,
    created_at: new Date().toISOString()
  };

  try {
    const { data, error } = await supabase
      .from('gym_sessions')
      .insert(newSessionData)
      .select()
      .single();

    if (error) {
      if (isMissingTableError(error)) {
        console.warn('gym_sessions table missing. Creating in localStorage instead.');
        return createLocalGymSession(userId, mode, topic, initialTranscript);
      }
      throw error;
    }
    return data as GymSession;
  } catch (err) {
    console.error('Error creating gym session:', err);
    return createLocalGymSession(userId, mode, topic, initialTranscript);
  }
}

/**
 * Updates an active Gym session.
 * Transparently falls back to localStorage if the database table is missing.
 */
export async function updateGymSession(
  sessionId: string,
  updates: Partial<Omit<GymSession, 'id' | 'user_id'>>
): Promise<void> {
  // If the session ID is a local format (e.g. prefixed with local_), update locally
  if (sessionId.startsWith('local_')) {
    updateLocalGymSession(sessionId, updates);
    return;
  }

  try {
    const { error } = await supabase
      .from('gym_sessions')
      .update(updates)
      .eq('id', sessionId);

    if (error) {
      if (isMissingTableError(error)) {
        updateLocalGymSession(sessionId, updates);
        return;
      }
      throw error;
    }
  } catch (err) {
    console.error('Error updating gym session:', err);
    updateLocalGymSession(sessionId, updates);
  }
}

/**
 * Recalculates and saves user profile statistics, adding the depth points.
 */
export async function recordGymDepth(userId: string, depthEarned: number): Promise<void> {
  try {
    // 1. Fetch current profile
    const { data: profile, error: fetchError } = await supabase
      .from('profiles')
      .select('total_shards, total_depth')
      .eq('id', userId)
      .single();

    if (fetchError) throw fetchError;

    const currentShards = profile?.total_shards || 0;
    const currentDepth = profile?.total_depth || 0;

    const newDepth = currentDepth + depthEarned;
    const newAcuity = currentShards + newDepth;

    // 2. Attempt update
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        total_depth: newDepth,
        acuity_score: newAcuity
      })
      .eq('id', userId);

    if (updateError) {
      // If columns don't exist yet, we'll log it and let it fall back
      console.warn('Could not update total_depth in remote database profile (migration might not be run).');
    }
  } catch (err) {
    console.error('Error recording gym depth:', err);
  }
}

// ==========================================
// LOCAL STORAGE FALLBACK IMPLEMENTATION
// ==========================================

function getLocalGymSessions(userId: string): GymSession[] {
  try {
    const stored = localStorage.getItem(LOCAL_GYM_SESSIONS_KEY);
    if (!stored) return [];
    const allSessions = JSON.parse(stored) as GymSession[];
    return allSessions.filter(s => s.user_id === userId);
  } catch (e) {
    console.error('Error parsing local sessions:', e);
    return [];
  }
}

function createLocalGymSession(
  userId: string,
  mode: 'debate' | 'steelman' | 'brainstorm' | 'solve',
  topic: string,
  initialTranscript: any[]
): GymSession {
  const session: GymSession = {
    id: `local_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    user_id: userId,
    mode,
    topic,
    transcript: initialTranscript,
    depth_earned: 0,
    feedback_rubric: null,
    completed: false,
    created_at: new Date().toISOString()
  };

  try {
    const stored = localStorage.getItem(LOCAL_GYM_SESSIONS_KEY);
    const allSessions = stored ? JSON.parse(stored) : [];
    allSessions.unshift(session);
    localStorage.setItem(LOCAL_GYM_SESSIONS_KEY, JSON.stringify(allSessions));
  } catch (e) {
    console.error('Error saving local session:', e);
  }

  return session;
}

function updateLocalGymSession(
  sessionId: string,
  updates: Partial<Omit<GymSession, 'id' | 'user_id'>>
): void {
  try {
    const stored = localStorage.getItem(LOCAL_GYM_SESSIONS_KEY);
    if (!stored) return;
    const allSessions = JSON.parse(stored) as GymSession[];
    const idx = allSessions.findIndex(s => s.id === sessionId);
    if (idx !== -1) {
      allSessions[idx] = {
        ...allSessions[idx],
        ...updates
      };
      localStorage.setItem(LOCAL_GYM_SESSIONS_KEY, JSON.stringify(allSessions));
    }
  } catch (e) {
    console.error('Error updating local session:', e);
  }
}
