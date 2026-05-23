import { defineConfig } from "@lovable.dev/vite-tanstack-config";

// Deploy target: Vercel (TanStack Start emits .vercel/output for Vercel auto-detection).
// Cloudflare plugin disabled so the build doesn't try to bundle for Workers.
export default defineConfig({
  cloudflare: false,
  tanstackStart: {
    target: "vercel",
  },
});
