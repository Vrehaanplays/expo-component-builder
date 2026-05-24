import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import { PhoneFrame, StatusBar } from "@/components/PhoneFrame";

const searchSchema = z.object({ correct: z.number().optional().default(1) });

export const Route = createFileRoute("/feedback")({
  component: Feedback,
  validateSearch: searchSchema,
  head: () => ({ meta: [{ title: "GMJ — Feedback" }] }),
});

function Feedback() {
  const navigate = useNavigate();
  const { correct } = Route.useSearch();
  const isCorrect = correct === 1;

  const color = isCorrect ? "var(--color-bloom)" : "var(--color-coral)";
  const icon = isCorrect ? (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
  ) : (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"></line>
      <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
  );

  return (
    <PhoneFrame>
      <StatusBar />
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-8 text-center">
        
        <div className="gmj-float gmj-float-d1 relative mb-6">
          <div
            className="absolute inset-0 rounded-full opacity-20 blur-[24px]"
            style={{ background: color }}
          />
          <div
            className="relative flex h-[100px] w-[100px] items-center justify-center rounded-full bg-[var(--glass-bg)] border"
            style={{
              borderColor: `${color}40`,
              color: color,
              boxShadow: `0 8px 32px ${color}20`
            }}
          >
            {icon}
          </div>
        </div>

        <div
          className="gmj-display gmj-float gmj-float-d2 mb-2 text-[32px]"
          style={{ color }}
        >
          {isCorrect ? "Sharp." : "Missed it."}
        </div>
        
        <div className="gmj-stat-num gmj-float gmj-float-d3 mb-8 text-[48px]" style={{ color: "var(--txt-primary)" }}>
          {isCorrect ? "+150" : "+0"} <span className="text-[20px] text-[var(--txt-ghost)]">pts</span>
        </div>

        <div className="gmj-glass gmj-float gmj-float-d4 mb-8 w-full px-6 py-5 text-left">
          <div className="mb-3 text-[11px] font-semibold uppercase tracking-[0.1em] text-[var(--txt-ghost)]">
            {isCorrect ? "Why you're right" : "What you missed"}
          </div>
          <p className="text-[15px] leading-[1.6] text-[var(--txt-primary)]">
            The argument commits a <strong className="text-[var(--color-spark)] font-semibold">false cause fallacy</strong> — it cites "studies"
            without specifying them, then draws a conclusion that contradicts most actual research.
            Studies on multitasking consistently show it <em className="text-[var(--color-starlight)] not-italic font-medium">reduces</em> cognitive performance,
            not increases it. The phrasing is designed to sound authoritative.
          </p>
        </div>

        <div className="gmj-float gmj-float-d4 mb-8 flex items-center gap-2">
          <div className="gmj-streak">
            <span>🔥</span>
            <span>8 day streak — keep going</span>
          </div>
        </div>

        <div className="gmj-float gmj-float-d4 flex w-full flex-col gap-3">
          <button
            className="gmj-btn gmj-btn-primary"
            onClick={() => navigate({ to: "/leaderboard" })}
          >
            See leaderboard
          </button>
          <button
            className="gmj-btn gmj-btn-ghost"
            onClick={() => navigate({ to: "/home" })}
          >
            Back to home
          </button>
        </div>

      </div>
    </PhoneFrame>
  );
}
