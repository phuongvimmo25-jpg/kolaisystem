import { useCallback, useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  GraduationCap,
  FileText,
  Trophy,
  ShieldCheck,
  PlayCircle,
  Flame,
  ArrowRight,
  Lock,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { COURSE_OVERVIEW, ALL_LESSONS, PARTS, currentDeadline } from "@/lib/lessons";
import heroBanner from "@/assets/hero-banner.png";

/** Huy hiệu tính thẳng từ tiến độ — không cần bảng riêng, không bao giờ lệch số liệu. */
interface BadgeDef {
  key: string;
  icon: string;
  name: string;
  desc: string;
  earned: (ctx: { subs: number; watched: number; rank: number; total: number }) => boolean;
}

const BADGES: BadgeDef[] = [
  {
    key: "first-shield",
    icon: "🛡️",
    name: "Khiên đầu tiên",
    desc: "Nộp bài tập đầu tiên",
    earned: (c) => c.subs >= 1,
  },
  {
    key: "watcher",
    icon: "🎬",
    name: "Người chăm chỉ",
    desc: "Xem hết video đã mở",
    earned: (c) => c.watched >= 1 && c.watched >= c.total,
  },
  {
    key: "part-done",
    icon: "📚",
    name: "Xong một phần",
    desc: "Nộp đủ bài của một phần",
    earned: (c) => c.subs >= (PARTS[0]?.lessons.length ?? 3),
  },
  {
    key: "podium",
    icon: "⭐",
    name: "Top 3 vinh danh",
    desc: "Lọt vào bục vinh danh",
    earned: (c) => c.rank >= 1 && c.rank <= 3,
  },
  {
    key: "complete",
    icon: "👑",
    name: "Trọn vẹn",
    desc: "Nộp hết toàn bộ bài tập",
    earned: (c) => c.total > 0 && c.subs >= c.total,
  },
];

const QUICK_LINKS = [
  {
    to: "/bai-giang" as const,
    icon: GraduationCap,
    title: "Bài giảng",
    desc: "Xem video và làm theo từng bước",
    tone: "from-primary/25 to-primary/5 border-primary/30",
  },
  {
    to: "/bai-tap" as const,
    icon: FileText,
    title: "Nộp bài tập",
    desc: "Dán link Google Docs bài làm",
    tone: "from-gold/25 to-gold/5 border-gold/30",
  },
  {
    to: "/vinh-danh" as const,
    icon: Trophy,
    title: "Vinh danh",
    desc: "Xem bảng xếp hạng và khiên vàng",
    tone: "from-orange-500/25 to-orange-500/5 border-orange-500/30",
  },
];

function greeting() {
  const h = Number(
    new Intl.DateTimeFormat("vi-VN", {
      hour: "numeric",
      hour12: false,
      timeZone: "Asia/Ho_Chi_Minh",
    }).format(new Date()),
  );
  if (h < 11) return "Chào buổi sáng";
  if (h < 14) return "Chào buổi trưa";
  if (h < 18) return "Chào buổi chiều";
  return "Chào buổi tối";
}

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

  const ctx = { subs, watched, rank, total };
  const earnedCount = BADGES.filter((b) => b.earned(ctx)).length;
  const next = currentDeadline();

  return (
    <div className="mx-auto max-w-[980px] space-y-5">
      {/* ══ LỜI CHÀO ══ */}
      <div className="hero-cover">
        <img src={heroBanner} alt="" className="hero-cover__img" loading="eager" />
        <div className="hero-cover__shine" aria-hidden />
        <div className="hero-cover__veil" aria-hidden />
        <div className="hero-cover__content">
          <span className="hero-cover__tag">
            <span className="hero-cover__dot" /> KOL AI SYSTEM
          </span>
          <h1 className="hero-cover__title">
            {greeting()},{" "}
            <span className="text-gradient-gold">{profile?.display_name ?? "bạn"}</span>
          </h1>
          <p className="hero-cover__subtitle">
            {next ? (
              <>
                Bài đang tới hạn: <b className="text-gold">{next.lesson.code}</b> —{" "}
                {next.lesson.title}
              </>
            ) : (
              "Bạn đã đi hết chặng đường của khoá học."
            )}
          </p>
          <div className="hero-cover__chips">
            <div className="hero-chip hero-chip--gold">
              <ShieldCheck className="h-4 w-4" /> {subs} khiên vàng
            </div>
            <div className="hero-chip hero-chip--purple">
              <Flame className="h-4 w-4" /> {points} điểm
            </div>
            {rank > 0 && <div className="hero-chip hero-chip--purple">Hạng #{rank}</div>}
          </div>
        </div>
      </div>

      {/* ══ TIẾN ĐỘ ══ */}
      <Card className="border-border bg-card/60 p-5">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="eyebrow">Tiến độ của bạn</div>
            <div className="mt-1.5 text-[34px] font-black leading-none text-gradient-primary">
              {percent}%
            </div>
          </div>
          <div className="flex gap-6 text-sm">
            <div>
              <div className="flex items-center gap-1.5 font-bold text-foreground">
                <PlayCircle className="h-4 w-4 text-emerald-400" />
                {watched}
                <span className="text-muted-foreground">/{total}</span>
              </div>
              <div className="mt-0.5 text-[13px] text-muted-foreground">video đã xem</div>
            </div>
            <div>
              <div className="flex items-center gap-1.5 font-bold text-foreground">
                <ShieldCheck className="h-4 w-4 text-gold" />
                {subs}
                <span className="text-muted-foreground">/{total}</span>
              </div>
              <div className="mt-0.5 text-[13px] text-muted-foreground">bài đã nộp</div>
            </div>
          </div>
        </div>
        <Progress value={percent} className="mt-4 h-2" />
      </Card>

      {/* ══ ĐIỀU HƯỚNG ══ */}
      <div className="grid gap-3 sm:grid-cols-3">
        {QUICK_LINKS.map((q) => (
          <Link key={q.to} to={q.to} className="group">
            <Card
              className={
                "h-full border bg-gradient-to-br p-4 transition-all duration-200 group-hover:-translate-y-0.5 group-hover:shadow-lg " +
                q.tone
              }
            >
              <div className="flex items-center justify-between">
                <q.icon className="h-6 w-6" />
                <ArrowRight className="h-4 w-4 opacity-0 transition-opacity group-hover:opacity-60" />
              </div>
              <div className="mt-3 text-[15px] font-bold">{q.title}</div>
              <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">{q.desc}</p>
            </Card>
          </Link>
        ))}
      </div>

      {/* ══ HUY HIỆU ══ */}
      <section>
        <div className="mb-2.5 flex items-baseline justify-between">
          <h2 className="text-lg font-black md:text-xl">Huy hiệu</h2>
          <span className="text-[13px] text-muted-foreground">
            {earnedCount}/{BADGES.length} đã đạt
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-5">
          {BADGES.map((b) => {
            const got = b.earned(ctx);
            return (
              <Card
                key={b.key}
                className={
                  "flex flex-col items-center p-3 text-center transition " +
                  (got ? "border-gold/35 bg-gold/[0.07]" : "border-border/60 bg-card/30 opacity-55")
                }
              >
                <div className="relative text-2xl">
                  <span className={got ? "" : "grayscale"}>{b.icon}</span>
                  {!got && (
                    <Lock className="absolute -bottom-0.5 -right-1.5 h-3 w-3 text-muted-foreground" />
                  )}
                </div>
                <div className={"mt-1.5 text-[13px] font-bold " + (got ? "text-gold" : "")}>
                  {b.name}
                </div>
                <div className="mt-0.5 text-[11px] leading-tight text-muted-foreground">
                  {b.desc}
                </div>
              </Card>
            );
          })}
        </div>
      </section>

      {/* ══ TỔNG QUAN ══ */}
      <section>
        <h2 className="mb-2.5 text-lg font-black md:text-xl">Cách học</h2>
        <p className="mb-3 max-w-2xl text-[15px] leading-relaxed text-muted-foreground">
          {COURSE_OVERVIEW.intro}
        </p>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {COURSE_OVERVIEW.steps.map((s, i) => (
            <Card key={s.title} className="border-border bg-card/50 p-4">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-primary text-xs font-black text-primary-foreground">
                {i + 1}
              </div>
              <div className="mt-3 text-[15px] font-bold">{s.title}</div>
              <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">
                {s.description}
              </p>
            </Card>
          ))}
        </div>

        <Card className="mt-3 border-border/60 bg-card/40 p-4">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[13px]">
            <span className="eyebrow">Cách tính điểm</span>
            {COURSE_OVERVIEW.scoring.map((s) => (
              <span key={s.label} className="text-foreground/80">
                {s.label} = <strong className="text-gold">{s.points} điểm</strong>
              </span>
            ))}
          </div>
        </Card>
      </section>
    </div>
  );
}
