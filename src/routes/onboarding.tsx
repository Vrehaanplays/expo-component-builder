import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { PhoneFrame, StatusBar } from "@/components/PhoneFrame";

export const Route = createFileRoute("/onboarding")({
  component: Onboarding,
  head: () => ({ meta: [{ title: "Nuance — Welcome" }] }),
});

const slides = [
  {
    icon: (
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--color-spark)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <circle cx="12" cy="12" r="6"></circle>
        <circle cx="12" cy="12" r="2"></circle>
      </svg>
    ),
    title: "Your feed is full of bad arguments.",
    sub: "Can you spot them before they fool you?",
  },
  {
    icon: (
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--color-arctic)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
      </svg>
    ),
    title: "Make calls. Get scored. See how you rank.",
    sub: "Every session sharpens your judgment and moves you up the board.",
  },
  {
    icon: (
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--color-starlight)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path>
        <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path>
        <path d="M4 22h16"></path>
        <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"></path>
        <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"></path>
        <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"></path>
      </svg>
    ),
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
      <StatusBar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <div
          className="flex h-full"
          style={{
            width: `${slides.length * 100}%`,
            transform: `translateX(-${i * (100 / slides.length)}%)`,
            transition: "transform 0.4s cubic-bezier(0.16,1,0.3,1)",
          }}
        >
          {slides.map((s, idx) => (
            <div
              key={idx}
              className="flex flex-col justify-end px-8 py-12"
              style={{ width: `${100 / slides.length}%`, flexShrink: 0 }}
            >
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-[20px] bg-[var(--glass-bg)] border border-[var(--glass-border)] shadow-[0_4px_24px_rgba(0,0,0,0.3)]">
                {s.icon}
              </div>
              <h2 className="gmj-display mb-3 text-[32px] text-[var(--txt-primary)]">
                {s.title}
              </h2>
              <p className="mb-10 text-[15px] leading-[1.6] text-[var(--txt-secondary)]">{s.sub}</p>
              
              <div className="mb-8 flex gap-2">
                {slides.map((_, di) => (
                  <div
                    key={di}
                    style={{
                      height: 4,
                      width: di === i ? 24 : 8,
                      borderRadius: 2,
                      background: di === i ? "var(--color-arctic)" : "var(--color-border)",
                      transition: "all 0.3s ease-out",
                    }}
                  />
                ))}
              </div>
              
              <button className="gmj-btn gmj-btn-primary" onClick={next}>
                {idx === slides.length - 1 ? "Enter arena" : "Next"}
              </button>
            </div>
          ))}
        </div>
      </div>
    </PhoneFrame>
  );
}
