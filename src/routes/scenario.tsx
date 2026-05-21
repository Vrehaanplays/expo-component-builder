import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { PhoneFrame, StatusBar } from "@/components/PhoneFrame";

export const Route = createFileRoute("/scenario")({
  component: Scenario,
  head: () => ({ meta: [{ title: "GMJ — Make the call" }] }),
});

const options = [
  { text: "This is solid advice — multitasking is a proven skill", correct: false },
  { text: "The conclusion doesn't follow — studies actually show the opposite", correct: false },
  { text: "False cause fallacy — misrepresents what the studies actually found", correct: true },
  { text: "Emotional bait — designed to make you feel productive without being so", correct: false },
];

function Scenario() {
  const navigate = useNavigate();
  const [timer, setTimer] = useState(100);
  const [picked, setPicked] = useState<number | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setTimer((t) => (t <= 0 ? 0 : t - 0.5));
    }, 100);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const select = (idx: number) => {
    if (picked !== null) return;
    setPicked(idx);
    if (intervalRef.current) clearInterval(intervalRef.current);
    const wasCorrect = options[idx].correct;
    setTimeout(() => {
      navigate({ to: "/feedback", search: { correct: wasCorrect ? 1 : 0 } });
    }, 1200);
  };

  const timerColor = timer <= 30 ? "var(--alert)" : "var(--strike)";

  return (
    <PhoneFrame>
      <StatusBar />

      <div className="flex flex-shrink-0 items-center gap-3 px-6 py-4">
        <button
          className="flex h-9 w-9 items-center justify-center rounded-[10px] border-none bg-[var(--surface2)] text-lg text-[var(--ghost)]"
          onClick={() => navigate({ to: "/home" })}
        >
          ←
        </button>
        <div className="h-1 flex-1 overflow-hidden rounded-sm bg-[var(--surface2)]">
          <div
            className="h-full rounded-sm transition-[width]"
            style={{ width: `${timer}%`, background: timerColor }}
          />
        </div>
      </div>

      <div className="flex flex-1 flex-col overflow-y-auto px-5 pb-5 pt-2">
        <div className="mb-4">
          <span className="gmj-tag">🧩 Argument</span>
        </div>
        <div className="mb-2.5 text-[11px] uppercase tracking-[0.08em] text-[var(--muted)]">
          What's wrong with this?
        </div>

        <div className="mb-6 flex-shrink-0 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 text-[15px] leading-[1.65] text-[var(--ghost)]">
          <div className="mb-2 font-mono text-xs text-[var(--muted)]">@productivityguru · 2h</div>
          "Studies show multitasking boosts productivity — so you should always have multiple tabs
          open and switch between tasks constantly to get more done."
        </div>

        <div className="flex flex-col gap-2.5">
          {options.map((o, idx) => {
            let cls = "gmj-answer";
            if (picked !== null) {
              if (idx === picked) cls += o.correct ? " correct" : " wrong";
              else if (o.correct) cls += " correct";
              else cls += " dim";
            }
            return (
              <button key={idx} className={cls} onClick={() => select(idx)}>
                {o.text}
              </button>
            );
          })}
        </div>
      </div>
    </PhoneFrame>
  );
}
