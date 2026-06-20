import { useEffect, useState, useRef } from "react";

interface StreamingTextProps {
  text: string;
  speed?: number; // ms per word
  onComplete?: () => void;
  onUpdate?: () => void; // Triggered when new words are added (useful for scroll-to-bottom)
  className?: string;
}

export function StreamingText({
  text,
  speed = 30, // Default to 30ms per word (very fast but noticeably streamed)
  onComplete,
  onUpdate,
  className = "",
}: StreamingTextProps) {
  const [visibleCount, setVisibleCount] = useState(0);
  const words = text ? text.split(" ") : [];
  const timerRef = useRef<any>(null);
  const onUpdateRef = useRef(onUpdate);

  // Sync ref to avoid re-triggering useEffect
  useEffect(() => {
    onUpdateRef.current = onUpdate;
  }, [onUpdate]);

  useEffect(() => {
    setVisibleCount(0);
    if (timerRef.current) clearInterval(timerRef.current);

    if (!text || words.length === 0) {
      if (onComplete) onComplete();
      return;
    }

    let current = 0;
    timerRef.current = setInterval(() => {
      current += 1;
      setVisibleCount(current);
      if (onUpdateRef.current) {
        onUpdateRef.current();
      }
      if (current >= words.length) {
        clearInterval(timerRef.current);
        if (onComplete) onComplete();
      }
    }, speed);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [text, speed]);

  return (
    <span className={`inline-block ${className}`}>
      {words.map((word, i) => {
        const isVisible = i < visibleCount;
        return (
          <span
            key={i}
            className="inline-block"
            style={{
              opacity: isVisible ? 1 : 0,
              transform: isVisible ? "translateY(0) scale(1)" : "translateY(4px) scale(0.96)",
              filter: isVisible ? "blur(0px)" : "blur(2px)",
              transition: "opacity 0.22s cubic-bezier(0.16, 1, 0.3, 1), transform 0.28s cubic-bezier(0.16, 1, 0.3, 1), filter 0.22s cubic-bezier(0.16, 1, 0.3, 1)",
              marginRight: "0.26em",
              willChange: "opacity, transform, filter",
            }}
          >
            {word}
          </span>
        );
      })}
      {visibleCount < words.length && (
        <span
          className="inline-block h-3.5 w-1.5 bg-[var(--accent-arctic)] rounded-full align-middle animate-pulse"
          style={{
            boxShadow: "0 0 10px var(--accent-arctic), 0 0 4px var(--accent-arctic)",
            marginLeft: "2.5px",
            verticalAlign: "middle",
          }}
        />
      )}
    </span>
  );
}
