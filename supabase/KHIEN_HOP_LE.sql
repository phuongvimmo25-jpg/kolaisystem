-- =====================================================
-- Chi cong khien cho bai nop HOP LE
-- Nop nham link hong -> khi cham phat hien khong doc duoc -> tu go khien
-- =====================================================

-- 1. Tinh lai diem: bo qua bai nop bi loi khi cham
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
  -- Chi dem bai nop chua bi danh dau loi.
  -- Bai vua nop (chua cham) van duoc tinh; neu cham xong phat hien link hong
  -- thi grade_error co gia tri va khien tu bien mat.
  SELECT count(*) INTO s
    FROM public.submissions
   WHERE user_id = p_user
     AND grade_error IS NULL;

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

-- 2. Cham xong (ghi grade_error) cung phai tinh lai diem
--    Trigger cu chi chay khi INSERT/UPDATE/DELETE tren submissions — van dung,
--    nhung cho chac chan ta tao lai.
DROP TRIGGER IF EXISTS on_submission_change ON public.submissions;
CREATE TRIGGER on_submission_change
  AFTER INSERT OR UPDATE OR DELETE ON public.submissions
  FOR EACH ROW EXECUTE FUNCTION public.trg_recalc_points();

-- 3. Tinh lai cho tat ca nguoi dang co
DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN SELECT id FROM public.profiles LOOP
    PERFORM public.recalc_points(r.id);
  END LOOP;
END;
$$;

-- 4. Kiem tra ket qua
SELECT p.display_name,
       p.submission_count AS khien,
       p.watched_count    AS video,
       p.total_points     AS diem
FROM public.profiles p
ORDER BY p.total_points DESC;
