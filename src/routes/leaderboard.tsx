import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PhoneFrame, StatusBar } from "@/components/PhoneFrame";
import { BottomNav } from "@/components/BottomNav";

import { useLeaderboard } from "@/hooks/use-leaderboard";
import { useAuthContext } from "@/lib/auth-context";
import { useProfile } from "@/hooks/use-profile";

export const Route = createFileRoute("/leaderboard")({
  component: Leaderboard,
  head: () => ({ meta: [{ title: "Nuance — Leaderboard" }] }),
});

const medalColors: Record<string, string> = {
  gold: "#FFD700",
  silver: "#C0C0C0",
  bronze: "#CD7F32",
};

function Leaderboard() {
  const [tab, setTab] = useState<"today" | "all">("today");
  const { leaderboard, loading: leaderboardLoading } = useLeaderboard(tab);
  const { user } = useAuthContext();
  const { profile } = useProfile(user?.id);

  return (
    <PhoneFrame>
      <StatusBar />
      <div className="flex-shrink-0 px-6 pb-4 pt-3">
        <h1 className="gmj-display mb-5 text-[28px]">Leaderboard</h1>
        <div className="flex gap-2">
          {(["today", "all"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className="rounded-[12px] border-none px-5 py-2.5 text-[14px] font-semibold transition-all duration-200"
              style={{
                background: tab === t ? "var(--color-arctic)" : "var(--glass-bg)",
                color: tab === t ? "var(--color-abyss)" : "var(--txt-ghost)",
                boxShadow: tab === t ? "0 4px 16px rgba(74,234,220,0.3)" : "none",
                border: tab === t ? "none" : "1px solid var(--glass-border)",
              }}
            >
              {t === "today" ? "Today" : "All time"}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-5">
        <div className="gmj-glass gmj-float gmj-float-d1 overflow-hidden">
          {leaderboardLoading ? (
            <div className="p-4 text-center text-[var(--txt-ghost)]">Loading...</div>
          ) : leaderboard.map((r, i) => {
            const rank = i + 1;
            const medal = rank === 1 ? "gold" : rank === 2 ? "silver" : rank === 3 ? "bronze" : null;
            const initials = r.username ? r.username.slice(0, 2).toUpperCase() : "??";
            return (
              <div key={r.id} className="flex items-center gap-4 border-b border-[var(--color-border)] px-4 py-3 last:border-b-0">
                <div
                  className="w-6 text-center font-mono text-[14px] font-bold"
                  style={{ color: medal ? medalColors[medal] : "var(--txt-ghost)" }}
                >
                  {rank}
                </div>
                <div
                  className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-[12px] text-[14px] font-bold"
                  style={{
                    background: medal
                      ? `${medalColors[medal]}1f`
                      : "rgba(255,255,255,0.06)",
                    color: medal ? medalColors[medal] : "var(--txt-primary)",
                    border: medal ? `1px solid ${medalColors[medal]}40` : "1px solid rgba(255,255,255,0.1)",
                  }}
                >
                  {initials}
                </div>
                <div className="flex-1">
                  <div className="text-[15px] font-semibold text-[var(--txt-primary)]">{r.username || 'Anonymous'}</div>
                  <div className="mt-0.5 text-[12px] text-[var(--txt-ghost)]">🔥 {r.current_streak} streak</div>
                </div>
                <div className="gmj-stat-num text-[16px]">
                  {(r.total_shards || 0).toLocaleString()}
                </div>
              </div>
            );
          })}
        </div>

        {profile && (
          <div
            className="gmj-float gmj-float-d2 mt-4 flex items-center gap-4 rounded-[16px] border px-4 py-3.5 shadow-[0_8px_32px_rgba(74,234,220,0.15)]"
            style={{
              background: "rgba(74,234,220,0.08)",
              backdropFilter: "blur(12px)",
              borderColor: "rgba(74,234,220,0.25)",
            }}
          >
            <div className="w-6 text-center font-mono text-[14px] font-bold text-[var(--color-arctic)]">
              {profile.rank_position || "-"}
            </div>
            <div
              className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-[12px] text-[14px] font-bold"
              style={{ 
                background: "rgba(74,234,220,0.15)", 
                color: "var(--color-arctic)",
                border: "1px solid rgba(74,234,220,0.3)"
              }}
            >
              {profile.username ? profile.username.slice(0, 2).toUpperCase() : "??"}
            </div>
            <div className="flex-1">
              <div className="text-[15px] font-bold text-[var(--color-arctic)]">you</div>
              <div className="mt-0.5 text-[12px] text-[var(--color-arctic)] opacity-80">🔥 {profile.current_streak} streak</div>
            </div>
            <div className="gmj-stat-num text-[16px] text-[var(--color-arctic)]">
              {(profile.total_shards || 0).toLocaleString()}
            </div>
          </div>
        )}
      </div>

      <BottomNav />
    </PhoneFrame>
  );
}
