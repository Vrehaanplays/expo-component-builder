import { createFileRoute, Link } from "@tanstack/react-router";
import { PhoneFrame } from "@/components/PhoneFrame";
import { BottomNav } from "@/components/BottomNav";

export const Route = createFileRoute("/home")({
  component: Home,
  head: () => ({ meta: [{ title: "GMJ — Today's challenge" }] }),
});

function Home() {
  return (
    <PhoneFrame>

      <header className="flex flex-shrink-0 items-center justify-between px-6 pb-5 pt-4">
        <div
          className="flex items-center gap-1.5 rounded-full px-3 py-1.5"
          style={{
            background: "rgba(255,206,0,0.12)",
            border: "1px solid rgba(255,206,0,0.2)",
          }}
        >
          <span className="text-sm">🔥</span>
          <span className="text-[13px] font-semibold text-[var(--sharp)]">7 day streak</span>
        </div>
        <div className="text-right">
          <div className="text-xl font-bold tracking-[-0.03em] text-[var(--ghost)]">4,820</div>
          <div className="text-[10px] uppercase tracking-[0.08em] text-[var(--muted)]">
            Total pts
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-hidden px-5">
        <div className="mb-3 text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--muted)]">
          Today's challenge
        </div>

        <Link
          to="/scenario"
          className="relative mb-3 block cursor-pointer overflow-hidden rounded-[20px] border border-[var(--border)] bg-[var(--surface)] p-5 transition-transform active:scale-[0.98]"
        >
          <span
            className="absolute left-0 right-0 top-0 h-0.5"
            style={{ background: "var(--strike)" }}
          />
          <div className="gmj-tag mb-3.5">🧩 Argument</div>
          <h3 className="mb-4 text-[17px] font-semibold leading-[1.4] tracking-[-0.02em] text-[var(--ghost)]">
            "Studies show multitasking boosts productivity — so open more tabs."
          </h3>
          <div className="flex items-center justify-between">
            <span className="text-xs text-[var(--muted)]">🧑 2,341 played today</span>
            <div className="flex gap-[3px]">
              <span className="h-1.5 w-1.5 rounded-[3px]" style={{ background: "var(--strike)" }} />
              <span className="h-1.5 w-1.5 rounded-[3px]" style={{ background: "var(--strike)" }} />
              <span
                className="h-1.5 w-1.5 rounded-[3px]"
                style={{ background: "var(--surface2)" }}
              />
            </div>
          </div>
        </Link>

        <Link
          to="/leaderboard"
          className="mb-3 flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--surface2)] px-[18px] py-3.5"
        >
          <div>
            <div className="text-xs text-[var(--muted)]">Your global rank</div>
            <div className="text-[18px] font-bold tracking-[-0.03em] text-[var(--ghost)]">#142</div>
          </div>
          <div className="text-xs font-semibold text-[var(--strike)]">▲ 14 today</div>
        </Link>

        <div
          className="rounded-[20px] border border-[var(--border)] bg-[var(--surface)] p-5"
          style={{ opacity: 0.5, pointerEvents: "none" }}
        >
          <div
            className="gmj-tag mb-3.5"
            style={{
              background: "rgba(107,107,114,0.1)",
              borderColor: "rgba(107,107,114,0.2)",
              color: "var(--muted)",
            }}
          >
            🔒 More tomorrow
          </div>
          <p className="text-[15px] text-[var(--muted)]">
            Complete today's challenge to unlock the next one.
          </p>
        </div>
      </div>

      <BottomNav />
    </PhoneFrame>
  );
}
