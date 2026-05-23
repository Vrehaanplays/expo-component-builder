import { j as jsxRuntimeExports } from "../_libs/react.mjs";
import { u as useLocation, L as Link } from "../_libs/tanstack__react-router.mjs";
const items = [
  { to: "/home", icon: "🏠", label: "Home" },
  { to: "/leaderboard", icon: "🏆", label: "Ranks" },
  { to: "/profile", icon: "👤", label: "Profile" }
];
function BottomNav() {
  const { pathname } = useLocation();
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "gmj-bottom-nav", children: items.map((it) => {
    const active = pathname === it.to;
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: it.to, className: `gmj-nav-item ${active ? "active" : ""}`, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "gmj-nav-icon", children: it.icon }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "gmj-nav-label", style: active ? { color: "var(--strike)" } : void 0, children: it.label })
    ] }, it.to);
  }) });
}
export {
  BottomNav as B
};
