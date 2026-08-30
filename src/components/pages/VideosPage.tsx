import { useCallback, useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { CheckCircle2, PlayCircle, Clock, Lock, ShieldCheck, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import {
  COURSE_OVERVIEW,
  PARTS,
  ALL_LESSONS,
  POINTS_PER_SUBMISSION,
  POINTS_PER_VIDEO,
  type Lesson,
} from "@/lib/lessons";

export function VideosPage() {
  const { user } = useAuth();
  const [watched, setWatched] = useState<Set<string>>(new Set());
  const [submitted, setSubmitted] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!user) return;
    const [w, s] = await Promise.all([
      supabase.from("watched_videos").select("video_key").eq("user_id", user.id),
      supabase.from("submissions").select("lesson_key").eq("user_id", user.id),
    ]);
    setWatched(new Set((w.data ?? []).map((r) => r.video_key)));
    setSubmitted(new Set((s.data ?? []).map((r) => r.lesson_key)));
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  const toggleWatched = async (lesson: Lesson) => {
    if (!user) return;
    setBusy(lesson.key);
    const already = watched.has(lesson.key);

    if (already) {
      const { error } = await supabase
        .from("watched_videos")
        .delete()
        .eq("user_id", user.id)
        .eq("video_key", lesson.key);
      if (error) {
        toast.error("Không bỏ đánh dấu được", { description: error.message });
      } else {
        setWatched((prev) => {
          const next = new Set(prev);
          next.delete(lesson.key);
          return next;
        });
      }
    } else {
      const { error } = await supabase
        .from("watched_videos")
        .insert({ user_id: user.id, video_key: lesson.key });
      if (error) {
        toast.error("Không ghi nhận được", { description: error.message });
      } else {
        setWatched((prev) => new Set(prev).add(lesson.key));
        toast.success("+" + POINTS_PER_VIDEO + " điểm", { description: lesson.title });
      }
    }
    setBusy(null);
  };

  const total = ALL_LESSONS.length;
  const doneVideos = ALL_LESSONS.filter((l) => watched.has(l.key)).length;
  const doneSubs = ALL_LESSONS.filter((l) => submitted.has(l.key)).length;
  const percent = total === 0 ? 0 : Math.round(((doneVideos + doneSubs) / (total * 2)) * 100);

  return (
    <div className="space-y-8">
      {/* ── TỔNG QUAN ───────────────────────────────────────── */}
      <section>
        <h1 className="text-2xl md:text-3xl font-black tracking-tight">
          <span className="text-gradient-primary">Tổng quan</span>
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          {COURSE_OVERVIEW.intro}
        </p>

        <Card className="mt-5 border-border bg-card/60 p-5">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Tiến độ của bạn
              </div>
              <div className="mt-1 text-3xl font-black text-gradient-primary">{percent}%</div>
            </div>
            <div className="flex gap-6 text-sm">
              <div>
                <div className="font-bold text-foreground">
                  {doneVideos}
                  <span className="text-muted-foreground">/{total}</span>
                </div>
                <div className="text-xs text-muted-foreground">video đã xem</div>
              </div>
              <div>
                <div className="font-bold text-foreground">
                  {doneSubs}
                  <span className="text-muted-foreground">/{total}</span>
                </div>
                <div className="text-xs text-muted-foreground">bài đã nộp</div>
              </div>
            </div>
          </div>
          <Progress value={percent} className="mt-4 h-2" />
        </Card>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {COURSE_OVERVIEW.steps.map((s, i) => (
            <Card key={s.title} className="border-border bg-card/50 p-4">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-primary text-xs font-black text-primary-foreground">
                {i + 1}
              </div>
              <div className="mt-3 text-sm font-bold">{s.title}</div>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{s.description}</p>
            </Card>
          ))}
        </div>

        <Card className="mt-3 border-border/60 bg-card/40 p-4">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs">
            <span className="font-semibold uppercase tracking-widest text-muted-foreground">
              Cách tính điểm
            </span>
            {COURSE_OVERVIEW.scoring.map((s) => (
              <span key={s.label} className="text-foreground/80">
                {s.label} = <strong className="text-amber-400">{s.points} điểm</strong>
              </span>
            ))}
            <span className="inline-flex items-center gap-1.5 text-foreground/80">
              <ShieldCheck className="h-3.5 w-3.5 text-amber-400" />
              Mỗi bài nộp = 1 khiên vàng ở Vinh danh
            </span>
          </div>
        </Card>
      </section>

      {/* ── CÁC PHẦN BÀI GIẢNG ──────────────────────────────── */}
      {PARTS.map((part) => (
        <section key={part.key}>
          <div className="flex flex-wrap items-baseline justify-between gap-4">
            <h2 className="text-xl font-black tracking-tight md:text-2xl">{part.title}</h2>
            <span className="text-xs text-muted-foreground">
              {part.lessons.filter((l) => watched.has(l.key)).length}/{part.lessons.length} bài đã xem
            </span>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">{part.subtitle}</p>

          <div className="mt-4 space-y-4">
            {part.lessons.map((lesson) => {
              const isWatched = watched.has(lesson.key);
              const isSubmitted = submitted.has(lesson.key);
              const hasVideo = lesson.youtubeId.trim() !== "";

              return (
                <Card key={lesson.key} className="overflow-hidden border-border bg-card/60">
                  <div className="grid md:grid-cols-[320px_1fr]">
                    <div className="relative aspect-video border-b border-border bg-black/40 md:border-b-0 md:border-r">
                      {hasVideo ? (
                        <iframe
                          className="absolute inset-0 h-full w-full"
                          src={"https://www.youtube-nocookie.com/embed/" + lesson.youtubeId}
                          title={lesson.title}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-muted-foreground">
                          <Lock className="h-7 w-7" />
                          <span className="text-xs font-medium">Sắp ra mắt</span>
                        </div>
                      )}
                    </div>

                    <div className="p-5">
                      <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
                        <span className="font-bold text-primary">Bài {lesson.code}</span>
                        {lesson.duration && (
                          <>
                            <span>•</span>
                            <span className="inline-flex items-center gap-1">
                              <Clock className="h-3 w-3" /> {lesson.duration}
                            </span>
                          </>
                        )}
                        {isWatched && (
                          <>
                            <span>•</span>
                            <span className="inline-flex items-center gap-1 font-semibold text-emerald-400">
                              <CheckCircle2 className="h-3 w-3" /> Đã xem
                            </span>
                          </>
                        )}
                        {isSubmitted && (
                          <>
                            <span>•</span>
                            <span className="inline-flex items-center gap-1 font-semibold text-amber-400">
                              <ShieldCheck className="h-3 w-3" /> Đã nộp bài
                            </span>
                          </>
                        )}
                      </div>

                      <h3 className="mt-1.5 text-base font-bold leading-snug">{lesson.title}</h3>
                      <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                        {lesson.description}
                      </p>

                      <div className="mt-3 rounded-lg border border-border/60 bg-background/40 p-3">
                        <div className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                          Bài tập
                        </div>
                        <p className="mt-1 text-xs leading-relaxed text-foreground/85">
                          {lesson.assignment}
                        </p>
                      </div>

                      <div className="mt-4 flex flex-wrap gap-2">
                        <Button
                          size="sm"
                          variant={isWatched ? "outline" : "default"}
                          disabled={!hasVideo || busy === lesson.key}
                          onClick={() => toggleWatched(lesson)}
                          className={isWatched ? "" : "bg-gradient-primary hover:opacity-90"}
                        >
                          {isWatched ? (
                            <>
                              <CheckCircle2 className="mr-1.5 h-4 w-4" /> Đã xem xong
                            </>
                          ) : (
                            <>
                              <PlayCircle className="mr-1.5 h-4 w-4" /> Đánh dấu đã xem
                            </>
                          )}
                        </Button>

                        <Button size="sm" variant="outline" asChild>
                          <Link to="/bai-tap" hash={lesson.key}>
                            {isSubmitted ? "Sửa bài nộp" : "Nộp bài tập"}
                            <ArrowRight className="ml-1.5 h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </section>
      ))}

      <p className="pb-4 text-center text-xs text-muted-foreground">
        Nộp bài để nhận khiên vàng — mỗi bài {POINTS_PER_SUBMISSION} điểm.{" "}
        <Link to="/vinh-danh" className="text-primary hover:underline">
          Xem bảng Vinh danh
        </Link>
      </p>
    </div>
  );
}
