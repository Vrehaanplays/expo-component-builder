import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { PhoneFrame } from "@/components/PhoneFrame";

export const Route = createFileRoute("/onboarding")({
  component: Onboarding,
  head: () => ({ meta: [{ title: "GMJ — Welcome" }] }),
});

const slides = [
  {
    icon: "🎯",
    title: "Your feed is full of bad arguments.",
    sub: "Can you spot them before they fool you?",
  },
  {
    icon: "⚡",
    title: "Make calls. Get scored. See how you rank.",
    sub: "Every session sharpens your judgment and moves you up the board.",
  },
  {
    icon: "🏆",
    title: "Sharpen your judgment. Daily.",
    sub: "Outthink the room. Be the sharpest person in it.",
  },
];

function Onboarding() {
  const navigate = useNavigate();
  const [i, setI] = useState(0);

  const next = () => {
    if (i < slides.length - 1) setI(i + 1);
    else navigate({ to: "/auth" });
  };

  return (
    <PhoneFrame>
      <div className="flex flex-1 flex-col overflow-hidden">
        <div
          className="flex h-full"
          style={{
            width: `${slides.length * 100}%`,
            transform: `translateX(-${i * (100 / slides.length)}%)`,
            transition: "transform 0.35s cubic-bezier(0.4,0,0.2,1)",
          }}
        >
          {slides.map((s, idx) => (
            <div
              key={idx}
              className="flex flex-col justify-end px-8 py-12"
              style={{ width: `${100 / slides.length}%`, flexShrink: 0 }}
            >
              <div className="mb-8 text-[64px]">{s.icon}</div>
              <h2 className="mb-3 text-[26px] font-bold leading-tight tracking-[-0.03em] text-[var(--ghost)]">
                {s.title}
              </h2>
              <p className="mb-10 text-[15px] leading-[1.6] text-[var(--muted)]">{s.sub}</p>
              <div className="mb-6 flex gap-1.5">
                {slides.map((_, di) => (
                  <div
                    key={di}
                    style={{
                      height: 6,
                      width: di === i ? 20 : 6,
                      borderRadius: 3,
                      background: di === i ? "var(--strike)" : "var(--surface2)",
                      transition: "all 0.3s",
                    }}
                  />
                ))}
              </div>
              <button className="gmj-btn gmj-btn-primary" onClick={next}>
                {idx === slides.length - 1 ? "Let's go" : "Next"}
              </button>
            </div>
          ))}
        </div>
      </div>
    </PhoneFrame>
  );
}
