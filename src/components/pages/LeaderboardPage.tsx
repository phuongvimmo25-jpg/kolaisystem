import { useCallback, useEffect, useState } from "react";
import { Crown, ShieldCheck, Flame, PlayCircle, Share2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PageHeader } from "@/components/PageHeader";
import { toast } from "sonner";
import { ALL_LESSONS } from "@/lib/lessons";
import leaderboardHero from "@/assets/leaderboard-hero.jpg";

interface LeaderRow {
  id: string;
  display_name: string;
  avatar_url: string | null;
  total_points: number;
  submission_count: number;
  watched_count: number;
}

/** Dãy khiên vàng — mỗi khiên là một bài tập đã nộp. */
function Shields({ count, size = "sm" }: { count: number; size?: "sm" | "md" }) {
  if (count === 0) {
    return <span className="text-[11px] text-muted-foreground">Chưa có khiên</span>;
  }
  const MAX = size === "md" ? 5 : 8;
  const shown = Math.min(count, MAX);
  const cls = size === "md" ? "h-4 w-4" : "h-3.5 w-3.5";

  return (
    <div className="flex flex-wrap items-center justify-center gap-0.5">
      {Array.from({ length: shown }).map((_, i) => (
        <ShieldCheck
          key={i}
          className={`${cls} text-gold drop-shadow-[0_0_6px_oklch(0.78_0.16_75/0.6)]`}
        />
      ))}
      {count > MAX && <span className="ml-0.5 text-[11px] font-bold text-gold">+{count - MAX}</span>}
    </div>
  );
}

