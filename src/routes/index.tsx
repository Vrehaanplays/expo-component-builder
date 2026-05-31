import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { PhoneFrame } from "@/components/PhoneFrame";
import { useAuthContext } from "@/lib/auth-context";

export const Route = createFileRoute("/")({
  component: Splash,
  head: () => ({
    meta: [
      { title: "Nuance — Train your judgment" },
      { name: "description", content: "Outthink the room. A gamified social reasoning app." },
    ],
  }),
});

function Splash() {
  const navigate = useNavigate();
  const { session, loading } = useAuthContext();

  useEffect(() => {
    if (loading) return;
    const t = setTimeout(() => {
      navigate({ to: session ? "/home" : "/onboarding" });
    }, 1800);
    return () => clearTimeout(t);
  }, [navigate, session, loading]);

  return (
    <PhoneFrame>
      <div className="flex h-full flex-col items-center justify-center gap-5">
        {/* Logo mark */}
        <div className="relative">
          <div
            className="absolute inset-0 rounded-[28px] blur-[28px] opacity-50"
            style={{ background: "var(--accent-arctic)" }}
          />
          <div
            className="relative flex h-[88px] w-[88px] items-center justify-center rounded-[28px] text-[40px] font-bold"
            style={{
              background: "linear-gradient(135deg, var(--accent-arctic) 0%, #3DD4C8 100%)",
              color: "var(--depth-abyss)",
              boxShadow: "0 8px 32px rgba(74,234,220,0.35)",
            }}
          >
            N
          </div>
        </div>

        <div className="text-center">
          <h1 className="gmj-display text-[36px]">Nuance</h1>
          <p className="mt-2 text-[15px] tracking-wide text-[var(--text-secondary)]">
            Train your judgment.
          </p>
        </div>

        {/* Loading dots */}
        <div className="mt-4 flex gap-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-1.5 w-1.5 rounded-full bg-[var(--accent-arctic)]"
              style={{
                animation: `twinkle 1.2s ease-in-out infinite`,
                animationDelay: `${i * 0.2}s`,
                opacity: 0.6,
              }}
            />
          ))}
        </div>
      </div>
    </PhoneFrame>
  );
}
