import { useCallback, useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  GraduationCap,
  FileText,
  Trophy,
  ShieldCheck,
  Flame,
  ArrowRight,
  Lock,
  Sparkles,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { Card } from "@/components/ui/card";
import { ALL_LESSONS, PARTS, COURSE_INTRO, currentDeadline } from "@/lib/lessons";
import homeHero from "@/assets/home-hero.jpg";

/** Huy hiệu tính thẳng từ tiến độ — không cần bảng riêng, không bao giờ lệch số liệu. */
interface BadgeDef {
  key: string;
  icon: string;
  name: string;
  earned: (c: { subs: number; watched: number; rank: number; total: number }) => boolean;
}

const BADGES: BadgeDef[] = [
  { key: "first", icon: "🛡️", name: "Khiên đầu tiên", earned: (c) => c.subs >= 1 },
  {
    key: "watch",
    icon: "🎬",
    name: "Chăm chỉ",
    earned: (c) => c.watched >= 1 && c.watched >= c.total,
  },
  {
    key: "part",
    icon: "📚",
    name: "Xong một phần",
    earned: (c) => c.subs >= (PARTS[0]?.lessons.length ?? 3),
  },
  { key: "podium", icon: "⭐", name: "Top 3", earned: (c) => c.rank >= 1 && c.rank <= 3 },
  { key: "all", icon: "👑", name: "Trọn vẹn", earned: (c) => c.total > 0 && c.subs >= c.total },
];

const LINKS = [
  {
    to: "/bai-giang" as const,
    icon: GraduationCap,
    title: "Bài giảng",
    desc: "Xem video từng bước",
    tone: "border-primary/30 from-primary/20 to-transparent",
  },
  {
    to: "/bai-tap" as const,
    icon: FileText,
    title: "Nộp bài tập",
    desc: "Dán link Google Docs",
    tone: "border-gold/30 from-gold/20 to-transparent",
  },
  {
    to: "/vinh-danh" as const,
    icon: Trophy,
    title: "Vinh danh",
    desc: "Bảng xếp hạng khiên vàng",
    tone: "border-orange-500/30 from-orange-500/20 to-transparent",
  },
];

export function HomePage() {
  const { user } = useAuth();
  const { profile } = useProfile();
  const [rank, setRank] = useState(0);

  const loadRank = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("profiles")
      .select("id")
      .order("total_points", { ascending: false })
      .order("submission_count", { ascending: false })
      .limit(100);
    const i = (data ?? []).findIndex((r) => r.id === user.id);
    setRank(i >= 0 ? i + 1 : 0);
  }, [user]);

  useEffect(() => {
    loadRank();
  }, [loadRank]);

  const subs = profile?.submission_count ?? 0;
  const watched = profile?.watched_count ?? 0;
  const points = profile?.total_points ?? 0;
  const total = ALL_LESSONS.length;
  const percent = total === 0 ? 0 : Math.round(((watched + subs) / (total * 2)) * 100);
  const started = watched + subs > 0;

  const ctx = { subs, watched, rank, total };
  const next = currentDeadline();

  return (
    <div className="mx-auto max-w-[980px] space-y-6">
      {/* ══ 1. LỜI CHÀO GỌN ══ */}
      <div className="greet-bar">
        <div className="min-w-0">
          <h1 className="text-[19px] font-black leading-tight md:text-[23px]">
            Chào, <span className="text-gradient-gold">{profile?.display_name ?? "bạn"}</span>
          </h1>
          {next && (
            <p className="mt-1 truncate text-[13px] text-muted-foreground">
              Sắp tới hạn: <b className="text-gold">bài {next.lesson.code}</b> — {next.lesson.title}
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-gold/30 bg-gold/10 px-2.5 py-1 text-xs font-bold text-gold">
            <ShieldCheck className="h-3.5 w-3.5" /> {subs}/{total}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-1 text-xs font-bold text-primary-glow">
            <Flame className="h-3.5 w-3.5" /> {points}
          </span>
          {rank > 0 && (
            <span className="rounded-full border border-primary/30 bg-primary/10 px-2.5 py-1 text-xs font-bold text-primary-glow">
              Hạng #{rank}
            </span>
          )}
          <div className="flex w-24 items-center gap-1.5">
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-gradient-to-r from-gold to-amber-300 transition-[width] duration-700"
                style={{ width: percent + "%" }}
              />
            </div>
            <span className="shrink-0 text-[11px] font-bold text-gold">{percent}%</span>
          </div>
        </div>
      </div>

      {/* ══ 2. VIDEO TỔNG QUAN + LỜI KÊU GỌI ══ */}
      <section className="intro-panel">
        <div className="mb-4 text-center">
          <div className="eyebrow">{COURSE_INTRO.eyebrow}</div>
          <h2 className="mt-2 text-[22px] font-black md:text-[30px]">
            <span className="text-gradient-gold">{COURSE_INTRO.title}</span>
          </h2>
          <p className="mx-auto mt-2.5 max-w-xl text-[15px] leading-relaxed text-muted-foreground">
            {COURSE_INTRO.description}
          </p>
        </div>

        <div className="overflow-hidden rounded-2xl border border-gold/25 bg-black shadow-[0_24px_70px_-30px_oklch(0.78_0.16_75/0.55)]">
          <div className="relative aspect-video w-full">
            <iframe
              className="absolute inset-0 h-full w-full"
              src={
                "https://www.youtube-nocookie.com/embed/" +
                COURSE_INTRO.youtubeId +
                "?rel=0&modestbranding=1"
              }
              title={COURSE_INTRO.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>

        <div className="mt-5 flex flex-col items-center gap-2">
          <Link to="/bai-giang" className="cta-start group">
            <Sparkles className="h-[18px] w-[18px]" />
            {started ? "Tiếp tục hành trình" : "Bắt Đầu Hành Trình"}
            <ArrowRight className="h-[18px] w-[18px] transition-transform group-hover:translate-x-1" />
          </Link>
          <p className="text-xs text-muted-foreground">
            {total} bài giảng · nộp bài nhận khiên vàng · leo bảng Vinh danh
          </p>
        </div>
      </section>

      {/* ══ 3. ĐI TIẾP ĐÂU ══ */}
      <div className="grid gap-3 sm:grid-cols-3">
        {LINKS.map((q) => (
          <Link key={q.to} to={q.to} className="group">
            <Card
              className={
                "h-full border bg-gradient-to-br p-4 transition-all duration-200 group-hover:-translate-y-0.5 group-hover:shadow-xl " +
                q.tone
              }
            >
              <div className="flex items-center justify-between">
                <q.icon className="h-6 w-6" />
                <ArrowRight className="h-4 w-4 -translate-x-1 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-60" />
              </div>
              <div className="mt-3 text-[15px] font-bold">{q.title}</div>
              <p className="mt-0.5 text-[13px] text-muted-foreground">{q.desc}</p>
            </Card>
          </Link>
        ))}
      </div>

      {/* ══ 4. HUY HIỆU ══ */}
      <section>
        <h2 className="eyebrow mb-2.5">Huy hiệu</h2>
        <div className="grid grid-cols-5 gap-2">
          {BADGES.map((b) => {
            const got = b.earned(ctx);
            return (
              <Card
                key={b.key}
                title={b.name}
                className={
                  "flex flex-col items-center px-1 py-2.5 text-center transition " +
                  (got ? "border-gold/35 bg-gold/[0.07]" : "border-border/60 bg-card/25 opacity-50")
                }
              >
                <div className="relative text-xl sm:text-2xl">
                  <span className={got ? "" : "grayscale"}>{b.icon}</span>
                  {!got && (
                    <Lock className="absolute -bottom-0.5 -right-1.5 h-3 w-3 text-muted-foreground" />
                  )}
                </div>
                <div
                  className={
                    "mt-1 text-[10px] font-bold leading-tight sm:text-[12px] " +
                    (got ? "text-gold" : "text-muted-foreground")
                  }
                >
                  {b.name}
                </div>
              </Card>
            );
          })}
        </div>
      </section>

      {/* ══ 5. BÌA CHÂN TRANG ══ */}
      <footer className="hero-cover hero-cover--footer">
        <img src={homeHero} alt="KOL AI SYSTEM" className="hero-cover__img" loading="lazy" />
        <div className="hero-cover__veil" aria-hidden />
        <div className="hero-cover__content">
          <p className="text-[13px] font-semibold tracking-wide text-foreground/80 md:text-sm">
            Hệ thống huấn luyện cấp tốc của những chiến thần
          </p>
        </div>
      </footer>
    </div>
  );
}
