import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { User, Session, AuthError } from '@supabase/supabase-js';

export interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true,
  });

  useEffect(() => {
    const handleHashAuth = async () => {
      try {
        if (typeof window !== 'undefined' && window.location.hash) {
          // Check if hash contains access token
          const hash = window.location.hash.substring(1);
          const params = new URLSearchParams(hash);
          const accessToken = params.get('access_token');
          const refreshToken = params.get('refresh_token');

          if (accessToken) {
            const { data, error } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken || '',
            });
            if (error) {
              console.error('Error setting session from hash:', error.message);
            } else if (data.session) {
              setState({ user: data.session.user, session: data.session, loading: false });
              // Clean the hash from the URL
              window.history.replaceState(
                null,
                '',
                window.location.pathname + window.location.search
              );
              return;
            }
          }
        }
      } catch (err) {
        console.error('Failed to parse hash parameters:', err);
      }

      // Default load if hash didn't contain auth session
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setState({ user: session?.user ?? null, session, loading: false });
      } catch (err) {
        console.error('Error getting initial session:', err);
        setState(prev => ({ ...prev, loading: false }));
      }
    };

    handleHashAuth();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setState({ user: session?.user ?? null, session, loading: false });
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, username: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { username } },
    });
    return { data, error };
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    return { data, error };
  };

  const signInWithGoogle = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/home` },
    });
    return { data, error };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  };

  return { ...state, signUp, signIn, signInWithGoogle, signOut };
}

export type UseAuth = ReturnType<typeof useAuth>;
