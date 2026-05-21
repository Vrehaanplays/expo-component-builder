import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { PhoneFrame } from "@/components/PhoneFrame";

export const Route = createFileRoute("/")({
  component: Splash,
  head: () => ({
    meta: [
      { title: "GMJ — Train your judgment" },
      { name: "description", content: "Outthink the room. A gamified social reasoning app." },
    ],
  }),
});

function Splash() {
  const navigate = useNavigate();
  useEffect(() => {
    const t = setTimeout(() => navigate({ to: "/onboarding" }), 1800);
    return () => clearTimeout(t);
  }, [navigate]);

  return (
    <PhoneFrame>
      <div className="flex h-full flex-col items-center justify-center gap-4">
        <div
          className="flex h-[72px] w-[72px] items-center justify-center rounded-[20px] text-[32px] font-bold"
          style={{ background: "var(--strike)", color: "var(--void)" }}
        >
          G
        </div>
        <h1 className="text-[28px] font-bold tracking-[-0.04em] text-[var(--ghost)]">GMJ</h1>
        <p className="text-sm tracking-wide text-[var(--muted)]">Train your judgment.</p>
      </div>
    </PhoneFrame>
  );
}
