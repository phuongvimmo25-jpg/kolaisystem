-- =====================================================
-- Xep hang theo DIEM CHATBOT CHAM thay vi so bai nop
-- Diem cua Admin (neu co) duoc uu tien hon diem chatbot
-- =====================================================

-- 1. Cot luu tong diem bai tap, de hien cho hoc vien
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS grade_sum NUMERIC(5,1) NOT NULL DEFAULT 0;

-- 2. Tinh diem: diem bai tap + diem xem video
--    Bai chua cham tinh 0, cham xong nhay len diem that.
CREATE OR REPLACE FUNCTION public.recalc_points(p_user UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  s INT;      -- so bai da nop (= so khien)
  w INT;      -- so video da xem
  g NUMERIC;  -- tong diem bai tap
BEGIN
  SELECT count(*), COALESCE(sum(COALESCE(admin_score, ai_score, 0)), 0)
    INTO s, g
    FROM public.submissions
   WHERE user_id = p_user
     AND lesson_key IN ('ngay-1','ngay-2','ngay-3','ngay-4','ngay-5');

  SELECT count(*) INTO w
    FROM public.watched_videos
   WHERE user_id = p_user;

  UPDATE public.profiles
     SET submission_count = s,
         watched_count    = w,
         grade_sum        = g,
         -- Diem bai tap tinh theo diem cham that, khong con co dinh 10
         total_points     = ROUND(g + w * 5),
         updated_at       = now()
   WHERE id = p_user;
END;
$$;

-- 3. Cham diem xong cung phai tinh lai -> trigger cu da lo UPDATE roi, giu nguyen

-- 4. Tinh lai toan bo
DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN SELECT id FROM public.profiles LOOP
    PERFORM public.recalc_points(r.id);
  END LOOP;
END;
$$;

-- 5. Kiem tra
SELECT display_name,
       submission_count AS khien,
       grade_sum        AS diem_bai,
       watched_count    AS video,
       total_points     AS tong_diem
FROM public.profiles
WHERE submission_count > 0
ORDER BY total_points DESC
LIMIT 15;
