import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PhoneFrame, StatusBar } from "@/components/PhoneFrame";
import { BottomNav } from "@/components/BottomNav";
import { useAuthContext } from "@/lib/auth-context";
import { useProfile } from "@/hooks/use-profile";
import { createGymSession, getGymSessions, type GymSession } from "@/lib/gym-service";
import { Brain, MessageSquare, ShieldCheck, Flame, Award, ChevronRight, Play, Lock } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

export const Route = createFileRoute("/gym")({
  component: Gym,
  head: () => ({ meta: [{ title: "Nuance — Reasoning Gym" }] }),
});

const PRESETS = [
  "Does social media make people more isolated?",
  "Should AI replace human teachers in high schools?",
  "Is Mars space exploration worth the massive financial cost?",
  "Are electric vehicles the definitive solution to green transport?"
];

function Gym() {
  const navigate = useNavigate();
  const { user, session, loading: authLoading } = useAuthContext();
  const { profile, loading: profileLoading, refetch: refetchProfile } = useProfile(user?.id);
  const [sessions, setSessions] = useState<GymSession[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(true);

  // Modal topic picker state
  const [selectedMode, setSelectedMode] = useState<'debate' | 'steelman' | null>(null);
  const [customTopic, setCustomTopic] = useState("");
  const [creating, setCreating] = useState(false);

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!authLoading && !session) navigate({ to: "/auth" });
  }, [authLoading, session, navigate]);

  useEffect(() => {
    if (!user) return;
    getGymSessions(user.id).then((data) => {
      setSessions(data);
      setLoadingSessions(false);
    });
  }, [user]);

  const handleStartSession = async (topic: string) => {
    if (!user || !selectedMode) return;
    const finalTopic = topic.trim() || PRESETS[0];
    setCreating(true);
    try {
      const newSession = await createGymSession(user.id, selectedMode, finalTopic);
      setSelectedMode(null);
      setCustomTopic("");
      navigate({ to: "/gym/session", search: { sessionId: newSession.id } });
    } catch (e) {
      console.error(e);
    } finally {
      setCreating(false);
    }
  };

  const isLoading = authLoading || profileLoading;
  const totalDepth = profile?.total_depth ?? 0;
  const acuityScore = profile?.acuity_score ?? (profile?.total_shards ?? 0);
  const activeSessions = sessions.filter(s => !s.completed);
  const pastSessions = sessions.filter(s => s.completed);

  return (
    <PhoneFrame>
      <StatusBar />

      <header className="gmj-float gmj-float-d1 flex flex-shrink-0 items-center justify-between px-6 pb-5 pt-2">
        <div className="flex flex-col">
          <span className="text-[12px] text-[var(--txt-ghost)] uppercase tracking-wider font-semibold">Nuance Gym</span>
          <h1 className="gmj-heading text-[22px]">Mental Training</h1>
        </div>
        <div className="gmj-rank-pill">
          <span>⚡ {acuityScore} Acuity</span>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-5 pb-6">
        {/* Stats Card */}
        <div className="gmj-glass gmj-float gmj-float-d2 mb-6 p-5 relative overflow-hidden">
          <span
            className="absolute left-0 right-0 top-0 h-[3px]"
            style={{
              background: "linear-gradient(90deg, var(--color-spark) 0%, var(--accent-arctic) 100%)",
              boxShadow: "0 2px 12px rgba(167,139,250,0.4)"
            }}
          />
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-[var(--txt-ghost)] mb-1">Depth Points</div>
              <div className="gmj-stat-num text-[32px] text-[var(--color-spark)]">+{totalDepth} <span className="text-[16px] text-[var(--txt-ghost)]">DP</span></div>
            </div>
            <div className="h-12 w-12 rounded-full bg-[rgba(167,139,250,0.12)] border border-[rgba(167,139,250,0.25)] flex items-center justify-center text-[var(--color-spark)]">
              <Brain size={24} />
            </div>
          </div>
          <p className="text-[13px] text-[var(--txt-secondary)] mt-3 leading-relaxed">
            Gym training earns **Depth Points** to boost your overall Acuity rating on the leaderboards.
          </p>
        </div>

        {/* Training Modes Section */}
        <div className="gmj-float gmj-float-d3 mb-6">
          <div className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[var(--color-spark)] mb-3">
            Select Training Mode
          </div>

          <div className="flex flex-col gap-4">
            {/* Debate Mode */}
            <div
              onClick={() => setSelectedMode('debate')}
              className="gmj-glass p-5 cursor-pointer relative overflow-hidden flex items-center justify-between transition-all duration-200 active:scale-[0.98]"
            >
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-[16px] bg-[rgba(74,234,220,0.08)] border border-[rgba(74,234,220,0.18)] flex items-center justify-center text-[var(--accent-arctic)]">
                  <MessageSquare size={22} />
                </div>
                <div className="text-left">
                  <h3 className="font-bold text-[16px] text-[var(--txt-primary)]">Reasoning Debate</h3>
                  <p className="text-[12px] text-[var(--txt-secondary)] mt-0.5">Argue against AI logic feedback</p>
                </div>
              </div>
              <ChevronRight size={18} className="text-[var(--txt-ghost)]" />
            </div>

            {/* Steelman Mode */}
            <div
              onClick={() => setSelectedMode('steelman')}
              className="gmj-glass p-5 cursor-pointer relative overflow-hidden flex items-center justify-between transition-all duration-200 active:scale-[0.98]"
            >
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-[16px] bg-[rgba(52,211,153,0.08)] border border-[rgba(52,211,153,0.18)] flex items-center justify-center text-[var(--color-bloom)]">
                  <ShieldCheck size={22} />
                </div>
                <div className="text-left">
                  <h3 className="font-bold text-[16px] text-[var(--txt-primary)]">Steelman Training</h3>
                  <p className="text-[12px] text-[var(--txt-secondary)] mt-0.5">Reconstruct weak opposing arguments</p>
                </div>
              </div>
              <ChevronRight size={18} className="text-[var(--txt-ghost)]" />
            </div>

            {/* Brainstorm (Locked) */}
            <div
              className="gmj-glass p-5 relative overflow-hidden flex items-center justify-between opacity-50 cursor-not-allowed"
              style={{ hover: "none" }}
            >
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-[16px] bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] flex items-center justify-center text-[var(--txt-ghost)]">
                  <Lock size={20} />
                </div>
                <div className="text-left">
                  <h3 className="font-bold text-[16px] text-[var(--txt-ghost)]">Creative Brainstorm</h3>
                  <p className="text-[12px] text-[var(--txt-ghost)] mt-0.5">Generate dialectic alternative points</p>
                </div>
              </div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--txt-ghost)]">Locked</span>
            </div>
          </div>
        </div>

        {/* Active/Recent Sessions */}
        {activeSessions.length > 0 && (
          <div className="gmj-float gmj-float-d4 mb-6">
            <div className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[var(--txt-ghost)] mb-3">
              Resume Active Training
            </div>
            <div className="flex flex-col gap-3">
              {activeSessions.map(s => (
                <div
                  key={s.id}
                  onClick={() => navigate({ to: "/gym/session", search: { sessionId: s.id } })}
                  className="gmj-glass p-4 cursor-pointer flex items-center justify-between text-left"
                >
                  <div className="flex flex-col gap-1 overflow-hidden pr-4">
                    <span className="text-[10px] font-bold text-[var(--accent-arctic)] uppercase tracking-wider">{s.mode}</span>
                    <span className="text-[14px] text-[var(--txt-primary)] font-medium truncate">{s.topic}</span>
                    <span className="text-[11px] text-[var(--txt-ghost)]">{s.transcript.length} messages</span>
                  </div>
                  <Play size={16} className="text-[var(--accent-arctic)] flex-shrink-0" />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Topic Picker Modal */}
      <Dialog open={selectedMode !== null} onOpenChange={() => setSelectedMode(null)}>
        <DialogContent className="bg-[var(--depth-ocean)] border border-[var(--glass-border)] text-left rounded-[24px] max-w-[90%] sm:max-w-md" style={{ backdropFilter: "blur(24px)", boxShadow: "0 20px 50px rgba(0,0,0,0.5)" }}>
          <DialogHeader>
            <DialogTitle className="gmj-heading text-[20px] text-[var(--txt-primary)] uppercase">
              Choose Topic — {selectedMode}
            </DialogTitle>
            <DialogDescription className="text-[14px] text-[var(--txt-secondary)] mt-1">
              Select one of the logical challenge presets or write your own argument prompt.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-2.5 my-4">
            {PRESETS.map((p, idx) => (
              <button
                key={idx}
                disabled={creating}
                onClick={() => handleStartSession(p)}
                className="w-full text-left p-3.5 rounded-xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] hover:bg-[rgba(255,255,255,0.07)] hover:border-[rgba(74,234,220,0.3)] transition-all text-[13.5px] leading-relaxed text-[var(--txt-primary)] font-medium"
              >
                {p}
              </button>
            ))}

            <div className="h-px bg-[var(--glass-border)] my-2" />

            <input
              type="text"
              placeholder="Or write a custom topic/claim..."
              value={customTopic}
              onChange={(e) => setCustomTopic(e.target.value)}
              disabled={creating}
              className="gmj-input text-[14px]"
            />
          </div>

          <DialogFooter className="flex flex-col gap-2 sm:flex-row sm:justify-end">
            <button
              onClick={() => setSelectedMode(null)}
              disabled={creating}
              className="gmj-btn gmj-btn-outline w-full sm:w-auto text-[14px] py-3.5"
            >
              Cancel
            </button>
            <button
              onClick={() => handleStartSession(customTopic)}
              disabled={creating || (!customTopic.trim() && selectedMode === null)}
              className="gmj-btn gmj-btn-primary w-full sm:w-auto text-[14px] py-3.5"
            >
              {creating ? "Creating..." : "Start Training"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <BottomNav />
    </PhoneFrame>
  );
}
