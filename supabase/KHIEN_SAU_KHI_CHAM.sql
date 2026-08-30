-- =====================================================
-- Khien CHI duoc cap khi chatbot cham thanh cong
-- Nop bai van duoc ghi nhan, nhung chua doc duoc tai lieu thi chua co khien
-- =====================================================

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
  -- Chi dem bai DA CHAM XONG va CHAM THANH CONG:
  --   graded_at   : da cham
  --   grade_error : khong loi
  --   ai_feedback : that su co nhan xet
  SELECT count(*) INTO s
    FROM public.submissions
   WHERE user_id = p_user
     AND lesson_key IN ('ngay-1','ngay-2','ngay-3','ngay-4','ngay-5')
     AND graded_at   IS NOT NULL
     AND grade_error IS NULL
     AND ai_feedback IS NOT NULL;

  SELECT count(*) INTO w
    FROM public.watched_videos
   WHERE user_id = p_user;

  UPDATE public.profiles
     SET submission_count = s,
         watched_count    = w,
         total_points     = s * 10 + w * 5,
         updated_at       = now()
   WHERE id = p_user;
END;
$$;

-- Tinh lai cho tat ca
DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN SELECT id FROM public.profiles LOOP
    PERFORM public.recalc_points(r.id);
  END LOOP;
END;
$$;

-- Kiem tra: so nguoi NOP vs so nguoi CO KHIEN
SELECT
  (SELECT count(DISTINCT user_id) FROM public.submissions)              AS da_nop,
  (SELECT count(*) FROM public.profiles WHERE submission_count > 0)     AS co_khien,
  (SELECT count(*) FROM public.submissions WHERE graded_at IS NULL)     AS chua_cham,
  (SELECT count(*) FROM public.submissions WHERE grade_error IS NOT NULL) AS loi_quyen;
