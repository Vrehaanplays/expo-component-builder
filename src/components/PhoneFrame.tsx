import { type ReactNode, useEffect, useRef, useState } from "react";

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
  return <div style={{ height: 16 }} />;
}
