import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PhoneFrame, StatusBar } from "@/components/PhoneFrame";
import { z } from "zod";
import { getGymSessions, type GymSession } from "@/lib/gym-service";
import { useAuthContext } from "@/lib/auth-context";
import { AlertCircle, Award, CheckCircle, HelpCircle, ArrowRight } from "lucide-react";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";

const evalSearchSchema = z.object({
  sessionId: z.string(),
});

export const Route = createFileRoute("/gym_/eval")({
  validateSearch: evalSearchSchema,
  loaderDeps: ({ search: { sessionId } }) => ({ sessionId }),
  loader: async ({ deps }) => {
    return { sessionId: deps.sessionId };
  },
  component: GymEvalComponent,
  head: () => ({ meta: [{ title: "Nuance — Session Evaluation" }] }),
});

function GymEvalComponent() {
  const { sessionId } = Route.useLoaderData();
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const [session, setSession] = useState<GymSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    getGymSessions(user.id).then((data) => {
      const active = data.find(s => s.id === sessionId);
      if (active) {
        setSession(active);
      }
      setLoading(false);
    });
  }, [user, sessionId]);

  if (loading) {
    return (
      <PhoneFrame>
        <StatusBar />
        <div className="flex flex-1 flex-col items-center justify-center text-[var(--txt-ghost)]">
          Retrieving score card...
        </div>
      </PhoneFrame>
    );
  }

  if (!session || !session.feedback_rubric) {
    return (
      <PhoneFrame>
        <StatusBar />
        <div className="flex flex-1 flex-col items-center justify-center px-6 text-center gap-4">
          <AlertCircle size={40} className="text-[var(--accent-coral)]" />
          <h2 className="gmj-heading text-[20px]">Evaluation Not Available</h2>
          <button onClick={() => navigate({ to: "/gym" })} className="gmj-btn gmj-btn-primary">
            Return to Gym
          </button>
        </div>
      </PhoneFrame>
    );
  }

  const rubric = session.feedback_rubric;
  const ratingColor = "var(--color-spark)";

  return (
    <PhoneFrame>
      <StatusBar />

      <div className="flex-1 overflow-y-auto px-5 py-6 flex flex-col items-center text-center">
        
        {/* Sparkle Icon */}
        <div className="gmj-float gmj-float-d1 relative mb-6">
          <div
            className="absolute inset-0 rounded-full opacity-25 blur-[28px]"
            style={{ background: ratingColor }}
          />
          <div
            className="relative flex h-[108px] w-[108px] items-center justify-center rounded-full bg-[var(--glass-bg)] border"
            style={{
              borderColor: `${ratingColor}40`,
              color: ratingColor,
              boxShadow: `0 8px 32px ${ratingColor}25`
            }}
          >
            <Award size={48} />
          </div>
        </div>

        <h1 className="gmj-display gmj-float gmj-float-d2 mb-2 text-[30px]" style={{ color: "var(--txt-primary)" }}>
          Session Debrief
        </h1>
        <p className="gmj-float gmj-float-d2 text-[12px] text-[var(--txt-ghost)] uppercase tracking-wider mb-6">
          {session.mode} on "{session.topic}"
        </p>

        {/* Large Score display */}
        <div className="gmj-stat-num gmj-float gmj-float-d3 mb-2 text-[48px]" style={{ color: "var(--txt-primary)" }}>
          +{rubric.score} <span className="text-[24px] text-[var(--txt-ghost)]">DP</span>
        </div>
        <div className="gmj-float gmj-float-d3 mb-8 text-[12.5px] font-semibold text-[var(--color-spark)]">
          ✨ Depth Points added to your global Acuity Score!
        </div>

        {/* Critique Card */}
        <div className="gmj-glass gmj-float gmj-float-d4 mb-4 w-full px-6 py-5 text-left relative overflow-hidden">
          <span
            className="absolute left-0 right-0 top-0 h-[2px]"
            style={{ background: "rgba(255,255,255,0.08)" }}
          />
          <div className="mb-3 text-[11px] font-semibold uppercase tracking-[0.1em] text-[var(--txt-ghost)]">
            Overall Critique
          </div>
          <p className="text-[14.5px] leading-[1.6] text-[var(--txt-primary)]">
            {rubric.critique}
          </p>
        </div>

        {/* Strengths & Gaps Columns */}
        <div className="gmj-float gmj-float-d4 w-full flex flex-col gap-4 mb-8">
          {/* Strengths */}
          <div className="gmj-glass px-5 py-4 text-left flex items-start gap-3.5">
            <CheckCircle className="text-[var(--accent-bloom)] flex-shrink-0 mt-0.5" size={18} />
            <div>
              <span className="text-[11px] font-bold text-[var(--txt-ghost)] uppercase tracking-wider block mb-1">Key Strength</span>
              <span className="text-[13.5px] text-[var(--txt-primary)] leading-relaxed">{rubric.strengths}</span>
            </div>
          </div>

          {/* Gaps */}
          <div className="gmj-glass px-5 py-4 text-left flex items-start gap-3.5">
            <HelpCircle className="text-[var(--accent-coral)] flex-shrink-0 mt-0.5" size={18} />
            <div>
              <span className="text-[11px] font-bold text-[var(--txt-ghost)] uppercase tracking-wider block mb-1">Key Logic Gap</span>
              <span className="text-[13.5px] text-[var(--txt-primary)] leading-relaxed">{rubric.gaps}</span>
            </div>
          </div>
        </div>

        {/* Review Transcript Accordion */}
        <div className="gmj-float gmj-float-d4 w-full mb-8">
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="transcript" className="border-[rgba(255,255,255,0.06)]">
              <AccordionTrigger className="text-[13px] text-[var(--txt-ghost)] hover:no-underline py-3">
                Review Session Transcript
              </AccordionTrigger>
              <AccordionContent className="text-left pt-2 flex flex-col gap-3.5">
                {session.transcript.map((msg, index) => {
                  const isAI = msg.role === 'assistant';
                  return (
                    <div key={index} className="flex flex-col gap-0.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--txt-ghost)]">
                        {isAI ? 'Coach' : 'You'}
                      </span>
                      <p className="text-[13.5px] leading-relaxed text-[var(--txt-secondary)]">
                        {msg.content}
                      </p>
                    </div>
                  );
                })}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

        {/* Actions */}
        <div className="gmj-float gmj-float-d4 flex w-full flex-col gap-3">
          <button
            className="gmj-btn gmj-btn-primary"
            onClick={() => navigate({ to: "/gym" })}
          >
            Return to Gym
          </button>
        </div>

      </div>
    </PhoneFrame>
  );
}
