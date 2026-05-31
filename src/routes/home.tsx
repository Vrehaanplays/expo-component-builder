import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PhoneFrame, StatusBar } from "@/components/PhoneFrame";
import { BottomNav } from "@/components/BottomNav";
import { useAuthContext } from "@/lib/auth-context";
import { useProfile } from "@/hooks/use-profile";
import { supabase } from "@/lib/supabase";
import { getOrCreateDailyScenario, getLocalDateString, hasPlayedScenario, getScenarioSessionCount } from "@/lib/game-service";

export const Route = createFileRoute("/home")({
  loader: async () => {
    const dateStr = getLocalDateString(0);
    const scenario = await getOrCreateDailyScenario(dateStr);
    
    // Fetch tomorrow's scenario
    const tomorrowDateStr = getLocalDateString(1);
    const tomorrowScenario = await getOrCreateDailyScenario(tomorrowDateStr);

    return { scenario, dateStr, tomorrowScenario, tomorrowDateStr };
  },
  component: Home,
  head: () => ({ meta: [{ title: "Nuance — Today's challenge" }] }),
});

function Home() {
  const { scenario, dateStr, tomorrowScenario, tomorrowDateStr } = Route.useLoaderData();
  const navigate = useNavigate();
  const { user, session, loading: authLoading } = useAuthContext();
  const { profile, loading: profileLoading } = useProfile(user?.id);
  const [playedToday, setPlayedToday] = useState(false);
  const [playedTomorrow, setPlayedTomorrow] = useState(false);
  const [sessionsToday, setSessionsToday] = useState<number | null>(null);
  const [loadingChallenge, setLoadingChallenge] = useState(true);
  const [timeLeft, setTimeLeft] = useState("");

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!authLoading && !session) navigate({ to: "/auth" });
  }, [authLoading, session, navigate]);

  // Live countdown timer until local midnight
  useEffect(() => {
    const updateTimer = () => {
      const now = new Date();
      const tomorrowMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
      const diffMs = tomorrowMidnight.getTime() - now.getTime();
      
      const hours = Math.floor(diffMs / (1000 * 60 * 60));
      const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);
      
      setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!user || !scenario.id || !tomorrowScenario.id) return;

    const checkStatus = async () => {
      try {
        const played = await hasPlayedScenario(user.id, scenario.id);
        setPlayedToday(played);

        const playedTom = await hasPlayedScenario(user.id, tomorrowScenario.id);
        setPlayedTomorrow(playedTom);

        const count = await getScenarioSessionCount(scenario.id);
        setSessionsToday(count);
      } catch (err) {
        console.error("Error loading challenge status:", err);
      } finally {
        setLoadingChallenge(false);
      }
    };

    checkStatus();
  }, [user, scenario.id, tomorrowScenario.id]);

  const streak = profile?.current_streak ?? 0;
  const shards = profile?.total_shards ?? 0;
  const rank = profile?.rank_position;
  const isLoading = authLoading || profileLoading;

  return (
    <PhoneFrame>
      <StatusBar />

      <header className="gmj-float gmj-float-d1 flex flex-shrink-0 items-center justify-between px-6 pb-5 pt-2">
        <div className="gmj-streak">
          <span className="text-[14px]">🔥</span>
          <span>{isLoading ? "—" : `${streak} day streak`}</span>
        </div>
        <div className="text-right">
          <div className="gmj-stat-num text-[22px]">
            {isLoading ? "—" : shards.toLocaleString()}
          </div>
          <div className="gmj-stat-label">Total ⚡</div>
        </div>
      </header>

      <div className="flex-1 overflow-hidden px-5">
        <div className="gmj-float gmj-float-d2 mb-3 text-[11px] font-semibold uppercase tracking-[0.1em] text-[var(--color-spark)]">
          Today's challenge
        </div>

        {playedToday ? (
          <div
            className="gmj-float gmj-float-d3 relative mb-4 block overflow-hidden rounded-[22px] bg-[var(--glass-bg)] p-6"
            style={{
              backdropFilter: "blur(16px)",
              border: "1px solid var(--glass-border)",
              boxShadow: "0 8px 32px rgba(0,0,0,0.25)",
              opacity: 0.85
            }}
          >
            <span
              className="absolute left-0 right-0 top-0 h-[3px]"
              style={{
                background: "linear-gradient(90deg, var(--color-bloom) 0%, var(--accent-arctic) 100%)",
                boxShadow: "0 2px 12px rgba(74,234,220,0.4)"
              }}
            />
            <div className="gmj-tag mb-4">🧩 Argument</div>
            <h3 className="gmj-heading mb-6 text-[18px] leading-[1.4] text-[var(--txt-primary)]">
              "{scenario.scenario_text}"
            </h3>
            <div className="flex items-center justify-between">
              <span className="text-[13px] text-[var(--txt-ghost)]">🧑 {sessionsToday !== null ? sessionsToday : "—"} played today</span>
              <span className="text-[13px] font-bold tracking-wide text-[var(--color-bloom)]">✅ Completed</span>
            </div>
          </div>
        ) : (
          <Link
            to="/scenario"
            search={{ date: dateStr }}
            className="gmj-float gmj-float-d3 relative mb-4 block cursor-pointer overflow-hidden rounded-[22px] bg-[var(--glass-bg)] p-6 transition-all duration-200 active:scale-[0.97]"
            style={{
              backdropFilter: "blur(16px)",
              border: "1px solid var(--glass-border)",
              boxShadow: "0 8px 32px rgba(0,0,0,0.25)"
            }}
          >
            <span
              className="absolute left-0 right-0 top-0 h-[3px]"
              style={{
                background: "linear-gradient(90deg, var(--accent-arctic) 0%, #3DD4C8 100%)",
                boxShadow: "0 2px 12px rgba(74,234,220,0.4)"
              }}
            />
            <div className="gmj-tag mb-4">🧩 Argument</div>
            <h3 className="gmj-heading mb-6 text-[18px] leading-[1.4] text-[var(--txt-primary)]">
              "{scenario.scenario_text}"
            </h3>
            <div className="flex items-center justify-between">
              <span className="text-[13px] text-[var(--txt-ghost)]">🧑 {sessionsToday !== null ? sessionsToday : "—"} played today</span>
              <span className="text-[13px] font-bold tracking-wide text-[var(--accent-arctic)]">Tap to start →</span>
            </div>
          </Link>
        )}

        <Link
          to="/leaderboard"
          className="gmj-glass gmj-float gmj-float-d4 mb-4 flex items-center justify-between px-5 py-4"
        >
          <div>
            <div className="text-[12px] text-[var(--txt-ghost)]">Your global rank</div>
            <div className="gmj-stat-num text-[20px]">
              {isLoading ? "—" : rank ? `#${rank}` : "Unranked"}
            </div>
          </div>
          <div className="gmj-rank-pill">
            <span className="text-[14px]">▲</span>
            <span>{isLoading ? "—" : getRankTier(shards)}</span>
          </div>
        </Link>

        {/* Play Tomorrow Early Card */}
        {playedToday ? (
          playedTomorrow ? (
            <div
              className="gmj-glass gmj-float gmj-float-d4 mb-4 block p-5 relative overflow-hidden"
              style={{
                border: "1px solid var(--glass-border)",
                boxShadow: "0 8px 32px rgba(0,0,0,0.25)",
                opacity: 0.85
              }}
            >
              <span
                className="absolute left-0 right-0 top-0 h-[3px]"
                style={{
                  background: "linear-gradient(90deg, var(--color-bloom) 0%, var(--accent-arctic) 100%)",
                  boxShadow: "0 2px 12px rgba(52,211,153,0.4)"
                }}
              />
              <div
                className="gmj-tag mb-4"
                style={{
                  background: "rgba(52,211,153,0.15)",
                  borderColor: "rgba(52,211,153,0.3)",
                  color: "var(--color-bloom)",
                }}
              >
                ✅ Completed tomorrow early
              </div>
              <p className="text-[14px] leading-relaxed text-[var(--txt-secondary)]">
                You've already played tomorrow's scenario. Next challenge unlocks in <strong className="text-[var(--txt-primary)] font-mono">{timeLeft}</strong>.
              </p>
            </div>
          ) : (
            <Link
              to="/scenario"
              search={{ date: getLocalDateString(1), early: "true" }}
              className="gmj-glass gmj-float gmj-float-d4 mb-4 block p-5 cursor-pointer relative overflow-hidden transition-all duration-200 active:scale-[0.97]"
              style={{
                border: "1px solid var(--glass-border)",
                boxShadow: "0 8px 32px rgba(0,0,0,0.25)"
              }}
            >
              <span
                className="absolute left-0 right-0 top-0 h-[3px]"
                style={{
                  background: "linear-gradient(90deg, var(--color-spark) 0%, var(--accent-arctic) 100%)",
                  boxShadow: "0 2px 12px rgba(167,139,250,0.4)"
                }}
              />
              <div
                className="gmj-tag mb-4"
                style={{
                  background: "rgba(167,139,250,0.15)",
                  borderColor: "rgba(167,139,250,0.3)",
                  color: "var(--color-spark)",
                }}
              >
                🔓 Play tomorrow early
              </div>
              <p className="text-[14px] leading-relaxed text-[var(--txt-primary)] mb-4">
                Get tomorrow's scenario right now. Keep sharpening your logic.
              </p>
              <div className="flex items-center justify-between">
                <span className="text-[12px] text-[var(--color-starlight)]">⚡ 50% points (or wait {timeLeft} for full points)</span>
                <span className="text-[13px] font-bold tracking-wide text-[var(--color-spark)]">Tap to start →</span>
              </div>
            </Link>
          )
        ) : (
          <div
            className="gmj-glass gmj-float gmj-float-d4 p-5"
            style={{ opacity: 0.5, pointerEvents: "none" }}
          >
            <div
              className="gmj-tag mb-4"
              style={{
                background: "rgba(255,255,255,0.05)",
                borderColor: "rgba(255,255,255,0.1)",
                color: "var(--txt-ghost)",
              }}
            >
              🔒 More tomorrow
            </div>
            <p className="text-[14px] leading-relaxed text-[var(--txt-secondary)]">
              Complete today's challenge to unlock tomorrow's early play. Unlocks in <strong className="font-mono">{timeLeft}</strong>.
            </p>
          </div>
        )}
      </div>

      <BottomNav />
    </PhoneFrame>
  );
}
