-- =====================================================
-- MOI NGAY THUC TE CHI TINH 1 KHIEN
--
-- Van cho hoc vien nop bai ngay 2 ngay trong hom nay,
-- nhung khien dem theo SO NGAY THUC TE co nop bai,
-- khong phai so bai nop. Chay dua nop don khong gom them khien.
--
-- Diem cham va xep hang giu nguyen: nop bai nao van duoc cham bai do.
-- =====================================================

CREATE OR REPLACE FUNCTION public.recalc_points(p_user UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  s INT;          -- so KHIEN = so ngay thuc te co nop bai
  n INT;          -- so bai da nop
  w INT;          -- so video da xem
  g NUMERIC;      -- tong diem bai tap
  t_dau TIMESTAMPTZ;
  d JSONB;        -- diem tung ngay
BEGIN
  SELECT count(DISTINCT (created_at AT TIME ZONE 'Asia/Ho_Chi_Minh')::date),
         count(*),
         COALESCE(sum(COALESCE(admin_score, ai_score, 0)), 0),
         min(created_at)
    INTO s, n, g, t_dau
    FROM public.submissions
   WHERE user_id = p_user
     AND lesson_key IN ('ngay-1','ngay-2','ngay-3','ngay-4','ngay-5');

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
         total_points     = ROUND(g * 10),
         updated_at       = now()
   WHERE id = p_user;
END;
$$;

DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN SELECT id FROM public.profiles LOOP
    PERFORM public.recalc_points(r.id);
  END LOOP;
END;
$$;

SELECT max(submission_count) AS khien_cao_nhat,
       count(*) FILTER (WHERE submission_count > 0) AS so_nguoi_co_khien
FROM public.profiles;
