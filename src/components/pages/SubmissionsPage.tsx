import { useCallback, useEffect, useState } from "react";
import { ShieldCheck, ExternalLink, Check, X, CircleDashed } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/PageHeader";
import { toast } from "sonner";
import { ALL_LESSONS, POINTS_PER_SUBMISSION } from "@/lib/lessons";
import { GRADING_DELAY_MS } from "@/lib/grading";
import { gradeSubmission } from "@/fn/gradeSubmission";
import { useReviewer } from "@/hooks/useReviewer";
import {
  ReviewComment,
  ReviewPending,
  ReviewLoading,
  ReviewError,
} from "@/components/ReviewComment";

interface Submission {
  lesson_key: string;
  doc_url: string;
  updated_at: string;
  ai_score: number | null;
  ai_feedback: string | null;
  graded_at: string | null;
  grade_error: string | null;
  admin_score: number | null;
  admin_feedback: string | null;
}

function isValidUrl(url: string) {
  try {
    const u = new URL(url);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

export function SubmissionsPage() {
  const { user } = useAuth();
  const [subs, setSubs] = useState<Record<string, Submission>>({});
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState<string | null>(null);
  const [grading, setGrading] = useState<Set<string>>(new Set());
  const [now, setNow] = useState(() => Date.now());
  const reviewerProfile = useReviewer();

  const load = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("submissions")
      .select(
        "lesson_key, doc_url, updated_at, ai_score, ai_feedback, graded_at, grade_error, admin_score, admin_feedback",
      )
      .eq("user_id", user.id);

    const map: Record<string, Submission> = {};
    const d: Record<string, string> = {};
    for (const row of data ?? []) {
      map[row.lesson_key] = row as Submission;
      d[row.lesson_key] = row.doc_url;
    }
    setSubs(map);
    setDrafts((prev) => ({ ...d, ...prev }));
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  // Nhịp 20 giây để đếm ngược tới lúc Phong phản hồi
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 20_000);
    return () => clearInterval(id);
  }, []);

  /** Bài đã nộp quá 5 phút mà chưa chấm thì gọi chấm. */
  useEffect(() => {
    const due = Object.values(subs).filter(
      (r) =>
        !r.graded_at &&
        !grading.has(r.lesson_key) &&
        now - new Date(r.updated_at).getTime() >= GRADING_DELAY_MS,
    );
    if (due.length === 0) return;

    for (const row of due) {
      setGrading((prev) => new Set(prev).add(row.lesson_key));
      gradeSubmission({ data: { lessonKey: row.lesson_key } })
        .then(() => load())
        .catch(() => {
          /* lỗi mạng — lần tải trang sau sẽ thử lại */
        })
        .finally(() =>
          setGrading((prev) => {
            const n = new Set(prev);
            n.delete(row.lesson_key);
            return n;
          }),
        );
    }
  }, [subs, now, grading, load]);

  const save = async (lessonKey: string) => {
    if (!user) return;
    const url = (drafts[lessonKey] ?? "").trim();

    if (!url) {
      toast.error("Chưa có link");
      return;
    }
    if (!isValidUrl(url)) {
      toast.error("Link không hợp lệ", { description: "Phải bắt đầu bằng https://" });
      return;
    }

    setBusy(lessonKey);
    const { error } = await supabase.from("submissions").upsert(
      {
        user_id: user.id,
        lesson_key: lessonKey,
        doc_url: url,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id,lesson_key" },
    );
    setBusy(null);

    if (error) {
      toast.error("Nộp bài thất bại", { description: error.message });
      return;
    }

    toast.success(
      subs[lessonKey]
        ? "Đã cập nhật link"
        : "Nộp bài thành công! +" + POINTS_PER_SUBMISSION + " điểm",
    );
    load();
  };

  const remove = async (lessonKey: string) => {
    if (!user) return;
    setBusy(lessonKey);
    const { error } = await supabase
      .from("submissions")
      .delete()
      .eq("user_id", user.id)
      .eq("lesson_key", lessonKey);
    setBusy(null);

    if (error) {
      toast.error("Không xoá được", { description: error.message });
      return;
    }
    setDrafts((prev) => ({ ...prev, [lessonKey]: "" }));
    toast.success("Đã xoá bài nộp");
    load();
  };

  const done = ALL_LESSONS.filter((l) => subs[l.key]).length;

  return (
    <div className="mx-auto max-w-[820px]">
      <PageHeader
        eyebrow="Bài tập"
        title="Nộp"
        accent="bài tập"
        description="Dán link Google Docs bài làm. Nộp rồi vẫn sửa được."
        action={
          <div className="inline-flex items-center gap-1.5 rounded-full border border-gold/30 bg-gold/10 px-3 py-1.5">
            <ShieldCheck className="h-4 w-4 text-gold" />
            <span className="text-sm font-bold text-gold">
              {done}
              <span className="font-medium text-gold/60">/{ALL_LESSONS.length}</span>
            </span>
          </div>
        }
      />

      <div className="space-y-2">
        {ALL_LESSONS.map((lesson, idx) => {
          const existing = subs[lesson.key];
          const draft = drafts[lesson.key] ?? "";
          const dirty = draft.trim() !== (existing?.doc_url ?? "");
          const working = busy === lesson.key;

          return (
            <Card
              key={lesson.key}
              id={lesson.key}
              className={
                "scroll-mt-20 p-3 transition-colors " +
                (existing ? "border-gold/25 bg-gold/[0.05]" : "border-border/70 bg-card/50")
              }
            >
              {/* Dòng 1 — số bài · tên bài · trạng thái */}
              <div className="mb-2 flex items-start gap-2">
                <span
                  className={
                    "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-xs font-black " +
                    (existing ? "bg-gold/20 text-gold" : "bg-primary/15 text-primary")
                  }
                >
                  {idx + 1}
                </span>
                <span className="min-w-0 flex-1 text-sm font-semibold leading-snug">
                  {lesson.assignment}
                </span>
                {existing ? (
                  <a
                    href={existing.doc_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Mở bài đã nộp"
                    className="mt-0.5 shrink-0 text-gold transition hover:opacity-70"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                ) : (
                  <CircleDashed className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground/50" />
                )}
              </div>

              {/* Dòng 2 — ô link + nút */}
              <div className="flex gap-2">
                <Input
                  type="url"
                  inputMode="url"
                  placeholder="https://docs.google.com/..."
                  value={draft}
                  onChange={(e) => setDrafts((prev) => ({ ...prev, [lesson.key]: e.target.value }))}
                  onKeyDown={(e) => e.key === "Enter" && dirty && save(lesson.key)}
                  className="h-9 flex-1 bg-background/60 text-sm"
                />

                <Button
                  size="sm"
                  onClick={() => save(lesson.key)}
                  disabled={working || !dirty}
                  className="h-9 shrink-0 bg-gradient-primary px-3 hover:opacity-90"
                >
                  <Check className="h-4 w-4" />
                  <span className="ml-1 hidden sm:inline">{existing ? "Cập nhật" : "Nộp"}</span>
                </Button>

                {existing && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => remove(lesson.key)}
                    disabled={working}
                    title="Xoá bài nộp"
                    className="h-9 w-9 shrink-0 p-0 text-muted-foreground hover:text-destructive"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>

              {existing && (
                <ReviewBlock
                  sub={existing}
                  isGrading={grading.has(lesson.key)}
                  now={now}
                  reviewer={
                    reviewerProfile
                      ? { name: reviewerProfile.name, avatarUrl: reviewerProfile.avatarUrl }
                      : undefined
                  }
                />
              )}
            </Card>
          );
        })}
      </div>

      <p className="mt-5 text-center text-xs leading-relaxed text-muted-foreground">
        Nhớ mở quyền <strong className="text-foreground/70">“Bất kỳ ai có đường liên kết”</strong>{" "}
        trong Google Docs.
      </p>
    </div>
  );
}

/** Chọn đúng trạng thái nhận xét để hiện dưới mỗi bài nộp. */
function ReviewBlock({
  sub,
  isGrading,
  now,
  reviewer,
}: {
  sub: Submission;
  isGrading: boolean;
  now: number;
  reviewer?: { name: string; avatarUrl: string | null };
}) {
  // Admin đã đánh giá thì luôn ưu tiên hiện đánh giá của Admin
  if (sub.admin_feedback) {
    return (
      <ReviewComment
        score={sub.admin_score}
        feedback={sub.admin_feedback}
        fromAdmin
        reviewer={reviewer}
      />
    );
  }

  if (sub.grade_error) return <ReviewError message={sub.grade_error} />;

  if (sub.ai_feedback) {
    return <ReviewComment score={sub.ai_score} feedback={sub.ai_feedback} reviewer={reviewer} />;
  }

  if (isGrading) return <ReviewLoading reviewer={reviewer} />;

  const elapsed = now - new Date(sub.updated_at).getTime();
  const minutesLeft = Math.max(0, Math.ceil((GRADING_DELAY_MS - elapsed) / 60_000));
  return <ReviewPending minutesLeft={minutesLeft} reviewer={reviewer} />;
}
