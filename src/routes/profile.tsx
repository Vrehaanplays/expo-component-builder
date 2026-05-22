import { createFileRoute } from "@tanstack/react-router";
import { PhoneFrame } from "@/components/PhoneFrame";
import { BottomNav } from "@/components/BottomNav";

export const Route = createFileRoute("/profile")({
  component: Profile,
  head: () => ({ meta: [{ title: "GMJ — Profile" }] }),
});

const stats = [
  { value: "4,820", label: "Total points", highlight: true },
  { value: "🔥 8", label: "Day streak", color: "var(--sharp)" },
  { value: "73%", label: "Accuracy" },
  { value: "24", label: "Sessions" },
];

function Profile() {
  return (
    <PhoneFrame>
      <div className="flex-shrink-0 px-6 pb-4 pt-5">
        <h1 className="text-[22px] font-bold tracking-[-0.03em] text-[var(--ghost)]">Profile</h1>
      </div>

      <div className="mx-5 mb-4 flex items-center gap-4 rounded-[20px] border border-[var(--border)] bg-[var(--surface)] p-5">
        <div
          className="flex h-[60px] w-[60px] flex-shrink-0 items-center justify-center rounded-[16px] text-[22px] font-bold text-[var(--strike)]"
          style={{ background: "rgba(0,240,192,0.15)", border: "2px solid rgba(0,240,192,0.3)" }}
        >
          YO
        </div>
        <div>
          <div className="text-xl font-bold tracking-[-0.03em] text-[var(--ghost)]">you</div>
          <div className="mt-0.5 text-xs text-[var(--muted)]">Rank #142 globally</div>
        </div>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-2.5 px-5">
        {stats.map((s) => (
          <div
            key={s.label}
            className="rounded-[14px] border border-[var(--border)] bg-[var(--surface)] px-4 py-3.5"
          >
            <div
              className="text-[24px] font-bold tracking-[-0.04em]"
              style={{ color: s.highlight ? "var(--strike)" : s.color ?? "var(--ghost)" }}
            >
              {s.value}
            </div>
            <div className="mt-0.5 text-[11px] tracking-[0.04em] text-[var(--muted)]">
              {s.label}
            </div>
          </div>
        ))}
      </div>

      <div className="flex-1" />
      <BottomNav />
    </PhoneFrame>
  );
}
