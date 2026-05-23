import { j as jsxRuntimeExports } from "../_libs/react.mjs";
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
function Auth() {
  const navigate = useNavigate();
  const go = () => navigate({
    to: "/home"
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsx(PhoneFrame, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-1 flex-col justify-end px-6 pb-8 pt-8", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "mb-1.5 text-[28px] font-bold tracking-[-0.04em] text-[var(--ghost)]", children: "Create account" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mb-8 text-sm text-[var(--muted)]", children: "Join the arena. Start training." }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("input", { className: "gmj-input mb-3", type: "email", placeholder: "Email address" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("input", { className: "gmj-input mb-1", type: "password", placeholder: "Password" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "gmj-btn gmj-btn-primary mt-2", onClick: go, children: "Sign up" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "my-4 flex items-center gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-px flex-1 bg-[var(--border)]" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-[var(--muted)]", children: "or" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-px flex-1 bg-[var(--border)]" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "gmj-btn gmj-btn-ghost", onClick: go, children: "Continue with Google" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "gmj-btn gmj-btn-outline mt-2.5", onClick: go, children: "Already have an account" })
  ] }) });
}
export {
  Auth as component
};
