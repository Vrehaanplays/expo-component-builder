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
const options = [{
  text: "This is solid advice — multitasking is a proven skill",
  correct: false
}, {
  text: "The conclusion doesn't follow — studies actually show the opposite",
  correct: false
}, {
  text: "False cause fallacy — misrepresents what the studies actually found",
  correct: true
}, {
  text: "Emotional bait — designed to make you feel productive without being so",
  correct: false
}];
function Scenario() {
  const navigate = useNavigate();
  const [timer, setTimer] = reactExports.useState(100);
  const [picked, setPicked] = reactExports.useState(null);
  const intervalRef = reactExports.useRef(null);
  reactExports.useEffect(() => {
    intervalRef.current = setInterval(() => {
      setTimer((t) => t <= 0 ? 0 : t - 0.5);
    }, 100);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);
  const select = (idx) => {
    if (picked !== null) return;
    setPicked(idx);
    if (intervalRef.current) clearInterval(intervalRef.current);
    const wasCorrect = options[idx].correct;
    setTimeout(() => {
      navigate({
        to: "/feedback",
        search: {
          correct: wasCorrect ? 1 : 0
        }
      });
    }, 1200);
  };
  const timerColor = timer <= 30 ? "var(--alert)" : "var(--strike)";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(PhoneFrame, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-shrink-0 items-center gap-3 px-6 py-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "flex h-9 w-9 items-center justify-center rounded-[10px] border-none bg-[var(--surface2)] text-lg text-[var(--ghost)]", onClick: () => navigate({
        to: "/home"
      }), children: "←" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-1 flex-1 overflow-hidden rounded-sm bg-[var(--surface2)]", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-full rounded-sm transition-[width]", style: {
        width: `${timer}%`,
        background: timerColor
      } }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-1 flex-col overflow-y-auto px-5 pb-5 pt-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "gmj-tag", children: "🧩 Argument" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-2.5 text-[11px] uppercase tracking-[0.08em] text-[var(--muted)]", children: "What's wrong with this?" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-6 flex-shrink-0 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 text-[15px] leading-[1.65] text-[var(--ghost)]", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-2 font-mono text-xs text-[var(--muted)]", children: "@productivityguru · 2h" }),
        '"Studies show multitasking boosts productivity — so you should always have multiple tabs open and switch between tasks constantly to get more done."'
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-col gap-2.5", children: options.map((o, idx) => {
        let cls = "gmj-answer";
        if (picked !== null) {
          if (idx === picked) cls += o.correct ? " correct" : " wrong";
          else if (o.correct) cls += " correct";
          else cls += " dim";
        }
        return /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: cls, onClick: () => select(idx), children: o.text }, idx);
      }) })
    ] })
  ] });
}
export {
  Scenario as component
};
