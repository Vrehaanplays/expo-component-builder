import { j as jsxRuntimeExports } from "../_libs/react.mjs";
import { d as useNavigate } from "../_libs/tanstack__react-router.mjs";
import { P as PhoneFrame } from "./PhoneFrame-CRYtO82I.mjs";
import { R as Route$2 } from "./router-CL0nirmC.mjs";
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
import "../_libs/tanstack__query-core.mjs";
import "../_libs/tanstack__react-query.mjs";
import "../_libs/zod.mjs";
function Feedback() {
  const navigate = useNavigate();
  const {
    correct
  } = Route$2.useSearch();
  const isCorrect = correct === 1;
  return /* @__PURE__ */ jsxRuntimeExports.jsx(PhoneFrame, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-1 flex-col items-center justify-center px-6 py-8 text-center", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-5 flex h-[88px] w-[88px] items-center justify-center rounded-[24px] text-[40px]", style: {
      background: isCorrect ? "rgba(0,240,192,0.12)" : "rgba(255,61,90,0.12)",
      color: isCorrect ? "var(--strike)" : "var(--alert)"
    }, children: isCorrect ? "✓" : "✗" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-1.5 text-[26px] font-bold tracking-[-0.04em]", style: {
      color: isCorrect ? "var(--strike)" : "var(--alert)"
    }, children: isCorrect ? "Sharp." : "Missed it." }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-7 text-[48px] font-bold tracking-[-0.05em] text-[var(--sharp)]", children: isCorrect ? "+150 pts" : "+0 pts" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-6 w-full rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-5 py-4 text-left", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-2 text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--muted)]", children: isCorrect ? "Why you're right" : "What you missed" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm leading-[1.65] text-[var(--ghost)]", children: [
        "The argument commits a ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: "false cause fallacy" }),
        ' — it cites "studies" without specifying them, then draws a conclusion that contradicts most actual research. Studies on multitasking consistently show it ',
        /* @__PURE__ */ jsxRuntimeExports.jsx("em", { children: "reduces" }),
        " cognitive performance, not increases it. The phrasing is designed to sound authoritative."
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-6 flex items-center gap-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-semibold text-[var(--sharp)]", children: "🔥 8 day streak — keep going" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "gmj-btn gmj-btn-primary", onClick: () => navigate({
      to: "/leaderboard"
    }), children: "See leaderboard" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "gmj-btn gmj-btn-ghost mt-2.5", onClick: () => navigate({
      to: "/home"
    }), children: "Back to home" })
  ] }) });
}
export {
  Feedback as component
};
