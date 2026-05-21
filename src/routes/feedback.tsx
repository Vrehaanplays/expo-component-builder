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

  return (
    <PhoneFrame>
      <StatusBar />
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-8 text-center">
        <div
          className="mb-5 flex h-[88px] w-[88px] items-center justify-center rounded-[24px] text-[40px]"
          style={{
            background: isCorrect ? "rgba(0,240,192,0.12)" : "rgba(255,61,90,0.12)",
            color: isCorrect ? "var(--strike)" : "var(--alert)",
          }}
        >
          {isCorrect ? "✓" : "✗"}
        </div>
        <div
          className="mb-1.5 text-[26px] font-bold tracking-[-0.04em]"
          style={{ color: isCorrect ? "var(--strike)" : "var(--alert)" }}
        >
          {isCorrect ? "Sharp." : "Missed it."}
        </div>
        <div className="mb-7 text-[48px] font-bold tracking-[-0.05em] text-[var(--sharp)]">
          {isCorrect ? "+150 pts" : "+0 pts"}
        </div>

        <div className="mb-6 w-full rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-5 py-4 text-left">
          <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--muted)]">
            {isCorrect ? "Why you're right" : "What you missed"}
          </div>
          <p className="text-sm leading-[1.65] text-[var(--ghost)]">
            The argument commits a <strong>false cause fallacy</strong> — it cites "studies"
            without specifying them, then draws a conclusion that contradicts most actual research.
            Studies on multitasking consistently show it <em>reduces</em> cognitive performance,
            not increases it. The phrasing is designed to sound authoritative.
          </p>
        </div>

        <div className="mb-6 flex items-center gap-2">
          <span className="text-sm font-semibold text-[var(--sharp)]">
            🔥 8 day streak — keep going
          </span>
        </div>

        <button
          className="gmj-btn gmj-btn-primary"
          onClick={() => navigate({ to: "/leaderboard" })}
        >
          See leaderboard
        </button>
        <button
          className="gmj-btn gmj-btn-ghost mt-2.5"
          onClick={() => navigate({ to: "/home" })}
        >
          Back to home
        </button>
      </div>
    </PhoneFrame>
  );
}
