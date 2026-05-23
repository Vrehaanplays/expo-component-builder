import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { d as useNavigate } from "../_libs/tanstack__react-router.mjs";
import { P as PhoneFrame } from "./PhoneFrame-CRYtO82I.mjs";
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
const slides = [{
  icon: "🎯",
  title: "Your feed is full of bad arguments.",
  sub: "Can you spot them before they fool you?"
}, {
  icon: "⚡",
  title: "Make calls. Get scored. See how you rank.",
  sub: "Every session sharpens your judgment and moves you up the board."
}, {
  icon: "🏆",
  title: "Sharpen your judgment. Daily.",
  sub: "Outthink the room. Be the sharpest person in it."
}];
function Onboarding() {
  const navigate = useNavigate();
  const [i, setI] = reactExports.useState(0);
  const next = () => {
    if (i < slides.length - 1) setI(i + 1);
    else navigate({
      to: "/auth"
    });
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(PhoneFrame, { children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-1 flex-col overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-full", style: {
    width: `${slides.length * 100}%`,
    transform: `translateX(-${i * (100 / slides.length)}%)`,
    transition: "transform 0.35s cubic-bezier(0.4,0,0.2,1)"
  }, children: slides.map((s, idx) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col justify-end px-8 py-12", style: {
    width: `${100 / slides.length}%`,
    flexShrink: 0
  }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-8 text-[64px]", children: s.icon }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "mb-3 text-[26px] font-bold leading-tight tracking-[-0.03em] text-[var(--ghost)]", children: s.title }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mb-10 text-[15px] leading-[1.6] text-[var(--muted)]", children: s.sub }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-6 flex gap-1.5", children: slides.map((_, di) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: {
      height: 6,
      width: di === i ? 20 : 6,
      borderRadius: 3,
      background: di === i ? "var(--strike)" : "var(--surface2)",
      transition: "all 0.3s"
    } }, di)) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "gmj-btn gmj-btn-primary", onClick: next, children: idx === slides.length - 1 ? "Let's go" : "Next" })
  ] }, idx)) }) }) });
}
export {
  Onboarding as component
};
