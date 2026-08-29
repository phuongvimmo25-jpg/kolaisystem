import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import logo from "@/assets/logo.png";

/**
 * Khung chung cho các trang pháp lý (Chính sách bảo mật, Điều khoản sử dụng).
 * Các trang này phải xem được khi CHƯA đăng nhập — Google yêu cầu vậy khi duyệt OAuth.
 */
export function LegalLayout({
  title,
  updatedAt,
  children,
}: {
  title: string;
  updatedAt: string;
  children: ReactNode;
}) {
  return (
    <div
      className="min-h-screen w-full px-4 py-10 sm:py-14"
      style={{
        backgroundImage:
          "radial-gradient(ellipse 60% 40% at 50% 0%, oklch(0.3 0.18 295 / 0.35), transparent 60%), linear-gradient(180deg, #0A0A0F 0%, #12121A 100%)",
      }}
    >
      <div className="mx-auto w-full max-w-3xl">
        <Link to="/login" className="inline-flex items-center gap-3 mb-8 group">
          <img src={logo} alt="" width={40} height={40} className="drop-shadow-[0_0_20px_oklch(0.6_0.24_295/0.7)]" />
          <span className="text-lg font-black tracking-tight">
            <span className="text-foreground">KOL AI </span>
            <span className="text-gradient-primary">SYSTEM</span>
          </span>
        </Link>

        <article className="rounded-2xl border border-border/60 bg-card/60 backdrop-blur-xl p-6 sm:p-10">
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">{title}</h1>
          <p className="mt-2 text-xs text-muted-foreground">Cập nhật lần cuối: {updatedAt}</p>

          <div className="mt-8 space-y-7 text-sm sm:text-[15px] leading-relaxed text-foreground/85">
            {children}
          </div>
        </article>

        <nav className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-muted-foreground">
          <Link to="/login" className="hover:text-foreground transition">← Về trang đăng nhập</Link>
          <Link to="/privacy" className="hover:text-foreground transition">Chính sách bảo mật</Link>
          <Link to="/terms" className="hover:text-foreground transition">Điều khoản sử dụng</Link>
        </nav>
      </div>
    </div>
  );
}

export function Section({ heading, children }: { heading: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="text-base sm:text-lg font-bold text-foreground mb-2">{heading}</h2>
      <div className="space-y-2">{children}</div>
    </section>
  );
}