export function LeaderboardPage() {
  const { user } = useAuth();
  const [rows, setRows] = useState<LeaderRow[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const { data } = await supabase
      .from("profiles")
      .select("id, display_name, avatar_url, total_points, submission_count, watched_count")
      .order("total_points", { ascending: false })
      .order("submission_count", { ascending: false })
      .limit(100);
    setRows((data ?? []) as LeaderRow[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const top3 = rows.slice(0, 3);
  const rest = rows.slice(3);
  const myRank = user ? rows.findIndex((r) => r.id === user.id) + 1 : 0;

  const share = () => {
    const me = rows.find((r) => r.id === user?.id);
    if (!me) return;
    const text = `🛡️ Tôi đang xếp #${myRank} trên KOL AI SYSTEM với ${me.submission_count} khiên vàng! #KOLAISystem`;
    navigator.clipboard.writeText(text);
    toast.success("Đã sao chép xếp hạng!");
  };

  return (
    <div className="space-y-5">
      {/* Ảnh bìa */}
      <div className="leaderboard-hero aspect-[16/7] md:aspect-[16/6]">
        <img src={leaderboardHero} alt="KOL AI SYSTEM" className="leaderboard-hero__img" loading="eager" />
      </div>

      <PageHeader
        eyebrow="Bảng xếp hạng"
        title="Vinh"
        accent="danh"
        description={
          <>
            Mỗi bài tập đã nộp là một{" "}
            <span className="inline-flex items-center gap-1 font-semibold text-gold">
              <ShieldCheck className="h-4 w-4" /> khiên vàng
            </span>
            . Nộp càng nhiều, hạng càng cao.
          </>
        }
        action={
          myRank > 0 ? (
            <Button onClick={share} variant="outline" size="sm">
              <Share2 className="mr-1.5 h-4 w-4" /> Chia sẻ
            </Button>
          ) : undefined
        }
      />

      {/* Bục vinh danh TOP 1-2-3 */}
      {top3.length > 0 && (
        <div className="grid grid-cols-3 items-end gap-3 md:gap-5">
          <PodiumCard row={top3[1]} rank={2} variant="purple" />
          <PodiumCard row={top3[0]} rank={1} variant="gold" featured />
          <PodiumCard row={top3[2]} rank={3} variant="ruby" />
        </div>
      )}

      {loading && rows.length === 0 && (
        <Card className="border-border bg-card/60 p-10 text-center text-[15px] text-muted-foreground">
          Đang tải bảng xếp hạng...
        </Card>
      )}

      {!loading && rows.length === 0 && (
        <Card className="border-border bg-card/60 p-10 text-center">
          <div className="mb-3 text-4xl">🛡️</div>
          <div className="text-[15px] text-muted-foreground">
            Chưa có ai trên bảng — hãy là người đầu tiên nộp bài!
          </div>
        </Card>
      )}

      {/* Từ hạng 4 trở đi */}
      <div className="space-y-2">
        {rest.map((r, i) => (
          <Card
            key={r.id}
            className={`member-row flex items-center gap-3 rounded-xl p-3 ${
              r.id === user?.id ? "member-row-self" : ""
            }`}
          >
            <div className="w-8 bg-gradient-to-b from-foreground/80 to-foreground/40 bg-clip-text text-center text-sm font-black text-transparent">
              #{i + 4}
            </div>
            <Avatar className="h-10 w-10 ring-2 ring-primary/30">
              <AvatarImage src={r.avatar_url ?? undefined} className="object-cover" />
              <AvatarFallback className="bg-primary/20 text-xs font-bold text-primary">
                {r.display_name.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <div className="truncate text-[15px] font-bold text-white">{r.display_name}</div>
              <div className="mt-0.5 flex items-center gap-2">
                <div className="flex items-center gap-0.5">
                  <Shields count={r.submission_count} />
                </div>
                <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                  <PlayCircle className="h-2.5 w-2.5" />
                  {r.watched_count}/{ALL_LESSONS.length}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1 bg-gradient-to-r from-gold to-amber-300 bg-clip-text text-base font-black text-transparent drop-shadow-[0_0_8px_oklch(0.78_0.16_75/0.4)]">
              {r.total_points}
              <Flame className="h-3 w-3 text-orange-400" />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function PodiumCard({
  row,
  rank,
  variant,
  featured,
}: {
  row?: LeaderRow;
  rank: number;
  variant: "gold" | "purple" | "ruby";
  featured?: boolean;
}) {
  if (!row) return <div />;

  const cfg = {
    gold: {
      frame: "legend-gold",
      bg: "podium-bg-gold",
      fire: "fire-gold",
      tag: "bg-gradient-to-r from-gold to-amber-500",
      ring: "ring-gold",
      accent: "oklch(0.85 0.18 80)",
      text: "text-gold",
      romanCol: "text-gold",
    },
    purple: {
      frame: "legend-purple",
      bg: "podium-bg-purple",
      fire: "fire-purple",
      tag: "bg-gradient-to-r from-primary to-primary-glow",
      ring: "ring-primary",
      accent: "oklch(0.7 0.25 295)",
      text: "text-primary-glow",
      romanCol: "text-primary-glow",
    },
    ruby: {
      frame: "legend-ruby",
      bg: "podium-bg-ruby",
      fire: "fire-ruby",
      tag: "bg-gradient-to-r from-red-500 to-rose-600",
      ring: "ring-red-400",
      accent: "oklch(0.72 0.24 25)",
      text: "text-red-400",
      romanCol: "text-red-400",
    },
  }[variant];

  const orbitId = `orbit-${variant}-${rank}`;
  const romanText = " ✦ I ✦ II ✦ III ✦ IV ✦ V ✦ VI ✦ VII ✦ VIII ✦ IX ✦ X ✦ XI ✦ XII ✦ ";

  return (
    <div className={`relative ${featured ? "md:-mt-8" : ""}`}>
      <div className={`legend-frame ${cfg.frame} ${cfg.bg} backdrop-blur-sm`}>
        <div className="legend-shine" />

        {featured && (
          <Crown
            className="absolute -top-4 left-1/2 z-10 h-9 w-9 -translate-x-1/2 text-gold drop-shadow-[0_0_14px_oklch(0.78_0.16_75/0.95)]"
            fill="currentColor"
          />
        )}

        <div className="relative flex flex-col items-center text-center">
          <div
            className={`relative ${
              featured ? "h-32 w-32 md:h-44 md:w-44" : "h-24 w-24 md:h-32 md:w-32"
            } flex items-center justify-center`}
          >
            <div className={`fire-ring ${cfg.fire}`} />

            <svg
              viewBox="0 0 100 100"
              className="halo-rotate-rev absolute inset-0 h-full w-full opacity-80"
              aria-hidden
            >
              <circle cx="50" cy="50" r="48" fill="none" stroke={cfg.accent} strokeWidth="0.8" strokeDasharray="2 4" />
              <circle cx="50" cy="50" r="44" fill="none" stroke={cfg.accent} strokeWidth="0.4" strokeDasharray="1 3" opacity="0.6" />
            </svg>

            <svg
              viewBox="0 0 120 120"
              className={`halo-rotate absolute inset-0 h-full w-full ${cfg.romanCol}`}
              aria-hidden
            >
              <defs>
                <path id={orbitId} d="M 60,60 m -52,0 a 52,52 0 1,1 104,0 a 52,52 0 1,1 -104,0" />
              </defs>
              <text
                fontSize="6.5"
                fontWeight="700"
                fill="currentColor"
                letterSpacing="2"
                style={{ fontFamily: "Cinzel, Cormorant Garamond, serif" }}
              >
                <textPath href={`#${orbitId}`} startOffset="0">
                  {romanText.repeat(3)}
                </textPath>
              </text>
            </svg>

            <svg viewBox="0 0 100 100" className="halo-rotate absolute inset-0 h-full w-full opacity-40" aria-hidden>
              {Array.from({ length: 12 }).map((_, i) => (
                <line
                  key={i}
                  x1="50"
                  y1="4"
                  x2="50"
                  y2="14"
                  stroke={cfg.accent}
                  strokeWidth="1.2"
                  strokeLinecap="round"
                  transform={`rotate(${i * 30} 50 50)`}
                />
              ))}
            </svg>

            <Avatar
              className={`relative z-[1] h-[62%] w-[62%] ring-4 ${cfg.ring} shadow-[0_0_30px_-4px_currentColor]`}
              style={{ color: cfg.accent }}
            >
              <AvatarImage src={row.avatar_url ?? undefined} className="object-cover" />
              <AvatarFallback className="bg-gradient-to-br from-primary/30 to-primary/10 text-lg font-black text-foreground md:text-2xl">
                {row.display_name.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>

          <div
            className={`mt-3 rounded-full px-3.5 py-1 text-[10px] font-black tracking-[0.2em] text-background shadow-lg md:text-xs ${cfg.tag}`}
          >
            TOP {rank}
          </div>

          <div className="mt-2.5 max-w-full truncate px-1 text-[15px] font-black text-white drop-shadow md:text-lg">
            {row.display_name}
          </div>

          <div className="mt-2">
            <Shields count={row.submission_count} size="md" />
          </div>

          <div className={`mt-1.5 flex items-center gap-1 text-base font-black md:text-xl ${cfg.text}`}>
            {row.total_points}
            <Flame className="h-4 w-4 text-orange-400" />
          </div>
        </div>
      </div>
    </div>
  );
}
