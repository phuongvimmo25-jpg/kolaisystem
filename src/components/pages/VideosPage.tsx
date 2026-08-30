import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  CheckCircle2,
  PlayCircle,
  Clock,
  Lock,
  ShieldCheck,
  ArrowRight,
  ChevronRight,
  Circle,
  ClipboardList,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { PageHeader } from "@/components/PageHeader";
import { toast } from "sonner";
import {
  PARTS,
  ALL_LESSONS,
  POINTS_PER_VIDEO,
  POINTS_PER_SUBMISSION,
  type Lesson,
} from "@/lib/lessons";

export function VideosPage() {
  const { user } = useAuth();
  const [watched, setWatched] = useState<Set<string>>(new Set());
  const [submitted, setSubmitted] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState<string | null>(null);
  const [selected, setSelected] = useState<string>(ALL_LESSONS[0]?.key ?? "");

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
    if (watched.has(lesson.key)) {
      const { error } = await supabase
        .from("watched_videos")
        .delete()
        .eq("user_id", user.id)
        .eq("video_key", lesson.key);
      if (error) {
        toast.error("Không bỏ đánh dấu được", { description: error.message });
      } else {
        setWatched((prev) => {
          const n = new Set(prev);
          n.delete(lesson.key);
          return n;
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

  const current = useMemo(() => ALL_LESSONS.find((l) => l.key === selected) ?? null, [selected]);

  return (
    <div className="grid gap-6 lg:grid-cols-[248px_1fr]">
      {/* ══ CỘT TRÁI — MỤC LỤC BÀI HỌC ══ */}
      <aside className="lg:self-stretch">
        <div className="flex flex-col rounded-2xl border border-border/70 bg-card/45 p-2.5 lg:h-full lg:overflow-y-auto">
          <div className="px-2 pb-2 pt-1">
            <div className="flex items-center justify-between">
              <span className="eyebrow">Nội dung</span>
              <span className="text-[11px] font-bold text-primary">{percent}%</span>
            </div>
            <Progress value={percent} className="mt-1.5 h-1" />
          </div>

          {/* Điện thoại: cuộn ngang · Máy tính: xếp dọc */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 lg:flex-col lg:overflow-x-visible lg:pb-0">
            {PARTS.map((part) => (
              <div key={part.key} className="contents lg:block">
                <div className="hidden px-2 pb-1.5 pt-3.5 text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground/80 lg:block">
                  {part.title}
                </div>
                {part.lessons.map((lesson) => (
                  <RailItem
                    key={lesson.key}
                    active={selected === lesson.key}
                    onClick={() => setSelected(lesson.key)}
                    icon={
                      watched.has(lesson.key) ? (
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                      ) : (
                        <Circle className="h-3.5 w-3.5 opacity-40" />
                      )
                    }
                    label={lesson.code}
                    sub={lesson.title}
                    badge={submitted.has(lesson.key)}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </aside>

      {/* ══ CỘT PHẢI — NỘI DUNG ══ */}
      <div className="min-w-0">
        {current && (
          <LessonView
            lesson={current}
            isWatched={watched.has(current.key)}
            isSubmitted={submitted.has(current.key)}
            busy={busy === current.key}
            onToggle={() => toggleWatched(current)}
          />
        )}
      </div>
    </div>
  );
}

function RailItem({
  active,
  onClick,
  icon,
  label,
  sub,
  badge,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  sub?: string;
  badge?: boolean;
}) {
  const base =
    "group flex shrink-0 items-center gap-2 rounded-xl px-2.5 py-2 text-left transition-all lg:w-full lg:shrink";
  const tone = active
    ? "bg-gradient-primary text-primary-foreground shadow-[0_2px_14px_-4px_oklch(0.55_0.24_295/0.8)]"
    : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-foreground";

  return (
    <button onClick={onClick} className={base + " " + tone}>
      <span className="shrink-0">{icon}</span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-1.5">
          <span className="text-sm font-bold leading-none">{label}</span>
          {badge && <ShieldCheck className="h-3 w-3 shrink-0 text-gold" />}
        </span>
        {sub && (
          <span
            className={
              "mt-1 hidden truncate text-[12px] leading-tight lg:block " +
              (active ? "opacity-80" : "opacity-60")
            }
          >
            {sub}
          </span>
        )}
      </span>
      {active && <ChevronRight className="hidden h-3.5 w-3.5 shrink-0 lg:block" />}
    </button>
  );
}

function LessonView({
  lesson,
  isWatched,
  isSubmitted,
  busy,
  onToggle,
}: {
  lesson: Lesson;
  isWatched: boolean;
  isSubmitted: boolean;
  busy: boolean;
  onToggle: () => void;
}) {
  const hasVideo = lesson.youtubeId.trim() !== "";

  return (
    <div className="mx-auto max-w-[980px] space-y-5">
      {/* VIDEO LỚN — trung tâm */}
      <div className="overflow-hidden rounded-2xl border border-border bg-black shadow-[0_20px_60px_-25px_rgba(0,0,0,0.9)]">
        <div className="relative aspect-video w-full">
          {hasVideo ? (
            <iframe
              className="absolute inset-0 h-full w-full"
              src={
                "https://www.youtube-nocookie.com/embed/" +
                lesson.youtubeId +
                "?rel=0&modestbranding=1"
              }
              title={lesson.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-card/40 text-muted-foreground">
              <Lock className="h-10 w-10" />
              <span className="text-sm font-semibold">Sắp ra mắt</span>
              <span className="text-xs opacity-70">Bài giảng này đang được quay</span>
            </div>
          )}
        </div>
      </div>

      {/* Thông tin bài */}
      <div>
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <span className="rounded-md bg-primary/15 px-2 py-0.5 font-bold text-primary">
            Bài {lesson.code}
          </span>
          {lesson.duration && (
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3 w-3" /> {lesson.duration}
            </span>
          )}
          {isWatched && (
            <span className="inline-flex items-center gap-1 font-semibold text-emerald-400">
              <CheckCircle2 className="h-3 w-3" /> Đã xem
            </span>
          )}
          {isSubmitted && (
            <span className="inline-flex items-center gap-1 font-semibold text-gold">
              <ShieldCheck className="h-3 w-3" /> Đã nộp bài
            </span>
          )}
        </div>

        <h1 className="mt-2.5 text-[20px] font-black md:text-[26px]">{lesson.title}</h1>
        <p className="mt-2.5 max-w-3xl text-[15px] leading-relaxed text-muted-foreground">
          {lesson.description}
        </p>
      </div>

      {/* Đánh dấu đã xem */}
      <div>
        <Button
          variant={isWatched ? "outline" : "default"}
          disabled={!hasVideo || busy}
          onClick={onToggle}
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
      </div>

      {/* ══ BÀI TẬP — khối nổi bật, đặt cuối cùng ══ */}
      <section className="assignment-box">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-gold text-gold-foreground">
            <ClipboardList className="h-4 w-4" />
          </span>
          <h2 className="text-[15px] font-black uppercase tracking-[0.1em] text-gold">
            Bài tập cần nộp
          </h2>
          {isSubmitted && (
            <span className="ml-auto inline-flex items-center gap-1 rounded-full border border-emerald-500/35 bg-emerald-500/10 px-2 py-0.5 text-[11px] font-bold text-emerald-400">
              <CheckCircle2 className="h-3 w-3" /> Đã nộp
            </span>
          )}
        </div>

        <p className="mt-3 text-[16px] font-medium leading-relaxed text-foreground">
          {lesson.assignment}
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Button asChild className="bg-gradient-gold text-gold-foreground hover:opacity-90">
            <Link to="/bai-tap" hash={lesson.key}>
              {isSubmitted ? "Sửa bài nộp" : "Nộp bài tập"}
              <ArrowRight className="ml-1.5 h-4 w-4" />
            </Link>
          </Button>
          <span className="text-xs text-muted-foreground">
            Làm trên Google Docs rồi dán link · nộp được {POINTS_PER_SUBMISSION} điểm và 1 khiên
            vàng
          </span>
        </div>
      </section>
    </div>
  );
}
