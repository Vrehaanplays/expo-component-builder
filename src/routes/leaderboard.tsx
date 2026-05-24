import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PhoneFrame, StatusBar } from "@/components/PhoneFrame";
import { BottomNav } from "@/components/BottomNav";

export const Route = createFileRoute("/leaderboard")({
  component: Leaderboard,
  head: () => ({ meta: [{ title: "GMJ — Leaderboard" }] }),
});

const rows = [
  { rank: 1, name: "n_karim", initials: "NK", streak: 21, score: 9240, medal: "gold" as const },
  { rank: 2, name: "arjun_s", initials: "AS", streak: 14, score: 8810, medal: "silver" as const },
  { rank: 3, name: "zara_k", initials: "ZK", streak: 9, score: 7990, medal: "bronze" as const },
  { rank: 4, name: "m_ravi", initials: "MR", streak: 6, score: 6720 },
  { rank: 5, name: "p_lee", initials: "PL", streak: 4, score: 5440 },
];

const medalColors: Record<string, string> = {
  gold: "#FFD700",
  silver: "#C0C0C0",
  bronze: "#CD7F32",
};

function Leaderboard() {
  const [tab, setTab] = useState<"today" | "all">("today");

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
          {rows.map((r, i) => (
            <div key={r.rank} className="flex items-center gap-4 border-b border-[var(--color-border)] px-4 py-3 last:border-b-0">
              <div
                className="w-6 text-center font-mono text-[14px] font-bold"
                style={{ color: r.medal ? medalColors[r.medal] : "var(--txt-ghost)" }}
              >
                {r.rank}
              </div>
              <div
                className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-[12px] text-[14px] font-bold"
                style={{
                  background: r.medal
                    ? `${medalColors[r.medal]}1f`
                    : "rgba(255,255,255,0.06)",
                  color: r.medal ? medalColors[r.medal] : "var(--txt-primary)",
                  border: r.medal ? `1px solid ${medalColors[r.medal]}40` : "1px solid rgba(255,255,255,0.1)",
                }}
              >
                {r.initials}
              </div>
              <div className="flex-1">
                <div className="text-[15px] font-semibold text-[var(--txt-primary)]">{r.name}</div>
                <div className="mt-0.5 text-[12px] text-[var(--txt-ghost)]">🔥 {r.streak} streak</div>
              </div>
              <div className="gmj-stat-num text-[16px]">
                {r.score.toLocaleString()}
              </div>
            </div>
          ))}
        </div>

        <div
          className="gmj-float gmj-float-d2 mt-4 flex items-center gap-4 rounded-[16px] border px-4 py-3.5 shadow-[0_8px_32px_rgba(74,234,220,0.15)]"
          style={{
            background: "rgba(74,234,220,0.08)",
            backdropFilter: "blur(12px)",
            borderColor: "rgba(74,234,220,0.25)",
          }}
        >
          <div className="w-6 text-center font-mono text-[14px] font-bold text-[var(--color-arctic)]">
            142
          </div>
          <div
            className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-[12px] text-[14px] font-bold"
            style={{ 
              background: "rgba(74,234,220,0.15)", 
              color: "var(--color-arctic)",
              border: "1px solid rgba(74,234,220,0.3)"
            }}
          >
            YO
          </div>
          <div className="flex-1">
            <div className="text-[15px] font-bold text-[var(--color-arctic)]">you</div>
            <div className="mt-0.5 text-[12px] text-[var(--color-arctic)] opacity-80">🔥 8 streak</div>
          </div>
          <div className="gmj-stat-num text-[16px] text-[var(--color-arctic)]">
            4,820
          </div>
        </div>
      </div>

      <BottomNav />
    </PhoneFrame>
  );
}
