import { type ReactNode, useEffect, useRef } from "react";

export function PhoneFrame({ children }: { children: ReactNode }) {
  const stageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    // Inject ambient sparkle dots
    const sparkles = [
      { size: 3, x: 12, y: 18, dur: 3.8, delay: 0 },
      { size: 2, x: 78, y: 8,  dur: 4.5, delay: 0.7 },
      { size: 4, x: 55, y: 35, dur: 5.2, delay: 1.2 },
      { size: 2, x: 88, y: 55, dur: 3.4, delay: 0.3 },
      { size: 3, x: 25, y: 72, dur: 4.8, delay: 1.8 },
      { size: 2, x: 65, y: 85, dur: 3.9, delay: 0.9 },
      { size: 3, x: 40, y: 15, dur: 5.1, delay: 2.1 },
    ];
    const els: HTMLElement[] = [];
    sparkles.forEach((s) => {
      const el = document.createElement("div");
      el.className = "gmj-sparkle";
      el.style.cssText = `
        width:${s.size}px;height:${s.size}px;
        left:${s.x}%;top:${s.y}%;
        --dur:${s.dur}s;--delay:${s.delay}s;
        opacity:0.6;
      `;
      stage.appendChild(el);
      els.push(el);
    });
    return () => els.forEach((el) => el.remove());
  }, []);

  return (
    <div className="gmj-stage" ref={stageRef}>
      <div className="gmj-device">
        <div className="gmj-screen">{children}</div>
      </div>
    </div>
  );
}

export function StatusBar() {
  return (
    <div className="gmj-statusbar">
      <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 12 }}>9:41</span>
      <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
        <svg width="16" height="11" viewBox="0 0 16 11" fill="none">
          <rect x="0" y="4" width="3" height="7" rx="1" fill="currentColor" opacity="0.4"/>
          <rect x="4" y="2.5" width="3" height="8.5" rx="1" fill="currentColor" opacity="0.6"/>
          <rect x="8" y="0.5" width="3" height="10.5" rx="1" fill="currentColor" opacity="0.85"/>
          <rect x="12" y="0" width="3" height="11" rx="1" fill="currentColor"/>
        </svg>
        <svg width="15" height="11" viewBox="0 0 15 11" fill="none">
          <path d="M7.5 2.2C9.8 2.2 11.8 3.1 13.3 4.6L14.7 3.2C12.8 1.2 10.3 0 7.5 0 4.7 0 2.2 1.2.3 3.2l1.4 1.4C3.2 3.1 5.2 2.2 7.5 2.2z" fill="currentColor" opacity="0.5"/>
          <path d="M7.5 5.5C9 5.5 10.4 6.1 11.4 7.1l1.4-1.4C11.3 4.3 9.5 3.5 7.5 3.5c-2 0-3.8.8-5.3 2.2l1.4 1.4C4.6 6.1 6 5.5 7.5 5.5z" fill="currentColor" opacity="0.75"/>
          <circle cx="7.5" cy="10" r="1.5" fill="currentColor"/>
        </svg>
        <svg width="25" height="12" viewBox="0 0 25 12" fill="none">
          <rect x="0.5" y="0.5" width="21" height="11" rx="3.5" stroke="currentColor" strokeOpacity="0.35"/>
          <rect x="2" y="2" width="17" height="8" rx="2" fill="currentColor"/>
          <path d="M23 4v4a2 2 0 000-4z" fill="currentColor" opacity="0.4"/>
        </svg>
      </div>
    </div>
  );
}
