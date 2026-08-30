import { useCallback, useEffect, useState } from "react";
import { ShieldCheck, ExternalLink, Save, Trash2, CircleDashed, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { PARTS, ALL_LESSONS, POINTS_PER_SUBMISSION } from "@/lib/lessons";

interface Submission {
  lesson_key: string;
  doc_url: string;
  note: string | null;
  updated_at: string;
}

/** Cảnh báo mềm: link không giống Google Docs thì nhắc, nhưng vẫn cho nộp. */
function looksLikeGoogleDoc(url: string) {
  return /docs\.google\.com|drive\.google\.com/i.test(url);
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
  const [drafts, setDrafts] = useState<Record<string, { url: string; note: string }>>({});
  const [busy, setBusy] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("submissions")
      .select("lesson_key, doc_url, note, updated_at")
      .eq("user_id", user.id);

    const map: Record<string, Submission> = {};
    const d: Record<string, { url: string; note: string }> = {};
    for (const row of data ?? []) {
      map[row.lesson_key] = row as Submission;
      d[row.lesson_key] = { url: row.doc_url, note: row.note ?? "" };
    }
    setSubs(map);
    setDrafts((prev) => ({ ...d, ...prev }));
    setLoading(false);
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  const draftOf = (key: string) => drafts[key] ?? { url: "", note: "" };

  const setDraft = (key: string, patch: Partial<{ url: string; note: string }>) =>
    setDrafts((prev) => ({ ...prev, [key]: { ...draftOf(key), ...patch } }));

  const save = async (lessonKey: string) => {
    if (!user) return;
    const { url, note } = draftOf(lessonKey);
    const trimmed = url.trim();

    if (!trimmed) {
      toast.error("Chưa có link", { description: "Dán link Google Docs bài làm của bạn vào ô trên." });
      return;
    }
    if (!isValidUrl(trimmed)) {
      toast.error("Link không hợp lệ", { description: "Link phải bắt đầu bằng http:// hoặc https://" });
      return;
    }

    setBusy(lessonKey);
    const { error } = await supabase.from("submissions").upsert(
      {
        user_id: user.id,
        lesson_key: lessonKey,
        doc_url: trimmed,
        note: note.trim() || null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id,lesson_key" },
    );
    setBusy(null);

    if (error) {
      toast.error("Nộp bài thất bại", { description: error.message });
      return;
    }

    const isNew = !subs[lessonKey];
    toast.success(isNew ? "Nộp bài thành công!" : "Đã cập nhật link", {
      description: isNew
        ? "+" + POINTS_PER_SUBMISSION + " điểm — bạn nhận thêm 1 khiên vàng ở Vinh danh."
        : "Link mới đã được lưu.",
    });
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
    setDrafts((prev) => ({ ...prev, [lessonKey]: { url: "", note: "" } }));
    toast.success("Đã xoá bài nộp", { description: "Bạn mất 1 khiên vàng cho bài này." });
    load();
  };

  const doneCount = ALL_LESSONS.filter((l) => subs[l.key]).length;

  return (
    <div className="space-y-8">
      <section>
        <h1 className="text-2xl font-black tracking-tight md:text-3xl">
          <span className="text-gradient-primary">Nộp bài tập</span>
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Làm bài trên Google Docs rồi dán link vào đây. Nộp rồi vẫn sửa link được bất cứ lúc nào.
        </p>

        <Card className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 border-border bg-card/60 p-4">
          <div className="inline-flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-amber-400" />
            <span className="text-sm">
              <strong className="text-amber-400">{doneCount}</strong>
              <span className="text-muted-foreground">/{ALL_LESSONS.length} khiên vàng</span>
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            ⚠️ Nhớ mở quyền <strong className="text-foreground/80">“Bất kỳ ai có đường liên kết”</strong> trong
            Google Docs, nếu không người chấm sẽ không mở được bài của bạn.
          </p>
        </Card>
      </section>

      {PARTS.map((part) => (
        <section key={part.key}>
          <h2 className="text-xl font-black tracking-tight">{part.title}</h2>

          <div className="mt-4 space-y-4">
            {part.lessons.map((lesson) => {
              const existing = subs[lesson.key];
              const draft = draftOf(lesson.key);
              const dirty = existing ? draft.url !== existing.doc_url || draft.note !== (existing.note ?? "") : !!draft.url;
              const warnNotGoogle = draft.url.trim() !== "" && !looksLikeGoogleDoc(draft.url);

              return (
                <Card
                  key={lesson.key}
                  id={lesson.key}
                  className={`scroll-mt-24 border-border p-5 ${existing ? "bg-amber-500/5 border-amber-500/25" : "bg-card/60"}`}
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                        <span className="font-bold text-primary">Bài {lesson.code}</span>
                        {existing ? (
                          <span className="inline-flex items-center gap-1 font-semibold text-amber-400">
                            <ShieldCheck className="h-3 w-3" /> Đã nộp
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1">
                            <CircleDashed className="h-3 w-3" /> Chưa nộp
                          </span>
                        )}
                      </div>
                      <h3 className="mt-1 text-base font-bold leading-snug">{lesson.title}</h3>
                    </div>

                    {existing && (
                      <Button size="sm" variant="ghost" asChild>
                        <a href={existing.doc_url} target="_blank" rel="noopener noreferrer">
                          Mở bài đã nộp <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
                        </a>
                      </Button>
                    )}
                  </div>

                  <div className="mt-3 rounded-lg border border-border/60 bg-background/40 p-3">
                    <div className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                      Đề bài
                    </div>
                    <p className="mt-1 text-xs leading-relaxed text-foreground/85">{lesson.assignment}</p>
                  </div>

                  <div className="mt-4 space-y-3">
                    <div>
                      <Label htmlFor={`url-${lesson.key}`} className="text-xs">
                        Link Google Docs
                      </Label>
                      <Input
                        id={`url-${lesson.key}`}
                        type="url"
                        inputMode="url"
                        placeholder="https://docs.google.com/document/d/..."
                        value={draft.url}
                        onChange={(e) => setDraft(lesson.key, { url: e.target.value })}
                        className="mt-1 bg-background/50"
                      />
                      {warnNotGoogle && (
                        <p className="mt-1.5 inline-flex items-start gap-1.5 text-[11px] text-amber-400">
                          <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0" />
                          Link này không giống Google Docs. Vẫn nộp được, nhưng kiểm tra lại cho chắc.
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor={`note-${lesson.key}`} className="text-xs">
                        Ghi chú <span className="text-muted-foreground">(không bắt buộc)</span>
                      </Label>
                      <Textarea
                        id={`note-${lesson.key}`}
                        rows={2}
                        placeholder="Điều bạn muốn người chấm lưu ý..."
                        value={draft.note}
                        onChange={(e) => setDraft(lesson.key, { note: e.target.value })}
                        className="mt-1 resize-none bg-background/50"
                      />
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <Button
                      size="sm"
                      onClick={() => save(lesson.key)}
                      disabled={busy === lesson.key || (!dirty && !!existing)}
                      className="bg-gradient-primary hover:opacity-90"
                    >
                      <Save className="mr-1.5 h-4 w-4" />
                      {busy === lesson.key ? "Đang lưu..." : existing ? "Cập nhật link" : "Nộp bài"}
                    </Button>

                    {existing && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => remove(lesson.key)}
                        disabled={busy === lesson.key}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="mr-1.5 h-3.5 w-3.5" /> Xoá bài nộp
                      </Button>
                    )}

                    {existing && !dirty && (
                      <span className="text-[11px] text-muted-foreground">
                        Nộp lúc {new Date(existing.updated_at).toLocaleString("vi-VN")}
                      </span>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        </section>
      ))}

      {loading && <p className="text-center text-xs text-muted-foreground">Đang tải bài nộp...</p>}
    </div>
  );
}
