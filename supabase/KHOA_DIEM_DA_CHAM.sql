-- =====================================================
-- KHOA DIEM DA CHAM
-- Quy tac:
--   * Bai DA CO DIEM (ai_score IS NOT NULL) -> khoa vinh vien.
--     Khong ai cham lai duoc, ke ca hoc vien tu bam.
--   * Bai BI LOI QUYEN (grade_error, chua co diem) -> duoc phep cham lai
--     sau khi hoc vien cong khai tai lieu.
--   * Admin (phongtyphu1995@gmail.com) van sua diem thu cong duoc.
-- =====================================================

CREATE OR REPLACE FUNCTION public.khoa_diem_da_cham()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  la_admin BOOLEAN;
BEGIN
  -- Bai cu chua co diem thi khong khoa gi ca
  IF OLD.ai_score IS NULL THEN
    RETURN NEW;
  END IF;

  -- Admin duoc quyen sua diem thu cong
  SELECT COALESCE(is_admin, false) INTO la_admin
    FROM public.profiles WHERE id = auth.uid();
  IF la_admin THEN
    RETURN NEW;
  END IF;

  -- Da co diem: giu nguyen ket qua cham, chi cho phep doi link
  NEW.ai_score      := OLD.ai_score;
  NEW.ai_feedback   := OLD.ai_feedback;
  NEW.graded_at     := OLD.graded_at;
  NEW.grade_error   := OLD.grade_error;
  NEW.admin_score   := OLD.admin_score;
  NEW.admin_feedback := OLD.admin_feedback;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_khoa_diem_da_cham ON public.submissions;
CREATE TRIGGER trg_khoa_diem_da_cham
  BEFORE UPDATE ON public.submissions
  FOR EACH ROW
  EXECUTE FUNCTION public.khoa_diem_da_cham();

-- Kiem tra
SELECT count(*) FILTER (WHERE ai_score IS NOT NULL)   AS da_cham_khoa,
       count(*) FILTER (WHERE grade_error IS NOT NULL
                         AND ai_score IS NULL)        AS loi_quyen_cho_cham_lai,
       count(*) FILTER (WHERE graded_at IS NULL)      AS chua_cham
FROM public.submissions;
