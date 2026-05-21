import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { PhoneFrame, StatusBar } from "@/components/PhoneFrame";

export const Route = createFileRoute("/auth")({
  component: Auth,
  head: () => ({ meta: [{ title: "GMJ — Sign up" }] }),
});

function Auth() {
  const navigate = useNavigate();
  const go = () => navigate({ to: "/home" });

  return (
    <PhoneFrame>
      <StatusBar />
      <div className="flex flex-1 flex-col justify-end px-6 pb-8 pt-8">
        <h1 className="mb-1.5 text-[28px] font-bold tracking-[-0.04em] text-[var(--ghost)]">
          Create account
        </h1>
        <p className="mb-8 text-sm text-[var(--muted)]">Join the arena. Start training.</p>

        <input className="gmj-input mb-3" type="email" placeholder="Email address" />
        <input className="gmj-input mb-1" type="password" placeholder="Password" />

        <button className="gmj-btn gmj-btn-primary mt-2" onClick={go}>
          Sign up
        </button>

        <div className="my-4 flex items-center gap-3">
          <div className="h-px flex-1 bg-[var(--border)]" />
          <span className="text-xs text-[var(--muted)]">or</span>
          <div className="h-px flex-1 bg-[var(--border)]" />
        </div>

        <button className="gmj-btn gmj-btn-ghost" onClick={go}>
          Continue with Google
        </button>
        <button className="gmj-btn gmj-btn-outline mt-2.5" onClick={go}>
          Already have an account
        </button>
      </div>
    </PhoneFrame>
  );
}
