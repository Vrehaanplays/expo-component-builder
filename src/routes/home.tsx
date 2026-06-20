import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PhoneFrame, StatusBar } from "@/components/PhoneFrame";
import { BottomNav } from "@/components/BottomNav";
import { useAuthContext } from "@/lib/auth-context";
import { useProfile } from "@/hooks/use-profile";
import { supabase } from "@/lib/supabase";
import { getOrCreateDailyScenario, getLocalDateString, hasPlayedScenario, getScenarioSessionCount, getRankTier } from "@/lib/game-service";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { Lock, Unlock, CheckCircle2, ArrowRight } from "lucide-react";


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
  const [showConfirmEarly, setShowConfirmEarly] = useState(false);
  const [showPointsInfo, setShowPointsInfo] = useState(false);

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
        <button
          onClick={() => setShowPointsInfo(true)}
          className="flex items-center gap-1.5 border border-[rgba(245,217,126,0.18)] bg-[rgba(245,217,126,0.08)] rounded-full px-3.5 py-1.5 font-mono text-[13px] font-medium text-[var(--accent-starlight)] transition-all duration-150 active:scale-[0.95] hover:bg-[rgba(245,217,126,0.12)] cursor-pointer outline-none"
        >
          <span className="text-[14px]">⚡</span>
          <span>{isLoading ? "—" : `${shards.toLocaleString()} shards`}</span>
        </button>
      </header>

      <div className="flex-1 overflow-y-auto px-5 pb-6">
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
              <div className="flex items-center gap-2 mb-3">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[rgba(52,211,153,0.12)] border border-[rgba(52,211,153,0.25)] text-[var(--color-bloom)]">
                  <CheckCircle2 size={14} />
                </div>
                <span className="text-[12px] font-bold uppercase tracking-[0.06em] text-[var(--color-bloom)]">Completed tomorrow early</span>
              </div>
              <p className="text-[14px] leading-relaxed text-[var(--txt-secondary)]">
                You've locked in tomorrow's early reward. The next new scenario unlocks in <span className="text-[var(--txt-primary)] font-mono font-bold">{timeLeft}</span>.
              </p>
            </div>
          ) : (
            <div
              onClick={() => setShowConfirmEarly(true)}
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
              <div className="flex items-center gap-2 mb-3">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[rgba(167,139,250,0.12)] border border-[rgba(167,139,250,0.25)] text-[var(--color-spark)]">
                  <Unlock size={14} />
                </div>
                <span className="text-[12px] font-bold uppercase tracking-[0.06em] text-[var(--color-spark)]">Play tomorrow early</span>
              </div>
              <p className="text-[14px] leading-relaxed text-[var(--txt-primary)]">
                Get tomorrow's scenario right now. Keep sharpening your logic.
              </p>
              <div className="mt-4 flex items-center justify-between border-t border-[rgba(255,255,255,0.06)] pt-3.5">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[11px] text-[var(--txt-ghost)] uppercase tracking-wider font-semibold">Reward Multiplier</span>
                  <span className="text-[13px] font-medium text-[var(--color-spark)]">⚡ 75 shards <span className="text-[var(--txt-ghost)] text-[12px]">(-50%)</span></span>
                </div>
                <div className="flex items-center gap-1.5 text-[var(--color-spark)] font-semibold text-[14px]">
                  <span>Unlock early</span>
                  <ArrowRight size={16} />
                </div>
              </div>
            </div>
          )
        ) : (
          <div
            className="gmj-glass gmj-float gmj-float-d4 p-5 relative overflow-hidden"
            style={{
              opacity: 0.6,
              pointerEvents: "none",
              border: "1px solid rgba(255,255,255,0.08)",
              boxShadow: "none"
            }}
          >
            <div className="flex items-center gap-2 mb-3">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] text-[var(--txt-ghost)]">
                <Lock size={14} />
              </div>
              <span className="text-[12px] font-bold uppercase tracking-[0.06em] text-[var(--txt-ghost)]">More tomorrow</span>
            </div>
            <p className="text-[14px] leading-relaxed text-[var(--txt-secondary)]">
              Complete today's challenge to unlock early play. Next scenario ready in <span className="font-mono font-bold text-[var(--txt-primary)]">{timeLeft}</span>.
            </p>
          </div>
        )}
      </div>

      <AlertDialog open={showConfirmEarly} onOpenChange={setShowConfirmEarly}>
        <AlertDialogContent className="bg-[var(--glass-bg)] border border-[var(--glass-border)] text-left rounded-[24px] max-w-[90%] sm:max-w-md" style={{ backdropFilter: "blur(24px)", boxShadow: "0 20px 50px rgba(0,0,0,0.5)" }}>
          <AlertDialogHeader>
            <AlertDialogTitle className="gmj-heading text-[20px] text-[var(--txt-primary)] flex items-center gap-2">
              <span>⚠️</span> Play Tomorrow Early?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-[14px] leading-relaxed text-[var(--txt-secondary)] mt-2">
              You are unlocking tomorrow's daily scenario ahead of time.
              <br /><br />
              - **Reward**: You will receive **50% points (75 ⚡)** for a correct answer.
              <br />
              - **Alternative**: Wait **{timeLeft}** until local midnight to play it for the full **150 ⚡** reward.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex flex-col gap-2 mt-4 sm:flex-row sm:justify-end">
            <AlertDialogCancel 
              className="gmj-btn gmj-btn-outline w-full sm:w-auto border-[var(--glass-border)] hover:bg-[rgba(255,255,255,0.05)] text-[var(--txt-ghost)] animate-none"
              onClick={() => setShowConfirmEarly(false)}
            >
              Wait till tomorrow
            </AlertDialogCancel>
            <AlertDialogAction 
              className="gmj-btn gmj-btn-primary w-full sm:w-auto"
              onClick={() => {
                setShowConfirmEarly(false);
                navigate({ to: "/scenario", search: { date: tomorrowDateStr, early: "true" } });
              }}
            >
              Play now (+75 ⚡)
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showPointsInfo} onOpenChange={setShowPointsInfo}>
        <AlertDialogContent className="bg-[var(--glass-bg)] border border-[var(--glass-border)] text-left rounded-[24px] max-w-[90%] sm:max-w-md overflow-hidden" style={{ backdropFilter: "blur(24px)", boxShadow: "0 20px 50px rgba(0,0,0,0.5)" }}>
          <AlertDialogHeader>
            <AlertDialogTitle className="gmj-heading text-[20px] text-[var(--accent-starlight)] flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[rgba(245,217,126,0.12)] border border-[rgba(245,217,126,0.25)] text-xs">⚡</span> 
              <span>How Shards Work</span>
            </AlertDialogTitle>
            <div className="text-[14px] leading-relaxed text-[var(--txt-secondary)] mt-3 space-y-4">
              <p>
                Shards (⚡) are the currency of rational debate. Collect them to build your reputation and advance your tier.
              </p>
              <div className="space-y-2.5 border-t border-[rgba(255,255,255,0.06)] pt-3">
                <div className="flex justify-between items-center text-[13px]">
                  <span className="text-[var(--txt-primary)] font-semibold">🧩 Daily Challenge Correct</span>
                  <span className="font-mono text-[var(--accent-bloom)] font-bold">+150 ⚡</span>
                </div>
                <div className="flex justify-between items-center text-[13px]">
                  <span className="text-[var(--txt-primary)] font-semibold">⚠️ Play Tomorrow Early</span>
                  <span className="font-mono text-[var(--color-spark)] font-bold">+75 ⚡</span>
                </div>
              </div>
              
              <div className="border-t border-[rgba(255,255,255,0.06)] pt-3">
                <span className="text-[11px] font-bold text-[var(--txt-ghost)] uppercase tracking-wider block mb-2">Rank Progression</span>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 font-mono text-[12px]">
                  <div className="flex justify-between border-b border-[rgba(255,255,255,0.04)] pb-0.5">
                    <span className="text-[var(--txt-ghost)]">Initiate</span>
                    <span className="text-[var(--txt-primary)]">0+</span>
                  </div>
                  <div className="flex justify-between border-b border-[rgba(255,255,255,0.04)] pb-0.5">
                    <span className="text-[var(--txt-ghost)]">Steelmanner</span>
                    <span className="text-[var(--txt-primary)]">1.5k+</span>
                  </div>
                  <div className="flex justify-between border-b border-[rgba(255,255,255,0.04)] pb-0.5">
                    <span className="text-[var(--txt-ghost)]">Analyst</span>
                    <span className="text-[var(--txt-primary)]">500+</span>
                  </div>
                  <div className="flex justify-between border-b border-[rgba(255,255,255,0.04)] pb-0.5">
                    <span className="text-[var(--txt-ghost)]">Dialectician</span>
                    <span className="text-[var(--txt-primary)]">3k+</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--txt-ghost)]">Rationalist</span>
                    <span className="text-[var(--txt-primary)]">6k+</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--txt-ghost)]">Grandmaster</span>
                    <span className="text-[var(--txt-primary)]">10k+</span>
                  </div>
                </div>
              </div>
            </div>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4">
            <AlertDialogAction 
              className="gmj-btn gmj-btn-primary w-full"
              onClick={() => setShowPointsInfo(false)}
            >
              Understand
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <BottomNav />
    </PhoneFrame>
  );
}

