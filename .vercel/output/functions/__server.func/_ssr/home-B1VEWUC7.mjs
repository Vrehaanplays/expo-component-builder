import { j as jsxRuntimeExports } from "../_libs/react.mjs";
import { L as Link } from "../_libs/tanstack__react-router.mjs";
import { P as PhoneFrame } from "./PhoneFrame-CRYtO82I.mjs";
import { B as BottomNav } from "./BottomNav-Cfbe8JNL.mjs";
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
function Home() {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(PhoneFrame, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "flex flex-shrink-0 items-center justify-between px-6 pb-5 pt-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 rounded-full px-3 py-1.5", style: {
        background: "rgba(255,206,0,0.12)",
        border: "1px solid rgba(255,206,0,0.2)"
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm", children: "🔥" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[13px] font-semibold text-[var(--sharp)]", children: "7 day streak" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-right", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xl font-bold tracking-[-0.03em] text-[var(--ghost)]", children: "4,820" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] uppercase tracking-[0.08em] text-[var(--muted)]", children: "Total pts" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 overflow-hidden px-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-3 text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--muted)]", children: "Today's challenge" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/scenario", className: "relative mb-3 block cursor-pointer overflow-hidden rounded-[20px] border border-[var(--border)] bg-[var(--surface)] p-5 transition-transform active:scale-[0.98]", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute left-0 right-0 top-0 h-0.5", style: {
          background: "var(--strike)"
        } }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "gmj-tag mb-3.5", children: "🧩 Argument" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "mb-4 text-[17px] font-semibold leading-[1.4] tracking-[-0.02em] text-[var(--ghost)]", children: '"Studies show multitasking boosts productivity — so open more tabs."' }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-[var(--muted)]", children: "🧑 2,341 played today" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-semibold text-[var(--strike)]", children: "Tap to start →" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/leaderboard", className: "mb-3 flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--surface2)] px-[18px] py-3.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-[var(--muted)]", children: "Your global rank" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[18px] font-bold tracking-[-0.03em] text-[var(--ghost)]", children: "#142" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs font-semibold text-[var(--strike)]", children: "▲ 14 today" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-[20px] border border-[var(--border)] bg-[var(--surface)] p-5", style: {
        opacity: 0.5,
        pointerEvents: "none"
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "gmj-tag mb-3.5", style: {
          background: "rgba(107,107,114,0.1)",
          borderColor: "rgba(107,107,114,0.2)",
          color: "var(--muted)"
        }, children: "🔒 More tomorrow" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[15px] text-[var(--muted)]", children: "Complete today's challenge to unlock the next one." })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(BottomNav, {})
  ] });
}
export {
  Home as component
};
