import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import { nitro } from "nitro/vite";

// Deploy target: Vercel via Nitro, which emits Vercel's .vercel/output build format.
// Cloudflare plugin disabled so the build doesn't try to bundle for Workers.
export default defineConfig({
  cloudflare: false,
  plugins: [nitro({ preset: "vercel" })],
});
