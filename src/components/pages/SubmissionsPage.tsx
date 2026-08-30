import { useCallback, useEffect, useState } from "react";
import { ShieldCheck, ExternalLink, Check, X, CircleDashed } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/PageHeader";
import { toast } from "sonner";
import { PARTS, ALL_LESSONS, POINTS_PER_SUBMISSION } from "@/lib/lessons";

interface Submission {
  lesson_key: string;
  doc_url: string;
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

  const load = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("submissions")
      .select("lesson_key, doc_url")
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
      subs[lessonKey] ? "Đã cập nhật link" : "Nộp bài thành công! +" + POINTS_PER_SUBMISSION + " điểm",
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

      <div className="space-y-5">
        {PARTS.map((part) => (
          <section key={part.key}>
            <h2 className="eyebrow mb-2">{part.title}</h2>

            <div className="space-y-2">
              {part.lessons.map((lesson) => {
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
                    {/* Dòng 1 — mã bài · tên bài · trạng thái */}
                    <div className="mb-2 flex items-center gap-2">
                      <span
                        className={
                          "shrink-0 rounded-md px-1.5 py-0.5 text-xs font-bold " +
                          (existing ? "bg-gold/20 text-gold" : "bg-primary/15 text-primary")
                        }
                      >
                        {lesson.code}
                      </span>
                      <span className="min-w-0 flex-1 truncate text-sm font-semibold">
                        {lesson.title}
                      </span>
                      {existing ? (
                        <a
                          href={existing.doc_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Mở bài đã nộp"
                          className="shrink-0 text-gold transition hover:opacity-70"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      ) : (
                        <CircleDashed className="h-4 w-4 shrink-0 text-muted-foreground/50" />
                      )}
                    </div>

                    {/* Dòng 2 — ô link + nút */}
                    <div className="flex gap-2">
                      <Input
                        type="url"
                        inputMode="url"
                        placeholder="https://docs.google.com/..."
                        value={draft}
                        onChange={(e) =>
                          setDrafts((prev) => ({ ...prev, [lesson.key]: e.target.value }))
                        }
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
                  </Card>
                );
              })}
            </div>
          </section>
        ))}
      </div>

      <p className="mt-5 text-center text-xs leading-relaxed text-muted-foreground">
        Nhớ mở quyền <strong className="text-foreground/70">“Bất kỳ ai có đường liên kết”</strong> trong
        Google Docs.
      </p>
    </div>
  );
}
