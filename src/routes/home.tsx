import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { PhoneFrame, StatusBar } from "@/components/PhoneFrame";
import { BottomNav } from "@/components/BottomNav";
import { useAuthContext } from "@/lib/auth-context";
import { useProfile } from "@/hooks/use-profile";

export const Route = createFileRoute("/home")({
  component: Home,
  head: () => ({ meta: [{ title: "GMJ — Today's challenge" }] }),
});

function Home() {
  const navigate = useNavigate();
  const { user, session, loading: authLoading } = useAuthContext();
  const { profile, loading: profileLoading } = useProfile(user?.id);

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!authLoading && !session) navigate({ to: "/auth" });
  }, [authLoading, session, navigate]);

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

        <Link
          to="/scenario"
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
            "Studies show multitasking boosts productivity — so open more tabs."
          </h3>
          <div className="flex items-center justify-between">
            <span className="text-[13px] text-[var(--txt-ghost)]">🧑 2,341 played today</span>
            <span className="text-[13px] font-bold tracking-wide text-[var(--accent-arctic)]">Tap to start →</span>
          </div>
        </Link>

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
            <span>Play to rank</span>
          </div>
        </Link>

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
            Complete today's challenge to unlock the next one.
          </p>
        </div>
      </div>

      <BottomNav />
    </PhoneFrame>
  );
}
