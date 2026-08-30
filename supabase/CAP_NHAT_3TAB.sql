-- =====================================================
-- Rut gon he thong con 3 tab: Video / Nop bai tap / Vinh danh
-- Them bang nop bai + he diem tu dong
-- =====================================================

-- 1. Bang nop bai tap (moi hoc vien nop 1 link Google Docs cho moi bai hoc)
CREATE TABLE IF NOT EXISTS public.submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_key TEXT NOT NULL,
  doc_url TEXT NOT NULL,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, lesson_key)
);

ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users view own submissions"   ON public.submissions;
DROP POLICY IF EXISTS "Users insert own submissions" ON public.submissions;
DROP POLICY IF EXISTS "Users update own submissions" ON public.submissions;
DROP POLICY IF EXISTS "Users delete own submissions" ON public.submissions;

CREATE POLICY "Users view own submissions"   ON public.submissions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own submissions" ON public.submissions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own submissions" ON public.submissions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own submissions" ON public.submissions FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_submissions_user ON public.submissions(user_id);

-- 2. Cot dem, de bang Vinh danh hien duoc chi tiet ma khong pha RLS
--    (bang profiles von cho moi nguoi doc, nen dem phai nam o day)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS submission_count INT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS watched_count    INT NOT NULL DEFAULT 0;

-- 3. Tinh lai diem: 1 bai nop = 10 diem, 1 video xem xong = 5 diem
CREATE OR REPLACE FUNCTION public.recalc_points(p_user UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  s INT;
  w INT;
BEGIN
  SELECT count(*) INTO s FROM public.submissions    WHERE user_id = p_user;
  SELECT count(*) INTO w FROM public.watched_videos WHERE user_id = p_user;
  UPDATE public.profiles
     SET submission_count = s,
         watched_count    = w,
         total_points     = s * 10 + w * 5,
         updated_at       = now()
   WHERE id = p_user;
END;
$$;

CREATE OR REPLACE FUNCTION public.trg_recalc_points()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM public.recalc_points(COALESCE(NEW.user_id, OLD.user_id));
  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS on_submission_change ON public.submissions;
CREATE TRIGGER on_submission_change
  AFTER INSERT OR UPDATE OR DELETE ON public.submissions
  FOR EACH ROW EXECUTE FUNCTION public.trg_recalc_points();

DROP TRIGGER IF EXISTS on_watched_change ON public.watched_videos;
CREATE TRIGGER on_watched_change
  AFTER INSERT OR UPDATE OR DELETE ON public.watched_videos
  FOR EACH ROW EXECUTE FUNCTION public.trg_recalc_points();

-- 4. Tinh lai diem cho nhung nguoi da co san
DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN SELECT id FROM public.profiles LOOP
    PERFORM public.recalc_points(r.id);
  END LOOP;
END;
$$;
