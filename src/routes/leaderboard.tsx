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
      <div className="flex-shrink-0 px-6 pb-4 pt-5">
        <h1 className="mb-4 text-[22px] font-bold tracking-[-0.03em] text-[var(--ghost)]">
          Leaderboard
        </h1>
        <div className="flex gap-2">
          {(["today", "all"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className="rounded-lg border-none px-4 py-[7px] text-[13px] font-semibold transition-colors"
              style={{
                background: tab === t ? "var(--strike)" : "var(--surface2)",
                color: tab === t ? "var(--void)" : "var(--muted)",
              }}
            >
              {t === "today" ? "Today" : "All time"}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4">
        {rows.map((r) => (
          <div key={r.rank} className="flex items-center gap-3.5 border-b border-[var(--border)] px-2 py-3">
            <div
              className="w-6 text-center font-mono text-[13px] font-bold"
              style={{ color: r.medal ? medalColors[r.medal] : "var(--muted)" }}
            >
              {r.rank}
            </div>
            <div
              className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-[10px] text-[13px] font-bold"
              style={{
                background: r.medal
                  ? `${medalColors[r.medal]}1f`
                  : "var(--surface2)",
                color: r.medal ? medalColors[r.medal] : "var(--ghost)",
              }}
            >
              {r.initials}
            </div>
            <div className="flex-1">
              <div className="text-sm font-semibold text-[var(--ghost)]">{r.name}</div>
              <div className="mt-0.5 text-[11px] text-[var(--muted)]">🔥 {r.streak} streak</div>
            </div>
            <div className="font-mono text-[15px] font-bold tracking-[-0.02em] text-[var(--ghost)]">
              {r.score.toLocaleString()}
            </div>
          </div>
        ))}

        <div
          className="mt-2 flex items-center gap-3.5 rounded-[10px] border px-2 py-3"
          style={{
            background: "rgba(0,240,192,0.06)",
            borderColor: "rgba(0,240,192,0.15)",
          }}
        >
          <div className="w-6 text-center font-mono text-[13px] font-bold text-[var(--strike)]">
            142
          </div>
          <div
            className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-[10px] text-[13px] font-bold"
            style={{ background: "rgba(0,240,192,0.15)", color: "var(--strike)" }}
          >
            YO
          </div>
          <div className="flex-1">
            <div className="text-sm font-semibold text-[var(--strike)]">you</div>
            <div className="mt-0.5 text-[11px] text-[var(--muted)]">🔥 8 streak</div>
          </div>
          <div className="font-mono text-[15px] font-bold tracking-[-0.02em] text-[var(--strike)]">
            4,820
          </div>
        </div>
      </div>

      <BottomNav />
    </PhoneFrame>
  );
}
