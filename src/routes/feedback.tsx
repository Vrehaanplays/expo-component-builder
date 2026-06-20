import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import { PhoneFrame, StatusBar } from "@/components/PhoneFrame";
import { getScenarioFeedbackFn } from "../server/ai";
import { useAuthContext } from "@/lib/auth-context";
import { useProfile } from "@/hooks/use-profile";
import { useEffect, useRef, useState } from "react";
import { recordSession } from "@/lib/game-service";
import { StreamingText } from "@/components/StreamingText";

const searchSchema = z.object({ 
  correct: z.number().optional().default(1),
  premise: z.string().optional(),
  choice: z.string().optional(),
  scenarioId: z.string().optional(),
  choiceIndex: z.number().optional(),
  responseTimeMs: z.number().optional(),
  early: z.number().optional().default(0)
});

export const Route = createFileRoute("/feedback")({
  component: Feedback,
  validateSearch: searchSchema,
  loaderDeps: ({ search: { correct, premise, choice, scenarioId, choiceIndex, responseTimeMs, early } }) => 
    ({ correct, premise, choice, scenarioId, choiceIndex, responseTimeMs, early }),
  loader: async ({ deps }) => {
    if (!deps.premise || !deps.choice) return { feedback: null };
    const feedback = await getScenarioFeedbackFn({ 
      premise: deps.premise,
      choice: deps.choice,
      isCorrect: deps.correct === 1
    });
    return { feedback };
  },
  head: () => ({ meta: [{ title: "Nuance — Feedback" }] }),
});

function Feedback() {
  const navigate = useNavigate();
  const { correct, scenarioId, choiceIndex, responseTimeMs, early } = Route.useSearch();
  const { feedback } = Route.useLoaderData();
  const isCorrect = correct === 1;

  const { user } = useAuthContext();
  const { profile, refetch: refetchProfile } = useProfile(user?.id);
  const streak = profile?.current_streak ?? 0;

  const hasSavedRef = useRef(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user || !scenarioId || choiceIndex === undefined || responseTimeMs === undefined) return;
    if (hasSavedRef.current) return;
    hasSavedRef.current = true;

    const saveSession = async () => {
      setSaving(true);
      try {
        await recordSession(
          user.id,
          scenarioId,
          choiceIndex,
          isCorrect,
          early === 1,
          responseTimeMs
        );
        await refetchProfile();
      } catch (err) {
        console.error("Failed to record session:", err);
      } finally {
        setSaving(false);
      }
    };

    saveSession();
  }, [user, scenarioId, choiceIndex, isCorrect, early, responseTimeMs, refetchProfile]);

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

  const displayPoints = isCorrect ? (early === 1 ? "+75" : "+150") : "+0";

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
        
        <div className="gmj-stat-num gmj-float gmj-float-d3 mb-2 text-[48px]" style={{ color: "var(--txt-primary)" }}>
          {saving ? "..." : displayPoints} <span className="text-[20px] text-[var(--txt-ghost)]">⚡</span>
        </div>

        {isCorrect && (early === 1 ? (
          <div className="gmj-float gmj-float-d3 mb-8 text-[12px] font-semibold text-[var(--color-spark)]">
            ⚠️ Early play 50% multiplier applied (Wait for tomorrow to get 150 ⚡)
          </div>
        ) : (
          <div className="gmj-float gmj-float-d3 mb-8 text-[12px] font-semibold text-[var(--color-bloom)]">
            ✨ Regular play 100% points rewarded!
          </div>
        ))}

        <div className="gmj-glass gmj-float gmj-float-d4 mb-8 w-full px-6 py-5 text-left">
          <div className="mb-3 text-[11px] font-semibold uppercase tracking-[0.1em] text-[var(--txt-ghost)]">
            {isCorrect ? "Why you're right" : "What you missed"}
          </div>
          <p className="text-[15px] leading-[1.6] text-[var(--txt-primary)] min-h-[60px]">
            <StreamingText
              text={feedback || (isCorrect ? "Correct answer! Excellent logic." : "Incorrect answer. Watch out for fallacies.")}
              speed={20}
            />
          </p>
        </div>

        <div className="gmj-float gmj-float-d4 mb-8 flex items-center gap-2">
          <div className="gmj-streak">
            <span>🔥</span>
            <span>{streak} day streak — keep going</span>
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
