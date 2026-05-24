import { createFileRoute } from "@tanstack/react-router";
import { PhoneFrame, StatusBar } from "@/components/PhoneFrame";
import { BottomNav } from "@/components/BottomNav";

export const Route = createFileRoute("/profile")({
  component: Profile,
  head: () => ({ meta: [{ title: "GMJ — Profile" }] }),
});

const stats = [
  { value: "4,820", label: "Total points", highlight: true },
  { value: "🔥 8", label: "Day streak", color: "var(--color-starlight)" },
  { value: "73%", label: "Accuracy" },
  { value: "24", label: "Sessions" },
];

function Profile() {
  return (
    <PhoneFrame>
      <StatusBar />
      <div className="flex-shrink-0 px-6 pb-4 pt-3">
        <h1 className="gmj-display text-[28px]">Profile</h1>
      </div>

      <div className="gmj-float gmj-float-d1 mx-5 mb-5 flex items-center gap-4 rounded-[24px] bg-[var(--glass-bg)] border border-[var(--glass-border)] p-5 shadow-[0_8px_32px_rgba(0,0,0,0.2)]" style={{ backdropFilter: "blur(16px)" }}>
        <div
          className="flex h-[64px] w-[64px] flex-shrink-0 items-center justify-center rounded-[18px] text-[24px] font-bold text-[var(--color-arctic)]"
          style={{ background: "rgba(74,234,220,0.15)", border: "2px solid rgba(74,234,220,0.3)" }}
        >
          YO
        </div>
        <div>
          <div className="gmj-heading text-[22px] text-[var(--txt-primary)]">you</div>
          <div className="mt-1 text-[13px] font-medium text-[var(--txt-ghost)]">Rank #142 globally</div>
        </div>
      </div>

      <div className="gmj-float gmj-float-d2 mb-6 grid grid-cols-2 gap-3 px-5">
        {stats.map((s) => (
          <div
            key={s.label}
            className="gmj-glass rounded-[18px] px-5 py-4"
          >
            <div
              className="gmj-stat-num text-[26px]"
              style={{ color: s.highlight ? "var(--color-arctic)" : s.color ?? "var(--txt-primary)" }}
            >
              {s.value}
            </div>
            <div className="gmj-stat-label mt-1">
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
