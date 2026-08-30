import { useCallback, useEffect, useState } from "react";
import { ShieldCheck, Trophy, PlayCircle, Crown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ALL_LESSONS } from "@/lib/lessons";

interface Row {
  id: string;
  display_name: string;
  avatar_url: string | null;
  total_points: number;
  submission_count: number;
  watched_count: number;
}

/** Dãy khiên vàng — mỗi khiên là một bài tập đã nộp. */
function ShieldRow({ count }: { count: number }) {
  if (count === 0) {
    return <span className="text-[11px] text-muted-foreground">Chưa có khiên nào</span>;
  }

  // Nhiều khiên quá thì gộp lại cho gọn, không vỡ layout trên điện thoại.
  const MAX = 8;
  const shown = Math.min(count, MAX);

  return (
    <div className="flex flex-wrap items-center gap-1">
      {Array.from({ length: shown }).map((_, i) => (
        <ShieldCheck
          key={i}
          className="h-4 w-4 text-amber-400 drop-shadow-[0_0_6px_rgba(251,191,36,0.55)]"
        />
      ))}
      {count > MAX && (
        <span className="ml-0.5 text-[11px] font-bold text-amber-400">+{count - MAX}</span>
      )}
    </div>
  );
}

const MEDAL = ["text-amber-400", "text-slate-300", "text-orange-400"] as const;

export function LeaderboardPage() {
  const { user } = useAuth();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const { data } = await supabase
      .from("profiles")
      .select("id, display_name, avatar_url, total_points, submission_count, watched_count")
      .order("total_points", { ascending: false })
      .order("submission_count", { ascending: false })
      .limit(100);
    setRows((data ?? []) as Row[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const myRank = rows.findIndex((r) => r.id === user?.id);

  return (
    <div className="space-y-6">
      <section>
        <h1 className="text-2xl font-black tracking-tight md:text-3xl">
          <span className="text-gradient-primary">Vinh danh</span>
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Mỗi bài tập đã nộp là một{" "}
          <span className="inline-flex items-center gap-1 font-semibold text-amber-400">
            <ShieldCheck className="h-3.5 w-3.5" /> khiên vàng
          </span>
          . Nộp càng nhiều bài, càng nhiều khiên, hạng càng cao.
        </p>

        {myRank >= 0 && (
          <Card className="mt-4 border-primary/30 bg-primary/5 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="text-sm">
                Hạng của bạn:{" "}
                <strong className="text-lg text-gradient-primary">#{myRank + 1}</strong>
                <span className="text-muted-foreground"> / {rows.length} học viên</span>
              </span>
              <ShieldRow count={rows[myRank].submission_count} />
            </div>
          </Card>
        )}
      </section>

      {loading ? (
        <Card className="border-border bg-card/60 p-10 text-center text-sm text-muted-foreground">
          Đang tải bảng xếp hạng...
        </Card>
      ) : rows.length === 0 ? (
        <Card className="border-border bg-card/60 p-10 text-center">
          <Trophy className="mx-auto h-10 w-10 text-muted-foreground/50" />
          <p className="mt-3 text-sm text-muted-foreground">
            Chưa có ai trên bảng. Hãy là người đầu tiên nộp bài!
          </p>
        </Card>
      ) : (
        <div className="space-y-2">
          {rows.map((r, i) => {
            const isMe = r.id === user?.id;
            return (
              <Card
                key={r.id}
                className={`border-border p-4 transition ${
                  isMe ? "border-primary/40 bg-primary/5" : "bg-card/60"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 shrink-0 text-center">
                    {i < 3 ? (
                      <Crown className={`mx-auto h-5 w-5 ${MEDAL[i]}`} />
                    ) : (
                      <span className="text-sm font-bold text-muted-foreground">{i + 1}</span>
                    )}
                  </div>

                  <Avatar className="h-10 w-10 shrink-0 ring-2 ring-primary/25">
                    <AvatarImage src={r.avatar_url ?? undefined} className="object-cover" />
                    <AvatarFallback className="bg-primary/20 text-xs font-bold text-primary">
                      {r.display_name?.slice(0, 2).toUpperCase() ?? "KO"}
                    </AvatarFallback>
                  </Avatar>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="truncate text-sm font-bold">{r.display_name}</span>
                      {isMe && (
                        <span className="shrink-0 rounded-full bg-primary/20 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
                          Bạn
                        </span>
                      )}
                    </div>
                    <div className="mt-1">
                      <ShieldRow count={r.submission_count} />
                    </div>
                  </div>

                  <div className="shrink-0 text-right">
                    <div className="text-base font-black text-amber-400">{r.total_points}</div>
                    <div className="text-[10px] text-muted-foreground">điểm</div>
                    <div className="mt-0.5 inline-flex items-center gap-1 text-[10px] text-muted-foreground">
                      <PlayCircle className="h-3 w-3" />
                      {r.watched_count}/{ALL_LESSONS.length}
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
