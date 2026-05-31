import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { PhoneFrame, StatusBar } from "@/components/PhoneFrame";
import { z } from "zod";
import { getOrCreateDailyScenario, hasPlayedScenario } from "@/lib/game-service";
import { useAuthContext } from "@/lib/auth-context";

const scenarioSearchSchema = z.object({
  date: z.string().optional(),
  early: z.string().optional(),
});

export const Route = createFileRoute("/scenario")({
  validateSearch: scenarioSearchSchema,
  loaderDeps: ({ search: { date, early } }) => ({ date, early }),
  loader: async ({ deps }) => {
    const dateStr = deps.date || new Date().toISOString().split('T')[0];
    const scenario = await getOrCreateDailyScenario(dateStr);
    return { scenario, dateStr, early: deps.early === "true" };
  },
  component: Scenario,
  head: () => ({ meta: [{ title: "Nuance — Make the call" }] }),
});

function Scenario() {
  const { scenario, dateStr, early } = Route.useLoaderData();
  const options = scenario.options;
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const [timer, setTimer] = useState(100);
  const [picked, setPicked] = useState<number | null>(null);
  const [alreadyPlayed, setAlreadyPlayed] = useState(false);
  const [checkingPlayed, setCheckingPlayed] = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(Date.now());

  useEffect(() => {
    if (!user || !scenario.id) {
      setCheckingPlayed(false);
      return;
    }
    hasPlayedScenario(user.id, scenario.id).then((played) => {
      setAlreadyPlayed(played);
      setCheckingPlayed(false);
    });
  }, [user, scenario.id]);

  useEffect(() => {
    if (checkingPlayed || alreadyPlayed) return;
    startTimeRef.current = Date.now();
    intervalRef.current = setInterval(() => {
      setTimer((t) => (t <= 0 ? 0 : t - 0.5));
    }, 100);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [scenario.id, checkingPlayed, alreadyPlayed]);

  const select = (idx: number) => {
    if (picked !== null) return;
    setPicked(idx);
    if (intervalRef.current) clearInterval(intervalRef.current);
    const wasCorrect = options[idx].correct;
    const responseTimeMs = Date.now() - startTimeRef.current;

    setTimeout(() => {
      navigate({ 
        to: "/feedback", 
        search: { 
          correct: wasCorrect ? 1 : 0,
          premise: scenario.scenario_text,
          choice: options[idx].text,
          scenarioId: scenario.id,
          choiceIndex: idx,
          early: early ? 1 : 0,
          responseTimeMs: responseTimeMs,
        } 
      });
    }, 1200);
  };

  const timerColor = timer <= 30 ? "var(--color-coral)" : "var(--color-arctic)";

  if (checkingPlayed) {
    return (
      <PhoneFrame>
        <StatusBar />
        <div className="flex flex-1 flex-col items-center justify-center text-[var(--txt-ghost)]">
          Checking challenge status...
        </div>
      </PhoneFrame>
    );
  }

  if (alreadyPlayed) {
    return (
      <PhoneFrame>
        <StatusBar />
        <div className="flex flex-1 flex-col items-center justify-center px-6 py-8 text-center">
          <div className="text-[48px] mb-6">🧩</div>
          <h2 className="gmj-heading text-[22px] text-[var(--txt-primary)] mb-3">Challenge Completed</h2>
          <p className="text-[14px] leading-relaxed text-[var(--txt-secondary)] mb-8">
            You have already played this reasoning scenario. Each challenge can only be played once to maintain leaderboard fairness.
          </p>
          <button
            className="gmj-btn gmj-btn-primary w-full"
            onClick={() => navigate({ to: "/home" })}
          >
            Back to home
          </button>
        </div>
      </PhoneFrame>
    );
  }

  return (
    <PhoneFrame>
      <StatusBar />
      <div className="flex flex-shrink-0 items-center gap-4 px-6 py-4">
        <button
          className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-[var(--glass-bg)] border border-[var(--glass-border)] text-xl text-[var(--txt-primary)] transition-transform active:scale-95"
          onClick={() => navigate({ to: "/home" })}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
        </button>
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[rgba(255,255,255,0.1)] backdrop-blur-sm">
          <div
            className="h-full rounded-full transition-all duration-100 ease-linear"
            style={{ 
              width: `${timer}%`, 
              background: timerColor,
              boxShadow: `0 0 12px ${timerColor}80` 
            }}
          />
        </div>
      </div>

      <div className="flex flex-1 flex-col overflow-y-auto px-5 pb-5 pt-2">
        <div className="gmj-float gmj-float-d1 mb-4">
          <span className="gmj-tag">🧩 Argument</span>
        </div>
        <div className="gmj-float gmj-float-d1 mb-3 text-[11px] font-semibold uppercase tracking-[0.1em] text-[var(--color-spark)]">
          What's wrong with this?
        </div>

        <div className="gmj-glass gmj-float gmj-float-d2 mb-8 flex-shrink-0 p-6 text-[16px] leading-[1.65] text-[var(--txt-primary)]">
          <div className="mb-3 font-mono text-[11px] font-medium tracking-wide text-[var(--txt-ghost)]">@daily_scenario</div>
          <div className="font-sans">
            "{scenario.scenario_text}"
          </div>
        </div>

        <div className="gmj-float gmj-float-d3 flex flex-col gap-3">
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
