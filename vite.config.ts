// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, cloudflare (build-only),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... } }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  // Khoá cứng cổng 8083: địa chỉ này đã khai báo trong Google OAuth và Supabase,
  // đổi cổng là luồng đăng nhập hỏng. strictPort để Vite báo lỗi thay vì lặng lẽ nhảy cổng khác.
  vite: {
    server: { port: 8083, strictPort: true },
  },
  // Deploy len Vercel (truoc day la Cloudflare Workers).
  nitro: { preset: "vercel" },
});
