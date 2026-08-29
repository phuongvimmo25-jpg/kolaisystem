import { Outlet, Link, createRootRoute, HeadContent, Scripts, useRouterState, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { AppLayout } from "@/components/AppLayout";
import { Toaster } from "@/components/ui/sonner";

import appCss from "../styles.css?url";

/**
 * Các trang xem được khi CHƯA đăng nhập.
 * /privacy và /terms bắt buộc phải công khai — Google yêu cầu truy cập được
 * không cần đăng nhập khi duyệt màn hình đồng ý OAuth.
 */
const PUBLIC_PATHS = ["/login", "/privacy", "/terms"];

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-gradient-primary">404</h1>
        <h2 className="mt-4 text-xl font-semibold">Trang không tồn tại</h2>
        <p className="mt-2 text-sm text-muted-foreground">Đường dẫn này không có trong KOL AI SYSTEM.</p>
        <div className="mt-6">
          <Link to="/" className="inline-flex items-center justify-center rounded-lg bg-gradient-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90 transition">
            Về trang chủ
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, maximum-scale=1" },
      { name: "theme-color", content: "#0A0A0F" },
      { title: "KOL AI SYSTEM — Hệ thống huấn luyện cấp tốc của những chiến thần" },
      { name: "description", content: "Nền tảng huấn luyện affiliate & KOL Việt Nam — gamified 30-day income growth challenge." },
      { property: "og:title", content: "KOL AI SYSTEM — Hệ thống huấn luyện cấp tốc của những chiến thần" },
      { property: "og:description", content: "Nền tảng huấn luyện affiliate & KOL Việt Nam — gamified 30-day income growth challenge." },
      { property: "og:type", content: "website" },
      { name: "twitter:title", content: "KOL AI SYSTEM — Hệ thống huấn luyện cấp tốc của những chiến thần" },
      { name: "twitter:description", content: "Nền tảng huấn luyện affiliate & KOL Việt Nam — gamified 30-day income growth challenge." },
      { property: "og:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/rTYkREBpHWbj1WybhkOymPoOS8P2/social-images/social-1776581361255-analyzed_video_task_object_replace_llm_f176c23fa01a4c959333cc295a6c0ddc_inline_image_0.webp" },
      { name: "twitter:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/rTYkREBpHWbj1WybhkOymPoOS8P2/social-images/social-1776581361255-analyzed_video_task_object_replace_llm_f176c23fa01a4c959333cc295a6c0ddc_inline_image_0.webp" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" },
      { rel: "manifest", href: "/manifest.json" },
      { rel: "icon", href: "/favicon.ico" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  return (
    <AuthProvider>
      <AppShell />
      <Toaster position="top-center" richColors theme="dark" />
    </AuthProvider>
  );
}

function AppShell() {
  const { user, loading } = useAuth();
  const path = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();

  const isPublic = PUBLIC_PATHS.includes(path);

  useEffect(() => {
    if (loading) return;
    if (!user && !isPublic) {
      navigate({ to: "/login", replace: true });
    }
    if (user && path === "/login") {
      navigate({ to: "/", replace: true });
    }
  }, [user, loading, path, isPublic, navigate]);

  // Trang cong khai render ngay, khong cho xac thuc: Google can doc duoc
  // /privacy va /terms ma khong chay JS cho session.
  if (isPublic) {
    return <Outlet />;
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-12 w-12 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Outlet />;
  }

  return (
    <AppLayout>
      <Outlet />
    </AppLayout>
  );
}
