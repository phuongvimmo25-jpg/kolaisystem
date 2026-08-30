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
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { Card } from "@/components/ui/card";
import { ALL_LESSONS, PARTS, currentDeadline } from "@/lib/lessons";
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

  const ctx = { subs, watched, rank, total };
  const next = currentDeadline();

  return (
    <div className="mx-auto max-w-[980px] space-y-5">
      {/* ══ BÌA + LỜI CHÀO ══ */}
      <div className="hero-cover">
        <img src={homeHero} alt="KOL AI SYSTEM" className="hero-cover__img" loading="eager" />
        <div className="hero-cover__shine" aria-hidden />
        <div className="hero-cover__veil" aria-hidden />

        <div className="hero-cover__content">
          <h1 className="hero-cover__title">
            Chào, <span className="text-gradient-gold">{profile?.display_name ?? "bạn"}</span>
          </h1>

          {next && (
            <p className="hero-cover__subtitle">
              Sắp tới hạn: <b className="text-gold">bài {next.lesson.code}</b> — {next.lesson.title}
            </p>
          )}

          <div className="hero-cover__chips">
            <div className="hero-chip hero-chip--gold">
              <ShieldCheck className="h-4 w-4" /> {subs}/{total} khiên
            </div>
            <div className="hero-chip hero-chip--purple">
              <Flame className="h-4 w-4" /> {points} điểm
            </div>
            {rank > 0 && <div className="hero-chip hero-chip--purple">Hạng #{rank}</div>}
          </div>

          {/* Thanh tiến độ mảnh, nằm luôn trong bìa cho gọn */}
          <div className="mt-1 flex items-center gap-2.5">
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/15">
              <div
                className="h-full rounded-full bg-gradient-to-r from-gold to-amber-300 transition-[width] duration-700"
                style={{ width: percent + "%" }}
              />
            </div>
            <span className="shrink-0 text-xs font-bold text-gold">{percent}%</span>
          </div>
        </div>
      </div>

      {/* ══ ĐI TIẾP ĐÂU ══ */}
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

      {/* ══ HUY HIỆU ══ */}
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
    </div>
  );
}
