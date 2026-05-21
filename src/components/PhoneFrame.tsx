import { type ReactNode } from "react";

export function PhoneFrame({ children }: { children: ReactNode }) {
  return (
    <div className="gmj-stage">
      <div className="gmj-device">
        <div className="gmj-screen">{children}</div>
      </div>
    </div>
  );
}

export function StatusBar() {
  return (
    <div className="gmj-statusbar">
      <span>9:41</span>
      <span>●●●</span>
    </div>
  );
}
