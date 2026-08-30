import { useCallback, useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Timer, CheckCircle2, Flag } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { currentDeadline, ALL_LESSONS, type DeadlineInfo } from "@/lib/lessons";

interface Remaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalMs: number;
}

function remainingUntil(deadline: Date, now: Date): Remaining {
  const totalMs = Math.max(0, deadline.getTime() - now.getTime());
  const totalSec = Math.floor(totalMs / 1000);
  return {
    days: Math.floor(totalSec / 86400),
    hours: Math.floor((totalSec % 86400) / 3600),
    minutes: Math.floor((totalSec % 3600) / 60),
    seconds: totalSec % 60,
    totalMs,
  };
}

const pad = (n: number) => String(n).padStart(2, "0");

/** Ô số của đồng hồ đếm ngược. */
function Unit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <span className="font-mono text-sm font-black leading-none tabular-nums sm:text-base">
        {pad(value)}
      </span>
      <span className="mt-0.5 text-[8px] uppercase tracking-wider opacity-70 sm:text-[9px]">
        {label}
      </span>
    </div>
  );
}

/**
 * Thanh đếm ngược hạn nộp bài — luôn hiện, bám giữa màn hình dưới thanh điều hướng.
 * Tự nhảy sang bài kế tiếp khi qua ngày.
 */
export function CountdownBar() {
  const { user } = useAuth();
  const [now, setNow] = useState(() => new Date());
  const [submitted, setSubmitted] = useState<Set<string>>(new Set());

  // Nhịp đồng hồ 1 giây
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const loadSubmissions = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("submissions")
      .select("lesson_key")
      .eq("user_id", user.id);
    setSubmitted(new Set((data ?? []).map((r) => r.lesson_key)));
  }, [user]);

  useEffect(() => {
    loadSubmissions();
  }, [loadSubmissions]);

  // Nộp bài ở tab khác cũng cập nhật được trạng thái ở đây
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel("countdown-submissions")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "submissions", filter: `user_id=eq.${user.id}` },
        () => loadSubmissions(),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, loadSubmissions]);

  const info: DeadlineInfo | null = currentDeadline(now);

  // Hết hạn toàn khoá
  if (!info) {
    return (
      <Bar tone="done">
        <Flag className="h-4 w-4 shrink-0" />
        <span className="text-xs font-semibold sm:text-sm">
          Đã hết hạn nộp toàn bộ {ALL_LESSONS.length} bài
        </span>
      </Bar>
    );
  }

  const left = remainingUntil(info.deadline, now);
  const isSubmitted = submitted.has(info.lesson.key);
  const urgent = left.totalMs < 24 * 3600 * 1000;

  if (isSubmitted) {
    return (
      <Bar tone="done">
        <CheckCircle2 className="h-4 w-4 shrink-0" />
        <span className="text-xs font-semibold sm:text-sm">
          Đã nộp bài số {info.index + 1} — còn {left.days > 0 ? `${left.days} ngày ` : ""}
          {pad(left.hours)}:{pad(left.minutes)}:{pad(left.seconds)} để sửa
        </span>
      </Bar>
    );
  }

  return (
    <Link to="/bai-tap" hash={info.lesson.key} className="block">
      <Bar tone={urgent ? "urgent" : "normal"}>
        <Timer className={`h-4 w-4 shrink-0 ${urgent ? "animate-pulse" : ""}`} />
        <span className="truncate text-xs font-semibold sm:text-sm">
          Hạn nộp <strong>bài số {info.index + 1}</strong>
        </span>
        <span className="mx-0.5 opacity-40">•</span>
        <div className="flex items-center gap-1.5 sm:gap-2">
          {left.days > 0 && <Unit value={left.days} label="ngày" />}
          <Unit value={left.hours} label="giờ" />
          <Unit value={left.minutes} label="phút" />
          <Unit value={left.seconds} label="giây" />
        </div>
      </Bar>
    </Link>
  );
}

function Bar({
  tone,
  children,
}: {
  tone: "normal" | "urgent" | "done";
  children: React.ReactNode;
}) {
  const styles = {
    normal:
      "border-primary/40 bg-primary/15 text-foreground shadow-[0_6px_24px_-8px_oklch(0.55_0.24_295/0.7)]",
    urgent:
      "border-red-500/50 bg-red-500/15 text-red-200 shadow-[0_6px_24px_-8px_rgba(239,68,68,0.7)]",
    done: "border-emerald-500/40 bg-emerald-500/12 text-emerald-200",
  }[tone];

  return (
    <div className="pointer-events-none sticky top-[57px] z-20 flex justify-center px-4 pt-3">
      <div
        className={`pointer-events-auto inline-flex max-w-full items-center gap-2 rounded-full border px-3.5 py-2 backdrop-blur-xl transition-colors sm:gap-3 sm:px-5 ${styles}`}
      >
        {children}
      </div>
    </div>
  );
}
