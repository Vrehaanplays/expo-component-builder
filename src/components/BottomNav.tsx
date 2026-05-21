import { Link, useLocation } from "@tanstack/react-router";

const items = [
  { to: "/home", icon: "🏠", label: "Home" },
  { to: "/leaderboard", icon: "🏆", label: "Ranks" },
  { to: "/profile", icon: "👤", label: "Profile" },
] as const;

export function BottomNav() {
  const { pathname } = useLocation();
  return (
    <div className="gmj-bottom-nav">
      {items.map((it) => {
        const active = pathname === it.to;
        return (
          <Link key={it.to} to={it.to} className={`gmj-nav-item ${active ? "active" : ""}`}>
            <div className="gmj-nav-icon">{it.icon}</div>
            <div className="gmj-nav-label" style={active ? { color: "var(--strike)" } : undefined}>
              {it.label}
            </div>
          </Link>
        );
      })}
    </div>
  );
}
