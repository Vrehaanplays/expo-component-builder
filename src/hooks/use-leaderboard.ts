import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Profile } from './use-profile';

export function useLeaderboard(tab: 'today' | 'all') {
  const [leaderboard, setLeaderboard] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);
      setError(null);
      try {
        if (tab === 'all') {
          let response = await supabase
            .from('profiles')
            .select('*')
            .order('acuity_score', { ascending: false })
            .limit(50);

          if (response.error) {
            console.warn('Leaderboard acuity_score sort failed, falling back to total_shards:', response.error.message);
            response = await supabase
              .from('profiles')
              .select('*')
              .order('total_shards', { ascending: false })
              .limit(50);
          }

          if (response.error) throw response.error;

          const profilesList = (response.data || []).map((p: any) => {
            const depth = p.total_depth || 0;
            const acuity = p.acuity_score || (p.total_shards + depth);
            return {
              ...p,
              total_depth: depth,
              acuity_score: acuity,
              // Overwrite total_shards display in leaderboard with acuity_score
              total_shards: acuity
            };
          });

          // Re-sort locally in case we fell back to total_shards and local acuity calculation changed the rank order
          profilesList.sort((a, b) => b.total_shards - a.total_shards);

          setLeaderboard(profilesList as Profile[]);
        } else {
          // Today's local date start timezone-agnostic query
          const startOfToday = new Date();
          startOfToday.setHours(0, 0, 0, 0);

          const { data: sessions, error: sErr } = await supabase
            .from('sessions')
            .select('user_id, shards_earned')
            .gte('played_at', startOfToday.toISOString());

          if (sErr) throw sErr;

          if (!sessions || sessions.length === 0) {
            setLeaderboard([]);
            return;
          }

          const uniqueUserIds = Array.from(new Set(sessions.map((s: any) => s.user_id)));
          const { data: profiles, error: pErr } = await supabase
            .from('profiles')
            .select('id, username, current_streak')
            .in('id', uniqueUserIds);

          if (pErr) throw pErr;

          const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);
          const userMap: Record<string, Profile> = {};

          sessions.forEach((s: any) => {
            const userId = s.user_id;
            const prof = profileMap.get(userId);
            const username = prof?.username || 'Anonymous';
            const streak = prof?.current_streak || 0;
            const shards = s.shards_earned || 0;

            if (!userMap[userId]) {
              userMap[userId] = {
                id: userId,
                username,
                current_streak: streak,
                total_shards: 0,
                longest_streak: 0,
                sessions_played: 0,
                accuracy_percent: 0,
                rank_position: null
              };
            }
            userMap[userId].total_shards += shards;
          });

          const sortedList = Object.values(userMap)
            .sort((a, b) => b.total_shards - a.total_shards)
            .map((item, index) => ({
              ...item,
              rank_position: index + 1
            }));

          setLeaderboard(sortedList);
        }
      } catch (err: any) {
        console.error('Error loading leaderboard:', err);
        setError(err.message || 'Failed to load leaderboard');
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [tab]);

  return { leaderboard, loading, error };
}
