import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { P as PhoneFrame } from "./PhoneFrame-CRYtO82I.mjs";
import { B as BottomNav } from "./BottomNav-Cfbe8JNL.mjs";
import "../_libs/tanstack__react-router.mjs";
import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "node:stream/web";
import "node:stream";
import "../_libs/react-dom.mjs";
import "util";
import "crypto";
import "async_hooks";
import "stream";
import "../_libs/isbot.mjs";
const rows = [{
  rank: 1,
  name: "n_karim",
  initials: "NK",
  streak: 21,
  score: 9240,
  medal: "gold"
}, {
  rank: 2,
  name: "arjun_s",
  initials: "AS",
  streak: 14,
  score: 8810,
  medal: "silver"
}, {
  rank: 3,
  name: "zara_k",
  initials: "ZK",
  streak: 9,
  score: 7990,
  medal: "bronze"
}, {
  rank: 4,
  name: "m_ravi",
  initials: "MR",
  streak: 6,
  score: 6720
}, {
  rank: 5,
  name: "p_lee",
  initials: "PL",
  streak: 4,
  score: 5440
}];
const medalColors = {
  gold: "#FFD700",
  silver: "#C0C0C0",
  bronze: "#CD7F32"
};
function Leaderboard() {
  const [tab, setTab] = reactExports.useState("today");
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(PhoneFrame, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-shrink-0 px-6 pb-4 pt-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "mb-4 text-[22px] font-bold tracking-[-0.03em] text-[var(--ghost)]", children: "Leaderboard" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-2", children: ["today", "all"].map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setTab(t), className: "rounded-lg border-none px-4 py-[7px] text-[13px] font-semibold transition-colors", style: {
        background: tab === t ? "var(--strike)" : "var(--surface2)",
        color: tab === t ? "var(--void)" : "var(--muted)"
      }, children: t === "today" ? "Today" : "All time" }, t)) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 overflow-y-auto px-4", children: [
      rows.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3.5 border-b border-[var(--border)] px-2 py-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-6 text-center font-mono text-[13px] font-bold", style: {
          color: r.medal ? medalColors[r.medal] : "var(--muted)"
        }, children: r.rank }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-[10px] text-[13px] font-bold", style: {
          background: r.medal ? `${medalColors[r.medal]}1f` : "var(--surface2)",
          color: r.medal ? medalColors[r.medal] : "var(--ghost)"
        }, children: r.initials }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-semibold text-[var(--ghost)]", children: r.name }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-0.5 text-[11px] text-[var(--muted)]", children: [
            "🔥 ",
            r.streak,
            " streak"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-mono text-[15px] font-bold tracking-[-0.02em] text-[var(--ghost)]", children: r.score.toLocaleString() })
      ] }, r.rank)),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-2 flex items-center gap-3.5 rounded-[10px] border px-2 py-3", style: {
        background: "rgba(0,240,192,0.06)",
        borderColor: "rgba(0,240,192,0.15)"
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-6 text-center font-mono text-[13px] font-bold text-[var(--strike)]", children: "142" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-[10px] text-[13px] font-bold", style: {
          background: "rgba(0,240,192,0.15)",
          color: "var(--strike)"
        }, children: "YO" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-semibold text-[var(--strike)]", children: "you" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-0.5 text-[11px] text-[var(--muted)]", children: "🔥 8 streak" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-mono text-[15px] font-bold tracking-[-0.02em] text-[var(--strike)]", children: "4,820" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(BottomNav, {})
  ] });
}
export {
  Leaderboard as component
};
