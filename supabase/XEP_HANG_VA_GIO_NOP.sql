-- =====================================================
-- XEP HANG CHUAN + DIEM TUNG NGAY
--
-- Loi cu: total_points = diem + so_video * 5
--         -> xem 3 video (15 diem) an dut bai 10 diem.
--         Thu hang bi so video chi phoi thay vi diem cham.
-- Sua:    xep hang thuan theo diem cham. Video chi la thong tin.
--         Them cot day_scores de hien diem RIENG cua tung ngay.
-- =====================================================

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS day_scores      JSONB NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS first_submit_at TIMESTAMPTZ;


CREATE OR REPLACE FUNCTION public.recalc_points(p_user UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  s INT;          -- so bai da nop (= so khien)
  w INT;          -- so video da xem
  g NUMERIC;      -- tong diem bai tap
  t_dau TIMESTAMPTZ;
  d JSONB;        -- diem tung ngay: {"ngay-1": 9.5, ...}
BEGIN
  SELECT count(*),
         COALESCE(sum(COALESCE(admin_score, ai_score, 0)), 0),
         min(created_at)
    INTO s, g, t_dau
    FROM public.submissions
   WHERE user_id = p_user
     AND lesson_key IN ('ngay-1','ngay-2','ngay-3','ngay-4','ngay-5');

  -- Diem cua tung ngay. Bai chua cham xong thi bo qua, khong ghi 0
  -- de hoc vien khong tuong minh bi 0 diem trong luc cho.
  SELECT COALESCE(jsonb_object_agg(lesson_key,
                                   COALESCE(admin_score, ai_score)), '{}'::jsonb)
    INTO d
    FROM public.submissions
   WHERE user_id = p_user
     AND lesson_key IN ('ngay-1','ngay-2','ngay-3','ngay-4','ngay-5')
     AND COALESCE(admin_score, ai_score) IS NOT NULL;

  SELECT count(*) INTO w
    FROM public.watched_videos
   WHERE user_id = p_user;

  UPDATE public.profiles
     SET submission_count = s,
         watched_count    = w,
         grade_sum        = g,
         day_scores       = d,
         first_submit_at  = t_dau,
         -- Thu hang thuan theo diem cham. Nhan 10 de giu so nguyen,
         -- nho vay 9.5 diem van hon 9.4 diem khi sap xep.
         total_points     = ROUND(g * 10),
         updated_at       = now()
   WHERE id = p_user;
END;
$$;


-- ── Tinh lai toan bo ─────────────────────────────────
DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN SELECT id FROM public.profiles LOOP
    PERFORM public.recalc_points(r.id);
  END LOOP;
END;
$$;


-- ── Kiem tra: thu hang phai theo diem, khong theo video ──
SELECT row_number() OVER (ORDER BY grade_sum DESC, submission_count DESC,
                                   first_submit_at ASC NULLS LAST) AS hang,
       display_name,
       grade_sum        AS tong_diem,
       day_scores       AS diem_tung_ngay,
       submission_count AS khien,
       watched_count    AS video
FROM public.profiles
WHERE submission_count > 0
ORDER BY grade_sum DESC, submission_count DESC, first_submit_at ASC NULLS LAST
LIMIT 15;
