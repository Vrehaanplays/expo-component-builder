import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export interface Profile {
  id: string;
  username: string;
  total_shards: number;
  current_streak: number;
  longest_streak: number;
  sessions_played: number;
  accuracy_percent: number;
  rank_position: number | null;
}

export function useProfile(userId: string | undefined) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = async () => {
    if (!userId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const { data, error: err } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (err) {
        setError(err.message);
        setProfile(null);
      } else if (data) {
        const profileData = data as Profile;

        // Dynamically compute the global leaderboard rank by counting profiles with more shards
        const { count, error: countErr } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .gt('total_shards', profileData.total_shards);

        if (!countErr) {
          profileData.rank_position = (count !== null ? count + 1 : 1);
        }

        setProfile(profileData);
      }
    } catch (e: any) {
      setError(e.message || 'An error occurred fetching profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [userId]);

  return { profile, loading, error, refetch: fetchProfile };
}
