import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export interface Profile {
  id: string;
  username: string;
  total_shards: number;
  total_depth?: number;
  acuity_score?: number;
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
        
        // Handle database fallback if total_depth / acuity_score columns don't exist yet
        const depth = profileData.total_depth || 0;
        profileData.total_depth = depth;
        
        // Calculate acuity score locally
        const acuity = profileData.acuity_score || (profileData.total_shards + depth);
        profileData.acuity_score = acuity;

        // Dynamically compute the global leaderboard rank by counting profiles with more acuity_score (or total_shards as fallback)
        const rankColumn = 'acuity_score' in profileData ? 'acuity_score' : 'total_shards';
        const rankValue = 'acuity_score' in profileData ? acuity : profileData.total_shards;

        const { count, error: countErr } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .gt(rankColumn, rankValue);

        if (!countErr) {
          profileData.rank_position = (count !== null ? count + 1 : 1);
        } else {
          // If query failed due to missing column, fall back to total_shards ranking
          const { count: shardCount, error: shardCountErr } = await supabase
            .from('profiles')
            .select('*', { count: 'exact', head: true })
            .gt('total_shards', profileData.total_shards);
          if (!shardCountErr) {
            profileData.rank_position = (shardCount !== null ? shardCount + 1 : 1);
          }
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

