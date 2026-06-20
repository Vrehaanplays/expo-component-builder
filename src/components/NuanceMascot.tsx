import { useState, useEffect } from "react";

interface NuanceMascotProps {
  state?: "idle" | "speaking" | "listening";
  size?: number;
  imageUrl?: string;
}

export function NuanceMascot({ state = "idle", size = 160, imageUrl = "/mascot.png" }: NuanceMascotProps) {
  const isSpeaking = state === "speaking";
  const isListening = state === "listening";

  return (
    <div
      style={{
        width: size,
        height: size,
        position: "relative",
        display: "flex",
        alignItems: "flex-end", // Align to bottom so squish/stretch anchors at the feet
        justifyContent: "center",
        filter: isSpeaking 
          ? "drop-shadow(0 0 20px rgba(74,234,220,0.4))" 
          : isListening 
          ? "drop-shadow(0 0 20px rgba(248,113,113,0.3))" 
          : "drop-shadow(0 8px 16px rgba(0,0,0,0.4))",
        transition: "filter 0.5s ease"
      }}
    >
      <style>{`
        /* 
          Psychological Animation: Macro-Physics (Squish & Stretch)
          Avoids the uncanny valley by animating body weight and breath 
          instead of micro-expressions.
        */
        
        @keyframes physics-breathe {
          0%, 100% { transform: scaleY(1) scaleX(1) translateY(0px); }
          50%      { transform: scaleY(1.03) scaleX(0.98) translateY(-2px); }
        }
        
        @keyframes physics-speak-bounce {
          0%, 100% { transform: scaleY(1) scaleX(1) translateY(0px) rotate(0deg); }
          25%      { transform: scaleY(1.06) scaleX(0.96) translateY(-6px) rotate(-1.5deg); }
          50%      { transform: scaleY(0.96) scaleX(1.04) translateY(2px) rotate(0deg); }
          75%      { transform: scaleY(1.04) scaleX(0.97) translateY(-4px) rotate(1.5deg); }
        }
        
        @keyframes physics-listen-lean {
          0%, 100% { transform: scale(1.08) translateY(-4px); }
          50%      { transform: scale(1.09) translateY(-5px); } /* Subtle heartbeat */
        }

        .mascot-physics-idle {
          transform-origin: bottom center;
          animation: physics-breathe 3.5s ease-in-out infinite;
          transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .mascot-physics-speaking {
          transform-origin: bottom center;
          animation: physics-speak-bounce 0.6s cubic-bezier(0.28, 0.84, 0.42, 1) infinite;
          transition: transform 0.2s ease-out;
        }

        .mascot-physics-listening {
          transform-origin: bottom center;
          animation: physics-listen-lean 1.2s ease-in-out infinite;
          transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
      `}</style>

      {/* ── SOUND WAVES (only when speaking) ─────────────── */}
      {isSpeaking && (
        <>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full rounded-full border border-[rgba(74,234,220,0.15)] animate-ping" style={{ animationDuration: '1.2s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] rounded-full border border-[rgba(74,234,220,0.1)] animate-ping" style={{ animationDuration: '1.6s', animationDelay: '0.4s' }} />
        </>
      )}

      {/* ── LISTEN RIPPLES (only when recording) ─────────── */}
      {isListening && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[110%] h-[110%] rounded-full border border-[rgba(248,113,113,0.15)] animate-ping" style={{ animationDuration: '1s' }} />
      )}

      {/* ── MASCOT IMAGE WITH PHYSICS WRAPPER ────────────── */}
      <img 
        src={imageUrl} 
        alt="Nuance Mascot" 
        className={
          isSpeaking ? "mascot-physics-speaking" 
          : isListening ? "mascot-physics-listening" 
          : "mascot-physics-idle"
        }
        style={{ 
          width: "100%", 
          height: "100%", 
          objectFit: "contain",
          // The glass circle wrapper from before:
          borderRadius: "50%",
          backgroundColor: isListening ? "rgba(248,113,113,0.05)" : isSpeaking ? "rgba(74,234,220,0.05)" : "rgba(255,255,255,0.02)",
          border: isListening ? "1px solid rgba(248,113,113,0.2)" : isSpeaking ? "1px solid rgba(74,234,220,0.2)" : "1px solid rgba(255,255,255,0.05)",
        }} 
      />
    </div>
  );
}
