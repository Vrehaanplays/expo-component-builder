import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { PhoneFrame, StatusBar } from "@/components/PhoneFrame";
import { BottomNav } from "@/components/BottomNav";
import { useAuthContext } from "@/lib/auth-context";
import { useProfile } from "@/hooks/use-profile";
import { getRankTier } from "@/lib/game-service";

export const Route = createFileRoute("/profile")({
  component: Profile,
  head: () => ({ meta: [{ title: "Nuance — Profile" }] }),
});

function Profile() {
  const navigate = useNavigate();
  const { user, session, loading: authLoading, signOut } = useAuthContext();
  const { profile, loading: profileLoading } = useProfile(user?.id);

  useEffect(() => {
    if (!authLoading && !session) navigate({ to: "/auth" });
  }, [authLoading, session, navigate]);

  const isLoading = authLoading || profileLoading;
  const initials = profile?.username
    ? profile.username.slice(0, 2).toUpperCase()
    : user?.email?.slice(0, 2).toUpperCase() ?? "??";

  const stats = [
    { value: isLoading ? "—" : (profile?.total_shards ?? 0).toLocaleString(), label: "Total ⚡", highlight: true },
    { value: isLoading ? "—" : `🔥 ${profile?.current_streak ?? 0}`, label: "Day streak", color: "var(--color-starlight)" },
    { value: isLoading ? "—" : `${Math.round(profile?.accuracy_percent ?? 0)}%`, label: "Accuracy" },
    { value: isLoading ? "—" : String(profile?.sessions_played ?? 0), label: "Sessions" },
  ];

  const handleSignOut = async () => {
    await signOut();
    navigate({ to: "/" });
  };

  return (
    <PhoneFrame>
      <StatusBar />
      <div className="flex-shrink-0 px-6 pb-4 pt-3">
        <h1 className="gmj-display text-[28px]">Profile</h1>
      </div>

      {/* Avatar + name card */}
      <div
        className="gmj-float gmj-float-d1 mx-5 mb-5 flex items-center gap-4 rounded-[24px] bg-[var(--glass-bg)] border border-[var(--glass-border)] p-5 shadow-[0_8px_32px_rgba(0,0,0,0.2)]"
        style={{ backdropFilter: "blur(16px)" }}
      >
        <div
          className="flex h-[64px] w-[64px] flex-shrink-0 items-center justify-center rounded-[18px] text-[24px] font-bold text-[var(--color-arctic)]"
          style={{ background: "rgba(74,234,220,0.15)", border: "2px solid rgba(74,234,220,0.3)" }}
        >
          {initials}
        </div>
        <div>
          <div className="gmj-heading text-[22px] text-[var(--txt-primary)]">
            {isLoading ? "—" : (profile?.username ?? user?.email?.split("@")[0] ?? "—")}
          </div>
          <div className="mt-1 flex items-center gap-1.5 text-[13px] font-medium text-[var(--txt-ghost)]">
            <span>{isLoading ? "—" : getRankTier(profile?.total_shards ?? 0)}</span>
            <span>•</span>
            <span>{isLoading ? "—" : profile?.rank_position ? `Rank #${profile.rank_position}` : "Unranked"}</span>
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div className="gmj-float gmj-float-d2 mb-6 grid grid-cols-2 gap-3 px-5">
        {stats.map((s) => (
          <div key={s.label} className="gmj-glass rounded-[18px] px-5 py-4">
            <div
              className="gmj-stat-num text-[26px]"
              style={{ color: s.highlight ? "var(--color-arctic)" : s.color ?? "var(--txt-primary)" }}
            >
              {s.value}
            </div>
            <div className="gmj-stat-label mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Sign out + Debug */}
      <div className="mx-5 mb-4 flex flex-col gap-3">
        <button
          id="profile-signout"
          className="gmj-btn gmj-btn-outline w-full"
          onClick={handleSignOut}
          style={{ borderColor: "rgba(255,100,100,0.3)", color: "var(--color-coral)" }}
        >
          Sign out
        </button>
        <Link
          to="/debug"
          className="text-center text-[12px] font-semibold text-[var(--txt-ghost)] hover:text-[var(--color-spark)] underline mt-2"
        >
          ⚙️ Open Testing Dashboard
        </Link>
      </div>

      <div className="flex-1" />
      <BottomNav />
    </PhoneFrame>
  );
}
