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

  useEffect(() => {
    if (!userId) { setLoading(false); return; }

    supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
      .then(({ data, error: err }) => {
        if (err) setError(err.message);
        else setProfile(data as Profile);
        setLoading(false);
      });
  }, [userId]);

  return { profile, loading, error };
}
