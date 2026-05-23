import { j as jsxRuntimeExports } from "../_libs/react.mjs";
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
const stats = [{
  value: "4,820",
  label: "Total points",
  highlight: true
}, {
  value: "🔥 8",
  label: "Day streak",
  color: "var(--sharp)"
}, {
  value: "73%",
  label: "Accuracy"
}, {
  value: "24",
  label: "Sessions"
}];
function Profile() {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(PhoneFrame, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-shrink-0 px-6 pb-4 pt-5", children: /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-[22px] font-bold tracking-[-0.03em] text-[var(--ghost)]", children: "Profile" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-5 mb-4 flex items-center gap-4 rounded-[20px] border border-[var(--border)] bg-[var(--surface)] p-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-[60px] w-[60px] flex-shrink-0 items-center justify-center rounded-[16px] text-[22px] font-bold text-[var(--strike)]", style: {
        background: "rgba(0,240,192,0.15)",
        border: "2px solid rgba(0,240,192,0.3)"
      }, children: "YO" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xl font-bold tracking-[-0.03em] text-[var(--ghost)]", children: "you" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-0.5 text-xs text-[var(--muted)]", children: "Rank #142 globally" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-4 grid grid-cols-2 gap-2.5 px-5", children: stats.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-[14px] border border-[var(--border)] bg-[var(--surface)] px-4 py-3.5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[24px] font-bold tracking-[-0.04em]", style: {
        color: s.highlight ? "var(--strike)" : s.color ?? "var(--ghost)"
      }, children: s.value }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-0.5 text-[11px] tracking-[0.04em] text-[var(--muted)]", children: s.label })
    ] }, s.label)) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(BottomNav, {})
  ] });
}
export {
  Profile as component
};
