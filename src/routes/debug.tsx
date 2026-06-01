import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PhoneFrame, StatusBar } from "@/components/PhoneFrame";
import { useAuthContext } from "@/lib/auth-context";
import { useProfile } from "@/hooks/use-profile";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/debug")({
  component: DebugDashboard,
  head: () => ({ meta: [{ title: "Nuance — Testing Dashboard" }] }),
});

const SQL_CODE = `-- Run this in your Supabase SQL Editor:

-- 1. Allow users to delete their own sessions (for reset functionality)
create policy "Users can delete their own sessions" on public.sessions
  for delete using (auth.uid() = user_id);

-- 2. Create the seed_leaderboard helper function
create or replace function public.seed_leaderboard()
returns void as $$
declare
  new_id uuid;
  usernames text[] := array['logic_ninja', 'steelman_pro', 'bias_hunter', 'fallacy_cop', 'reason_king', 'dialect_queen', 'judgment_day', 'sharp_thinker', 'mind_gym_guy', 'rational_prime'];
  shards integer[] := array[12500, 8400, 6200, 4800, 3100, 2400, 1850, 1200, 750, 300];
  streaks integer[] := array[14, 9, 7, 12, 4, 6, 8, 3, 5, 2];
  accuracies double precision[] := array[92.5, 87.0, 81.2, 85.5, 76.0, 78.4, 80.0, 69.5, 72.0, 60.0];
  sessions integer[] := array[45, 32, 28, 25, 18, 15, 12, 10, 8, 5];
  i integer;
begin
  -- Clear previous mock users if any
  delete from auth.users where email like '%@mock.gmj.com';

  for i in 1..10 loop
    new_id := gen_random_uuid();
    -- Insert user into auth.users (to satisfy foreign key)
    insert into auth.users (id, email, encrypted_password, email_confirmed_at, raw_user_meta_data, created_at, updated_at, role, aud)
    values (
      new_id,
      usernames[i] || '@mock.gmj.com',
      '$2a$10$abcdefghijklmnopqrstuv',
      now(),
      jsonb_build_object('username', usernames[i]),
      now(),
      now(),
      'authenticated',
      'authenticated'
    );
    
    update public.profiles
    set
      username = usernames[i],
      total_shards = shards[i],
      current_streak = streaks[i],
      longest_streak = streaks[i] + 2,
      sessions_played = sessions[i],
      accuracy_percent = accuracies[i]
    where id = new_id;
  end loop;
end;
$$ language plpgsql security definer;

-- 3. Allow public inserts for scenarios (for client-side Gemini generation)
create policy "Anyone can insert scenarios" on public.scenarios
  for insert with check (true);

-- 4. Allow public daily challenges mapping
create policy "Anyone can insert daily challenges" on public.daily_challenges
  for insert with check (true);

-- 5. Create clear_mock_users helper function
create or replace function public.clear_mock_users()
returns void as $$
begin
  delete from auth.users where email like '%@mock.gmj.com';
end;
$$ language plpgsql security definer;`;function DebugDashboard() {
  const navigate = useNavigate();
  const { user, session, loading: authLoading } = useAuthContext();
  const { profile, refetch } = useProfile(user?.id);
  const [status, setStatus] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loginMsg, setLoginMsg] = useState<string | null>(null);

  // We DO NOT redirect to /auth if there is no session.
  // This allows the debug page to be loaded directly when logged out.

  const handleQuickLogin = async () => {
    setStatus(null);
    setErrorMsg(null);
    setLoginMsg("Attempting quick login...");
    setLoading(true);
    try {
      const testEmail = "tester_verified@gmj.com";
      const testPass = "password123";
      
      const { error } = await supabase.auth.signInWithPassword({
        email: testEmail,
        password: testPass,
      });

      if (error) {
        if (error.message.includes("Invalid login credentials") || error.message.includes("Email not confirmed")) {
          setLoginMsg("Test account not found. Creating a new one...");
          const { error: signUpErr } = await supabase.auth.signUp({
            email: testEmail,
            password: testPass,
            options: { data: { username: "ArenaTester" } }
          });
          
          if (signUpErr) throw signUpErr;
          
          const { error: signInErr } = await supabase.auth.signInWithPassword({
            email: testEmail,
            password: testPass,
          });
          
          if (signInErr) throw signInErr;
          setLoginMsg("Registered and logged in as ArenaTester!");
        } else {
          throw error;
        }
      } else {
        setLoginMsg("Logged in successfully as tester!");
      }
      
      await refetch();
      setTimeout(() => navigate({ to: "/home" }), 1000);
    } catch (e: any) {
      console.error(e);
      setErrorMsg(e.message || "Quick login failed.");
      setLoginMsg(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSeed = async () => {
    setStatus(null);
    setErrorMsg(null);
    setLoading(true);
    try {
      const { error } = await supabase.rpc("seed_leaderboard");
      if (error) {
        console.error(error);
        setErrorMsg(
          "RPC execution failed. Make sure you have run the SQL code snippet below in your Supabase SQL editor to create the helper function!"
        );
      } else {
        setStatus("Leaderboard seeded successfully with 10 mock users!");
      }
    } catch (e: any) {
      setErrorMsg(e.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleClearMockUsers = async () => {
    setStatus(null);
    setErrorMsg(null);
    setLoading(true);
    try {
      const { error } = await supabase.rpc("clear_mock_users");
      if (error) {
        console.error(error);
        setErrorMsg(
          "RPC execution failed. Make sure you have run the SQL code snippet below in your Supabase SQL editor to create the clear_mock_users helper function!"
        );
      } else {
        setStatus("All mock users successfully deleted from auth and profiles!");
      }
    } catch (e: any) {
      setErrorMsg(e.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetStats = async () => {
    if (!user) return;
    setStatus(null);
    setErrorMsg(null);
    setLoading(true);
    try {
      const { error: deleteErr } = await supabase
        .from("sessions")
        .delete()
        .eq("user_id", user.id);

      if (deleteErr) {
        console.error(deleteErr);
        setErrorMsg(
          "Failed to delete sessions. Make sure you run the SQL code below to enable the DELETE policy on public.sessions!"
        );
        setLoading(false);
        return;
      }

      const { error: profileErr } = await supabase
        .from("profiles")
        .update({
          total_shards: 0,
          current_streak: 0,
          longest_streak: 0,
          sessions_played: 0,
          accuracy_percent: 0,
        })
        .eq("id", user.id);

      if (profileErr) {
        throw profileErr;
      }

      await refetch();
      setStatus("Your stats have been reset to 0 and all played sessions deleted!");
    } catch (e: any) {
      setErrorMsg(e.message || "An error occurred while resetting stats.");
    } finally {
      setLoading(false);
    }
  };

  const handleClearChallenges = async () => {
    setStatus(null);
    setErrorMsg(null);
    setLoading(true);
    try {
      const { error } = await supabase
        .from("daily_challenges")
        .delete()
        .neq("id", "00000000-0000-0000-0000-000000000000");

      if (error) throw error;
      setStatus("Daily challenge mappings cleared! Returning home will generate fresh scenarios.");
    } catch (e: any) {
      setErrorMsg(e.message || "An error occurred while clearing challenges.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddShards = async (amount: number) => {
    if (!user || !profile) return;
    setStatus(null);
    setErrorMsg(null);
    setLoading(true);
    try {
      const newShards = (profile.total_shards || 0) + amount;
      const { error } = await supabase
        .from("profiles")
        .update({ total_shards: newShards })
        .eq("id", user.id);

      if (error) throw error;
      await refetch();
      setStatus(`Added +${amount} shards! New total: ${newShards}`);
    } catch (e: any) {
      setErrorMsg(e.message || "An error occurred while adding shards.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PhoneFrame>
      <StatusBar />
      <div className="flex flex-shrink-0 items-center justify-between px-6 py-4">
        <Link
          to={user ? "/profile" : "/auth"}
          className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-[var(--glass-bg)] border border-[var(--glass-border)] text-xl text-[var(--txt-primary)] transition-all active:scale-95 text-decoration-none"
        >
          ←
        </Link>
        <span className="gmj-heading text-[18px]">Test Dashboard</span>
        <div className="w-10" />
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-8 pt-2">
        {status && (
          <div className="mb-4 rounded-[14px] bg-[rgba(52,211,153,0.08)] border border-[var(--color-bloom)] p-4 text-[14px] text-[var(--color-bloom)] font-semibold">
            {status}
          </div>
        )}

        {errorMsg && (
          <div className="mb-4 rounded-[14px] bg-[rgba(248,113,113,0.08)] border border-[var(--color-coral)] p-4 text-[13px] leading-relaxed text-[var(--color-coral)] font-medium">
            {errorMsg}
          </div>
        )}

        {!user && (
          <div className="mb-6 rounded-[20px] bg-[rgba(59,130,246,0.08)] border border-[rgba(59,130,246,0.25)] p-5 text-left">
            <div className="text-[12px] uppercase font-bold tracking-wider text-[var(--color-arctic)] mb-2">
              🔑 Quick Test Login (Auth Bypass)
            </div>
            <p className="text-[13px] leading-relaxed text-[var(--txt-secondary)] mb-4">
              Instantly log in to a pre-configured test account to bypass manual email registration.
            </p>
            {loginMsg && (
              <div className="mb-3 text-[12px] font-semibold text-[var(--color-bloom)]">
                {loginMsg}
              </div>
            )}
            <button
              className="gmj-btn gmj-btn-primary w-full py-3 text-[14px]"
              onClick={handleQuickLogin}
              disabled={loading}
            >
              🚀 Bypass Auth & Login
            </button>
          </div>
        )}

        <div className="mb-6 rounded-[20px] bg-[var(--glass-bg)] border border-[var(--glass-border)] p-5">
          <div className="text-[12px] uppercase font-semibold tracking-wider text-[var(--txt-ghost)] mb-4">
            Dynamic profile stats
          </div>
          {user ? (
            <div className="grid grid-cols-2 gap-3 text-left">
              <div>
                <div className="text-[11px] text-[var(--txt-ghost)]">Username</div>
                <div className="text-[14px] font-bold text-[var(--txt-primary)]">{profile?.username || "—"}</div>
              </div>
              <div>
                <div className="text-[11px] text-[var(--txt-ghost)]">Total Shards</div>
                <div className="text-[14px] font-bold text-[var(--color-arctic)]">⚡ {profile?.total_shards ?? 0}</div>
              </div>
              <div>
                <div className="text-[11px] text-[var(--txt-ghost)]">Streak</div>
                <div className="text-[14px] font-bold text-[var(--color-starlight)]">🔥 {profile?.current_streak ?? 0} days</div>
              </div>
              <div>
                <div className="text-[11px] text-[var(--txt-ghost)]">Global Rank</div>
                <div className="text-[14px] font-bold text-[var(--txt-primary)]">#{profile?.rank_position ?? "Unranked"}</div>
              </div>
            </div>
          ) : (
            <div className="text-center text-[13px] py-2 text-[var(--txt-ghost)] font-medium">
              🔒 Log in to view and edit profile stats
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3 mb-6">
          <button
            className="gmj-btn gmj-btn-primary"
            onClick={handleSeed}
            disabled={loading}
          >
            👥 Seed Leaderboard (10 Users)
          </button>

          <button
            className="gmj-btn gmj-btn-ghost text-left flex justify-between items-center"
            onClick={handleClearMockUsers}
            disabled={loading}
          >
            <span>🧹 Clear All Mock Users</span>
            <span className="text-[11px] text-[var(--color-coral)]">Clean Leaderboard</span>
          </button>

          <button
            className="gmj-btn gmj-btn-ghost text-left flex justify-between items-center"
            onClick={handleResetStats}
            disabled={loading || !user}
          >
            <span>🔄 Reset My Current Stats</span>
            <span className="text-[11px] text-[var(--color-coral)]">{user ? "Danger" : "Requires Login"}</span>
          </button>

          <button
            className="gmj-btn gmj-btn-ghost text-left flex justify-between items-center"
            onClick={handleClearChallenges}
            disabled={loading}
          >
            <span>🧹 Clear Daily Challenges</span>
            <span className="text-[11px] text-[var(--txt-ghost)]">Regen scenarios</span>
          </button>

          <div className="flex gap-2 mt-1">
            <button
              className="gmj-btn gmj-btn-outline flex-1 text-[13px] py-3.5"
              onClick={() => handleAddShards(150)}
              disabled={loading || !user}
            >
              ⚡ Add +150 Shards
            </button>
            <button
              className="gmj-btn gmj-btn-outline flex-1 text-[13px] py-3.5"
              onClick={() => handleAddShards(1500)}
              disabled={loading || !user}
            >
              👑 Add +1500 Shards
            </button>
          </div>
        </div>

        <div className="rounded-[20px] bg-[rgba(10,14,26,0.5)] border border-[rgba(255,255,255,0.06)] p-5 text-left">
          <div className="text-[12px] uppercase font-semibold tracking-wider text-[var(--txt-ghost)] mb-2">
            Supabase setup instruction
          </div>
          <p className="text-[13px] leading-relaxed text-[var(--txt-secondary)] mb-4">
            If you get RPC errors during seeding or deletes, copy the SQL below and run it in the <strong>SQL Editor</strong> on your Supabase dashboard:
          </p>
          <pre className="p-3 bg-[rgba(0,0,0,0.4)] border border-[rgba(255,255,255,0.08)] rounded-[10px] text-[11px] font-mono text-[var(--color-arctic)] overflow-x-auto whitespace-pre leading-relaxed select-all">
            {SQL_CODE}
          </pre>
        </div>
      </div>
    </PhoneFrame>
  );
}
