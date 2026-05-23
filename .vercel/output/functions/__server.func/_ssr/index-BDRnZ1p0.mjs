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
function Splash() {
  const navigate = useNavigate();
  reactExports.useEffect(() => {
    const t = setTimeout(() => navigate({
      to: "/onboarding"
    }), 1800);
    return () => clearTimeout(t);
  }, [navigate]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(PhoneFrame, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex h-full flex-col items-center justify-center gap-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-[72px] w-[72px] items-center justify-center rounded-[20px] text-[32px] font-bold", style: {
      background: "var(--strike)",
      color: "var(--void)"
    }, children: "G" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-[28px] font-bold tracking-[-0.04em] text-[var(--ghost)]", children: "GMJ" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm tracking-wide text-[var(--muted)]", children: "Train your judgment." })
  ] }) });
}
export {
  Splash as component
};
