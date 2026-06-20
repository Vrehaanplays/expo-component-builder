import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { PhoneFrame, StatusBar } from "@/components/PhoneFrame";
import { z } from "zod";
import { getGymSessions, updateGymSession, recordGymDepth, type GymSession } from "@/lib/gym-service";
import { useAuthContext } from "@/lib/auth-context";
import { getGymResponseFn, gradeGymSessionFn } from "@/server/ai";
import { ArrowLeft, Send, Mic, MicOff, AlertCircle, Keyboard, Volume2, RotateCcw, Check } from "lucide-react";
import { StreamingText } from "@/components/StreamingText";
import { NuanceMascot } from "@/components/NuanceMascot";

const sessionSearchSchema = z.object({
  sessionId: z.string(),
});

export const Route = createFileRoute("/gym_/session")({
  validateSearch: sessionSearchSchema,
  loaderDeps: ({ search: { sessionId } }) => ({ sessionId }),
  loader: async ({ deps }) => {
    return { sessionId: deps.sessionId };
  },
  component: GymSessionComponent,
  head: () => ({ meta: [{ title: "Nuance — Training Session" }] }),
});

const MAX_TURNS = 3;

function GymSessionComponent() {
  const { sessionId } = Route.useLoaderData();
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const [session, setSession] = useState<GymSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [inputMsg, setInputMsg] = useState("");
  const [sending, setSending] = useState(false);
  const [evaluating, setEvaluating] = useState(false);
  
  // Duolingo UI & Speech states
  const [inputMode, setInputMode] = useState<'voice' | 'keyboard'>('voice');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  
  const recognitionRef = useRef<any>(null);
  const transcriptEndRef = useRef<HTMLDivElement>(null);

  // Load Session Data
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

  // Scroll to bottom (only relevant for keyboard mode transcript)
  useEffect(() => {
    if (inputMode === 'keyboard') {
      transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [session?.transcript, sending, inputMode]);

  // Speech Synthesis Helper
  const speakText = (text: string) => {
    if (typeof window === 'undefined') return;

    // 1. Cancel any active native speech
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    // 2. Cancel any active ElevenLabs audio player
    if ((window as any).currentTtsAudio) {
      try {
        (window as any).currentTtsAudio.pause();
      } catch (e) {}
      (window as any).currentTtsAudio = null;
    }

    setIsSpeaking(true);
    const cleanText = text.replace(/[*_#`\-]/g, '');

    // 3. Check for ElevenLabs API Key in environment
    const elevenLabsKey = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_ELEVENLABS_API_KEY) || '';
    if (elevenLabsKey) {
      playElevenLabs(cleanText, elevenLabsKey);
    } else {
      playWebSpeech(cleanText);
    }
  };

  const playElevenLabs = async (text: string, apiKey: string) => {
    try {
      const voiceId = "pNInz6obpgq5epa5UR3f"; // Adam (highly realistic male voice)
      const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'xi-api-key': apiKey
        },
        body: JSON.stringify({
          text,
          model_id: 'eleven_monolingual_v1',
          voice_settings: { stability: 0.75, similarity_boost: 0.75 }
        })
      });

      if (!response.ok) throw new Error("ElevenLabs request failed");

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      
      audio.onplay = () => setIsSpeaking(true);
      audio.onended = () => {
        setIsSpeaking(false);
        const userTurnsCount = session?.transcript.filter(t => t.role === 'user').length ?? 0;
        if (inputMode === 'voice' && !evaluating && userTurnsCount < MAX_TURNS) {
          startListening();
        }
      };
      audio.onerror = () => setIsSpeaking(false);

      (window as any).currentTtsAudio = audio;
      audio.play();
    } catch (e) {
      console.warn("ElevenLabs TTS failed, falling back to Web Speech:", e);
      playWebSpeech(text);
    }
  };

  const playWebSpeech = (text: string) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      setIsSpeaking(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.05;

    // Get all English voices
    const voices = window.speechSynthesis.getVoices();
    const enVoices = voices.filter(v => v.lang.startsWith('en'));

    // Prioritize high-quality cloud / remote voices (localService === false) or voices with Online/Natural/Google/Aria in the name
    const bestVoice = enVoices.find(v => v.name.includes('Online') || v.name.includes('Natural') || v.name.includes('Microsoft Aria')) ||
                      enVoices.find(v => v.name.includes('Google')) ||
                      enVoices.find(v => v.localService === false) ||
                      enVoices[0];

    if (bestVoice) {
      utterance.voice = bestVoice;
    }

    utterance.onend = () => {
      setIsSpeaking(false);
      const userTurnsCount = session?.transcript.filter(t => t.role === 'user').length ?? 0;
      if (inputMode === 'voice' && !evaluating && userTurnsCount < MAX_TURNS) {
        startListening();
      }
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
    };

    window.speechSynthesis.speak(utterance);
  };

  // Trigger TTS on new coach responses
  useEffect(() => {
    if (session && session.transcript.length > 0) {
      const lastMsg = session.transcript[session.transcript.length - 1];
      if (lastMsg.role === 'assistant' && !evaluating) {
        speakText(lastMsg.content);
      }
    }
    return () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, [session?.transcript?.length, evaluating]);

  // Web Speech Recognition Initialization
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = true;
      rec.lang = 'en-US';

      rec.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
        setInputMsg(finalTranscript || interimTranscript);
      };

      rec.onerror = (e: any) => {
        console.error("Speech recognition error:", e);
        setIsRecording(false);
      };

      rec.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = rec;
    }
  }, []);

  const startListening = () => {
    if (!recognitionRef.current) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
    setInputMsg("");
    setIsRecording(true);
    try {
      recognitionRef.current.start();
    } catch (e) {
      console.warn("Speech recognition state conflict:", e);
    }
  };

  const stopListening = () => {
    if (!recognitionRef.current) return;
    try {
      recognitionRef.current.stop();
    } catch (e) {
      console.warn(e);
    }
    setIsRecording(false);
  };

  const handleSend = async (msgToSend?: string) => {
    const text = msgToSend || inputMsg.trim();
    if (!text || !session || !user || sending) return;

    setInputMsg("");
    setSending(true);

    const updatedTranscript = [...session.transcript, { role: 'user' as const, content: text }];
    const updatedSession = { ...session, transcript: updatedTranscript };
    setSession(updatedSession);
    await updateGymSession(session.id, { transcript: updatedTranscript });

    try {
      const aiReply = await getGymResponseFn(session.mode, session.topic, updatedTranscript);
      const finalTranscript = [...updatedTranscript, { role: 'assistant' as const, content: aiReply }];
      setSession({ ...session, transcript: finalTranscript });
      await updateGymSession(session.id, { transcript: finalTranscript });
    } catch (e) {
      console.error(e);
    } finally {
      setSending(false);
    }
  };

  const handleFinish = async () => {
    if (!session || !user || evaluating) return;
    setEvaluating(true);
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }

    try {
      const evaluation = await gradeGymSessionFn(session.mode, session.topic, session.transcript);
      await updateGymSession(session.id, {
        completed: true,
        depth_earned: evaluation.score,
        feedback_rubric: evaluation,
        completed_at: new Date().toISOString()
      });
      await recordGymDepth(user.id, evaluation.score);
      navigate({ to: "/gym/eval", search: { sessionId: session.id } });
    } catch (e) {
      console.error(e);
    } finally {
      setEvaluating(false);
    }
  };

  if (loading) {
    return (
      <PhoneFrame>
        <StatusBar />
        <div className="flex flex-1 flex-col items-center justify-center text-[var(--txt-ghost)]">
          Opening mental gym locker...
        </div>
      </PhoneFrame>
    );
  }

  if (!session) {
    return (
      <PhoneFrame>
        <StatusBar />
        <div className="flex flex-1 flex-col items-center justify-center px-6 text-center gap-4">
          <AlertCircle size={40} className="text-[var(--accent-coral)]" />
          <h2 className="gmj-heading text-[20px]">Session Not Found</h2>
          <button onClick={() => navigate({ to: "/gym" })} className="gmj-btn gmj-btn-primary">
            Return to Gym
          </button>
        </div>
      </PhoneFrame>
    );
  }

  const userTurnsCount = session.transcript.filter(t => t.role === 'user').length;
  const isSessionReadyToFinish = userTurnsCount >= MAX_TURNS;
  const lastCoachMessage = session.transcript.filter(m => m.role === 'assistant').slice(-1)[0]?.content || "";

  return (
    <PhoneFrame>
      <StatusBar />

      {/* Header */}
      <header className="flex flex-shrink-0 items-center justify-between border-b border-[rgba(255,255,255,0.06)] px-5 py-4 bg-[rgba(10,14,26,0.2)]">
        <button
          onClick={() => navigate({ to: "/gym" })}
          disabled={sending || evaluating}
          className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-[var(--glass-bg)] border border-[var(--glass-border)] text-xl text-[var(--txt-primary)] transition-transform active:scale-95"
        >
          <ArrowLeft size={18} />
        </button>
        <div className="flex flex-col items-center max-w-[60%]">
          <span className="text-[10px] font-bold text-[var(--accent-arctic)] uppercase tracking-wider">{session.mode}</span>
          <span className="text-[13px] text-[var(--txt-primary)] font-medium truncate w-full text-center">{session.topic}</span>
        </div>
        <div className="text-[11px] font-mono font-medium text-[var(--txt-secondary)] bg-[var(--glass-bg)] border border-[var(--glass-border)] px-2.5 py-1.5 rounded-full">
          Turn {Math.min(userTurnsCount + 1, MAX_TURNS)}/{MAX_TURNS}
        </div>
      </header>

      {/* Evaluation loader overlay */}
      {evaluating && (
        <div className="absolute inset-0 bg-[rgba(10,14,26,0.9)] z-50 flex flex-col items-center justify-center gap-4 px-6 text-center">
          <div className="relative">
            <div className="h-16 w-16 rounded-full border-2 border-[var(--color-spark)] border-t-transparent animate-spin" />
            <span className="absolute inset-0 flex items-center justify-center text-[18px]">🧠</span>
          </div>
          <h2 className="gmj-heading text-[22px] text-[var(--txt-primary)]">Evaluating Reasoning</h2>
          <p className="text-[14px] text-[var(--txt-secondary)] max-w-xs leading-relaxed">
            AI is grading your argument structure, steelmanning charity, and checking for logic fallacies...
          </p>
        </div>
      )}

      {/* Duolingo Progress Bar at top of Workspace */}
      <div className="px-5 pt-4 flex-shrink-0">
        <div className="w-full bg-[var(--glass-bg)] h-2.5 rounded-full overflow-hidden border border-[var(--glass-border)]">
          <div 
            className="h-full bg-gradient-to-r from-[var(--accent-arctic)] to-[#3DD4C8] transition-all duration-500 rounded-full"
            style={{ width: `${(userTurnsCount / MAX_TURNS) * 100}%` }}
          />
        </div>
      </div>

      {inputMode === 'voice' ? (
        /* ==========================================
           VOICE FIRST MODE (DUOLINGO-STYLE)
           ========================================== */
        <div className="flex-1 flex flex-col justify-between px-6 pb-6 pt-2 overflow-y-auto">
          
          {/* Top Avatar Ring + Speech Bubble */}
          <div className="flex-1 flex flex-col justify-center items-center gap-6">
            
            {/* Animated Mascot */}
            <div className="relative flex items-center justify-center mb-2" style={{ filter: 'drop-shadow(0 0 0px transparent)' }}>
              <NuanceMascot
                state={isSpeaking ? 'speaking' : isRecording ? 'listening' : 'idle'}
                size={148}
              />
            </div>

            {/* Coach Speech bubble */}
            <div className="gmj-glass p-5 rounded-[24px] rounded-tl-[4px] border-[rgba(255,255,255,0.08)] text-left relative max-w-sm w-full">
              <span className="text-[10px] font-bold text-[var(--txt-ghost)] uppercase tracking-wider block mb-1">Coach</span>
              <p className="text-[14.5px] leading-relaxed text-[var(--txt-primary)] mb-6 pr-4">
                <StreamingText text={lastCoachMessage} speed={25} />
              </p>
              
              {/* Tap to listen to text again */}
              <button 
                onClick={() => speakText(lastCoachMessage)}
                disabled={isSpeaking || isRecording || sending}
                className="absolute right-3.5 bottom-3.5 h-8 w-8 rounded-full flex items-center justify-center bg-[rgba(255,255,255,0.06)] border border-[var(--glass-border)] hover:bg-[rgba(255,255,255,0.12)] transition-colors text-[14px]"
              >
                <Volume2 size={15} className="text-[var(--accent-arctic)]" />
              </button>
            </div>

            {/* User Speech Transcription Preview bubble */}
            {!isSessionReadyToFinish && (
              <div className="min-h-[80px] max-w-sm w-full flex flex-col items-center justify-center px-4 py-3.5 rounded-[20px] bg-[rgba(255,255,255,0.02)] border border-dashed border-[var(--glass-border)] text-center">
                {inputMsg ? (
                  <div className="flex flex-col gap-1">
                    <span className="text-[9px] font-bold text-[var(--accent-arctic)] uppercase tracking-wider">Your Draft</span>
                    <p className="text-[14px] leading-relaxed text-[var(--txt-primary)] font-medium italic px-2">
                      "{inputMsg}"
                    </p>
                  </div>
                ) : isRecording ? (
                  <p className="text-[13px] text-[var(--accent-coral)] animate-pulse">Listening... speak now</p>
                ) : (
                  <p className="text-[13px] text-[var(--txt-ghost)]">Tap the mic to formulate your stance.</p>
                )}
              </div>
            )}
          </div>

          {/* Action Center (Voice buttons) */}
          <div className="flex flex-col items-center gap-4 mt-4">
            {isSessionReadyToFinish ? (
              <button
                onClick={handleFinish}
                className="gmj-btn gmj-btn-primary w-full py-4 text-center font-bold text-[15px] uppercase tracking-wider"
              >
                🏁 Finish & Grade Session
              </button>
            ) : isRecording ? (
              /* Listening Stop Button */
              <button
                onClick={stopListening}
                className="h-[84px] w-[84px] rounded-full border-2 border-[var(--accent-coral)] bg-[rgba(248,113,113,0.15)] text-[var(--accent-coral)] flex items-center justify-center transition-all animate-pulse"
              >
                <MicOff size={28} />
              </button>
            ) : inputMsg ? (
              /* Submit and Retry buttons after speech */
              <div className="flex items-center gap-4 w-full justify-center">
                <button
                  onClick={startListening}
                  className="h-14 w-14 rounded-full border border-[var(--glass-border)] bg-[var(--glass-bg)] text-[var(--txt-ghost)] hover:text-[var(--txt-primary)] flex items-center justify-center"
                >
                  <RotateCcw size={18} />
                </button>
                <button
                  onClick={() => handleSend()}
                  disabled={sending}
                  className="gmj-btn gmj-btn-primary flex-1 max-w-[200px] h-14 rounded-full flex items-center justify-center gap-2 font-bold"
                >
                  <Check size={18} /> Submit
                </button>
              </div>
            ) : (
              /* Tap to speak trigger */
              <button
                onClick={startListening}
                disabled={sending || isSpeaking}
                className="h-[84px] w-[84px] rounded-full border border-[var(--accent-arctic)] bg-[rgba(74,234,220,0.12)] text-[var(--accent-arctic)] flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-[0_6px_20px_rgba(74,234,220,0.2)]"
              >
                <Mic size={28} />
              </button>
            )}

            <button
              onClick={() => setInputMode('keyboard')}
              disabled={isRecording || sending}
              className="flex items-center gap-1.5 text-[12px] text-[var(--txt-ghost)] hover:text-[var(--txt-primary)] transition-colors mt-2"
            >
              <Keyboard size={13} /> Use Keyboard Input Instead
            </button>
          </div>
        </div>
      ) : (
        /* ==========================================
           KEYBOARD MODE (CLASSIC TRANSCRIPT CHAT)
           ========================================== */
        <div className="flex-1 flex flex-col justify-between overflow-hidden">
          
          {/* Scrollable chat board */}
          <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-4">
            {session.transcript.map((msg, index) => {
              const isAI = msg.role === 'assistant';
              return (
                <div
                  key={index}
                  className={`flex flex-col max-w-[85%] ${isAI ? 'self-start items-start' : 'self-end items-end'}`}
                >
                  {isAI && (
                    <div className="flex items-center gap-1.5 mb-1.5 ml-1">
                      <div className="flex-shrink-0" style={{ marginTop: '-4px' }}>
                        <NuanceMascot
                          state={isAI && index === session.transcript.length - 1 && sending ? 'speaking' : 'idle'}
                          size={32}
                        />
                      </div>
                      <span className="text-[10px] font-bold text-[var(--txt-ghost)] uppercase tracking-wider">
                        Coach
                      </span>
                    </div>
                  )}
                  <div
                    className={`p-4 text-[14px] leading-relaxed rounded-[20px] ${
                      isAI
                        ? 'gmj-glass border-[rgba(255,255,255,0.08)] text-[var(--txt-primary)] rounded-tl-[4px] text-left'
                        : 'bg-gradient-to-br from-[var(--accent-arctic)] to-[#3DD4C8] text-[var(--depth-abyss)] font-medium rounded-tr-[4px] text-left'
                    }`}
                  >
                    {isAI && index === session.transcript.length - 1 ? (
                      <StreamingText 
                        text={msg.content} 
                        speed={25} 
                        onUpdate={() => {
                          transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
                        }}
                      />
                    ) : (
                      msg.content
                    )}
                  </div>
                </div>
              );
            })}

            {sending && (
              <div className="flex flex-col max-w-[85%] self-start items-start">
                <div className="flex items-center gap-1.5 mb-1.5 ml-1">
                  <div className="flex-shrink-0" style={{ marginTop: '-4px' }}>
                    <NuanceMascot state="speaking" size={32} />
                  </div>
                  <span className="text-[10px] font-bold text-[var(--txt-ghost)] uppercase tracking-wider">
                    Coach
                  </span>
                </div>
                <div className="gmj-glass border-[rgba(255,255,255,0.08)] p-4 rounded-[20px] rounded-tl-[4px] flex gap-1.5 items-center justify-center">
                  <div className="h-1.5 w-1.5 rounded-full bg-[var(--accent-arctic)] animate-pulse" />
                  <div className="h-1.5 w-1.5 rounded-full bg-[var(--accent-arctic)] animate-pulse" style={{ animationDelay: '0.2s' }} />
                  <div className="h-1.5 w-1.5 rounded-full bg-[var(--accent-arctic)] animate-pulse" style={{ animationDelay: '0.4s' }} />
                </div>
              </div>
            )}

            <div ref={transcriptEndRef} />
          </div>

          {/* Keyboard input footer */}
          <footer className="border-t border-[rgba(255,255,255,0.06)] p-4 bg-[rgba(10,14,26,0.4)] flex flex-shrink-0 flex-col gap-3">
            {isSessionReadyToFinish ? (
              <button
                onClick={handleFinish}
                disabled={evaluating}
                className="gmj-btn gmj-btn-primary py-4 text-center font-bold"
              >
                🏁 Finish & Grade Session
              </button>
            ) : (
              <div className="flex flex-col gap-2">
                <div className="relative flex items-center">
                  <input
                    type="text"
                    placeholder="Formulate your argument..."
                    value={inputMsg}
                    onChange={(e) => setInputMsg(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    disabled={sending}
                    className="gmj-input pr-12 text-[14px] py-4"
                  />
                  <button
                    onClick={() => handleSend()}
                    disabled={sending || !inputMsg.trim()}
                    className="absolute right-3 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full flex items-center justify-center text-[var(--accent-arctic)] disabled:text-[var(--txt-ghost)] transition-colors"
                  >
                    <Send size={16} />
                  </button>
                </div>
                
                <button
                  onClick={() => setInputMode('voice')}
                  disabled={sending}
                  className="flex items-center justify-center gap-1 text-[11px] text-[var(--txt-ghost)] hover:text-[var(--txt-primary)] transition-colors py-1.5"
                >
                  <Mic size={12} /> Switch to Duolingo Voice Mode
                </button>
              </div>
            )}
          </footer>
        </div>
      )}
    </PhoneFrame>
  );
}

