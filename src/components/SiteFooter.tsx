import { Link } from "@tanstack/react-router";
import { Phone, Mail, Clock, Youtube, Facebook } from "lucide-react";
import { ZaloIcon } from "@/components/ZaloIcon";
import logo from "@/assets/logo.png";
import homeHero from "@/assets/home-hero.jpg";

const SDT = "0978076936";
const SDT_DEP = "0978 076 936";
const EMAIL = "phongtyphu95@gmail.com";

/** TikTok — cũng không có trong lucide. */
function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="currentColor"
      aria-hidden
      focusable="false"
    >
      <path d="M16.6 5.82A4.28 4.28 0 0 1 15.54 3h-3.09v12.4a2.59 2.59 0 0 1-2.59 2.5 2.59 2.59 0 0 1 0-5.18c.27 0 .52.04.76.12v-3.2a5.98 5.98 0 0 0-.76-.05A5.72 5.72 0 0 0 4.14 15.3 5.72 5.72 0 0 0 9.86 21a5.72 5.72 0 0 0 5.72-5.7V9.01a7.35 7.35 0 0 0 4.28 1.37V7.3a4.28 4.28 0 0 1-3.26-1.48Z" />
    </svg>
  );
}

const KHAM_PHA = [
  { to: "/", nhan: "Trang chủ" },
  { to: "/bai-giang", nhan: "Bài giảng" },
  { to: "/bai-tap", nhan: "Nộp bài tập" },
  { to: "/vinh-danh", nhan: "Vinh danh" },
  { to: "/co-gi-moi", nhan: "Có gì mới" },
] as const;

const MANG_XA_HOI = [
  { href: "https://www.youtube.com/@phongmenly", nhan: "YouTube", Icon: Youtube },
  { href: "https://www.facebook.com/phongmenly", nhan: "Facebook", Icon: Facebook },
  { href: "https://www.tiktok.com/@phongmenly", nhan: "TikTok", Icon: TikTokIcon },
];

/** Chân trang chung cho mọi tab — tràn hết chiều ngang màn hình. */
export function SiteFooter() {
  return (
    <footer className="site-footer">
      <img src={homeHero} alt="" className="site-footer__img" loading="lazy" aria-hidden />
      <div className="site-footer__veil" aria-hidden />

      <div className="site-footer__inner">
        <div className="grid gap-8 md:grid-cols-[1.4fr_1fr_1fr]">
          {/* Cột thương hiệu */}
          <div className="min-w-0">
            <div className="flex items-center gap-3">
              <img src={logo} alt="" width={44} height={44} className="shrink-0 rounded-full" />
              <div className="min-w-0">
                <div className="text-[19px] font-black leading-tight text-foreground">
                  Phong Menly
                </div>
                <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-gold">
                  Mật mã tự do
                </div>
              </div>
            </div>

            <p className="mt-3 max-w-sm text-[14px] leading-relaxed text-muted-foreground">
              Hệ thống huấn luyện cấp tốc của những chiến thần. Học Affiliate cùng AI, xây dòng tiền
              tự do cùng Phong Menly.
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              {MANG_XA_HOI.map(({ href, nhan, Icon }) => (
                <a
                  key={nhan}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={nhan}
                  aria-label={nhan}
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-card/60 text-muted-foreground transition hover:border-gold/45 hover:text-gold"
                >
                  <Icon className="h-[18px] w-[18px]" />
                </a>
              ))}
              <a
                href={`https://zalo.me/${SDT}`}
                target="_blank"
                rel="noopener noreferrer"
                title="Zalo"
                aria-label="Zalo"
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-card/60 transition hover:border-gold/45"
              >
                <ZaloIcon className="h-[22px] w-[22px]" />
              </a>
            </div>
          </div>

          {/* Cột điều hướng */}
          <nav className="min-w-0">
            <h3 className="text-[13px] font-black uppercase tracking-[0.16em] text-gold">
              Khám phá
            </h3>
            <ul className="mt-3 space-y-2">
              {KHAM_PHA.map((m) => (
                <li key={m.to}>
                  <Link
                    to={m.to}
                    className="text-[14px] text-muted-foreground transition hover:text-gold"
                  >
                    {m.nhan}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Cột liên hệ */}
          <div className="min-w-0">
            <h3 className="text-[13px] font-black uppercase tracking-[0.16em] text-gold">
              Liên hệ
            </h3>
            <ul className="mt-3 space-y-2.5 text-[14px]">
              <li>
                <a
                  href={`tel:${SDT}`}
                  className="inline-flex items-center gap-2 text-muted-foreground transition hover:text-gold"
                >
                  <Phone className="h-4 w-4 shrink-0 text-gold" />
                  {SDT_DEP}
                </a>
              </li>
              <li>
                <a
                  href={`https://zalo.me/${SDT}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-muted-foreground transition hover:text-gold"
                >
                  <ZaloIcon className="h-[18px] w-[18px] shrink-0" />
                  Zalo tư vấn · {SDT_DEP}
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${EMAIL}`}
                  className="inline-flex items-center gap-2 break-all text-muted-foreground transition hover:text-gold"
                >
                  <Mail className="h-4 w-4 shrink-0 text-gold" />
                  {EMAIL}
                </a>
              </li>
              <li className="inline-flex items-center gap-2 text-muted-foreground">
                <Clock className="h-4 w-4 shrink-0 text-gold" />
                Phản hồi 24/24
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 border-t border-border/60 pt-5 text-center text-[13px] text-muted-foreground">
          <span>© {new Date().getFullYear()} Phong Menly · Mật Mã Tự Do</span>
          <span className="hidden sm:inline">·</span>
          <span>Mọi quyền được bảo lưu</span>
          <span className="hidden sm:inline">·</span>
          <Link to="/privacy" className="transition hover:text-gold">
            Quyền riêng tư
          </Link>
          <span>·</span>
          <Link to="/terms" className="transition hover:text-gold">
            Điều khoản
          </Link>
        </div>
      </div>
    </footer>
  );
}
