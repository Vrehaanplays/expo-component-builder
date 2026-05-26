import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { PhoneFrame, StatusBar } from "@/components/PhoneFrame";
import { useAuthContext } from "@/lib/auth-context";

export const Route = createFileRoute("/auth")({
  component: Auth,
  head: () => ({ meta: [{ title: "GMJ — Sign up" }] }),
});

function Auth() {
  const navigate = useNavigate();
  const { signUp, signIn, signInWithGoogle } = useAuthContext();

  const [mode, setMode] = useState<"signup" | "signin">("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError(null);
    if (!email || !password) { setError("Email and password required."); return; }
    if (mode === "signup" && !username) { setError("Pick a username."); return; }

    setLoading(true);
    const { error: err } = mode === "signup"
      ? await signUp(email, password, username)
      : await signIn(email, password);
    setLoading(false);

    if (err) { setError(err.message); return; }
    navigate({ to: "/home" });
  };

  const handleGoogle = async () => {
    setError(null);
    const { error: err } = await signInWithGoogle();
    if (err) setError(err.message);
    // Google redirects automatically — no navigate needed
  };

  return (
    <PhoneFrame>
      <StatusBar />
      <div className="flex flex-1 flex-col justify-end px-6 pb-8 pt-8">
        <h1 className="gmj-display mb-2 text-[32px]">
          {mode === "signup" ? "Create account" : "Welcome back"}
        </h1>
        <p className="mb-8 text-[15px] text-[var(--txt-secondary)]">
          {mode === "signup" ? "Join the arena. Start training." : "Back in the arena."}
        </p>

        <div className="gmj-float gmj-float-d1 mb-8 flex flex-col gap-3">
          {mode === "signup" && (
            <input
              id="auth-username"
              className="gmj-input"
              type="text"
              placeholder="Username (shown on leaderboard)"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
            />
          )}
          <input
            id="auth-email"
            className="gmj-input"
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
          <input
            id="auth-password"
            className="gmj-input"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete={mode === "signup" ? "new-password" : "current-password"}
          />
          {error && (
            <p className="text-[13px] font-medium" style={{ color: "var(--color-coral)" }}>
              {error}
            </p>
          )}
        </div>

        <div className="gmj-float gmj-float-d2 flex flex-col gap-3">
          <button
            id="auth-submit"
            className="gmj-btn gmj-btn-primary"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? "..." : mode === "signup" ? "Sign up" : "Sign in"}
          </button>

          <div className="my-2 flex items-center gap-3">
            <div className="h-px flex-1 bg-[var(--color-border)]" />
            <span className="text-[11px] font-semibold uppercase tracking-[0.05em] text-[var(--txt-ghost)]">or</span>
            <div className="h-px flex-1 bg-[var(--color-border)]" />
          </div>

          <button
            id="auth-google"
            className="gmj-btn gmj-btn-ghost flex items-center justify-center gap-2"
            onClick={handleGoogle}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>

          <button
            id="auth-toggle"
            className="gmj-btn gmj-btn-outline"
            onClick={() => { setMode(mode === "signup" ? "signin" : "signup"); setError(null); }}
          >
            {mode === "signup" ? "Already have an account" : "Create account instead"}
          </button>
        </div>
      </div>
    </PhoneFrame>
  );
}
