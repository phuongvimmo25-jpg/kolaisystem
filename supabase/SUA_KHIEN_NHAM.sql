-- =====================================================
-- SUA LOI: nop 1 bai nhung duoc nhieu khien
-- Nguyen nhan: bang submissions con bai nop theo ma cu (p1-b1, p1-b2...)
--              tu hoi moi video la mot bai nop.
-- =====================================================

-- ── BUOC 1: Xem dang co nhung ma nao ─────────────────
SELECT lesson_key, count(*) AS so_bai
FROM public.submissions
GROUP BY lesson_key
ORDER BY lesson_key;


-- ── BUOC 2: Chuyen bai nop cu sang Ngay 1 ────────────
-- Giu lai link nop dau tien cua moi nguoi, khong ai mat bai.
INSERT INTO public.submissions (user_id, lesson_key, doc_url, created_at, updated_at)
SELECT DISTINCT ON (user_id)
       user_id, 'ngay-1', doc_url, created_at, updated_at
FROM public.submissions
WHERE lesson_key NOT LIKE 'ngay-%'
ORDER BY user_id, created_at ASC
ON CONFLICT (user_id, lesson_key) DO NOTHING;


-- ── BUOC 3: Xoa toan bo bai nop khong theo ma ngay ───
DELETE FROM public.submissions
WHERE lesson_key NOT LIKE 'ngay-%';


-- ── BUOC 4: Chan tan goc — chi dem ma ngay hop le ────
-- Du sau nay co dong rac nao lot vao, diem van khong bi cong nham.
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
  -- Chi dem bai nop CO MA NGAY HOP LE va KHONG bi loi khi cham
  SELECT count(*) INTO s
    FROM public.submissions
   WHERE user_id = p_user
     AND grade_error IS NULL
     AND lesson_key IN ('ngay-1','ngay-2','ngay-3','ngay-4','ngay-5');

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


-- ── BUOC 5: Tinh lai diem cho tat ca ─────────────────
DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN SELECT id FROM public.profiles LOOP
    PERFORM public.recalc_points(r.id);
  END LOOP;
END;
$$;


-- ── BUOC 6: Kiem tra — cot khien phai <= 5, hien tai <= 1 ──
SELECT display_name,
       submission_count AS khien,
       watched_count    AS video,
       total_points     AS diem
FROM public.profiles
WHERE submission_count > 0
ORDER BY submission_count DESC, total_points DESC
LIMIT 20;
