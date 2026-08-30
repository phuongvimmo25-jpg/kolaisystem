-- =====================================================
-- Cham diem bang AI + tai khoan Admin
-- Dan toan bo vao Supabase SQL Editor roi bam Run.
-- =====================================================

-- 1. Cot luu ket qua cham
ALTER TABLE public.submissions
  ADD COLUMN IF NOT EXISTS ai_score      NUMERIC(4,1),
  ADD COLUMN IF NOT EXISTS ai_feedback   TEXT,
  ADD COLUMN IF NOT EXISTS graded_at     TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS grade_error   TEXT,
  -- Admin ghi de: neu co gia tri thi hien cai nay thay cho AI
  ADD COLUMN IF NOT EXISTS admin_score    NUMERIC(4,1),
  ADD COLUMN IF NOT EXISTS admin_feedback TEXT,
  ADD COLUMN IF NOT EXISTS admin_at       TIMESTAMPTZ;

-- 2. Admin duoc doc va sua moi bai nop
DROP POLICY IF EXISTS "Admins view all submissions"   ON public.submissions;
DROP POLICY IF EXISTS "Admins update all submissions" ON public.submissions;

CREATE POLICY "Admins view all submissions" ON public.submissions
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins update all submissions" ON public.submissions
  FOR UPDATE USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 2b. Cho phep moi nguoi biet AI la admin (chi dong role='admin'),
--     de app lay duoc anh dai dien nguoi cham hien tren nhan xet.
DROP POLICY IF EXISTS "Anyone can see admins" ON public.user_roles;
CREATE POLICY "Anyone can see admins" ON public.user_roles
  FOR SELECT USING (role = 'admin');

-- 3. Danh dau tai khoan cua Phong Menly la Admin
--    Chay duoc ngay ca khi tai khoan chua dang nhap lan nao (luc do khong co gi de lam,
--    chay lai cau nay sau khi dang nhap la duoc).
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::public.app_role
FROM auth.users
WHERE lower(email) = 'phongtyphu1995@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;

-- 4. Ham cho server ghi ket qua cham (bo qua RLS, chi server goi bang service key)
CREATE OR REPLACE FUNCTION public.save_ai_grade(
  p_user       UUID,
  p_lesson_key TEXT,
  p_score      NUMERIC,
  p_feedback   TEXT,
  p_error      TEXT DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.submissions
     SET ai_score    = p_score,
         ai_feedback = p_feedback,
         grade_error = p_error,
         graded_at   = now()
   WHERE user_id = p_user AND lesson_key = p_lesson_key;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.save_ai_grade(UUID, TEXT, NUMERIC, TEXT, TEXT) FROM PUBLIC, anon;

-- 5. Xem ai dang la admin
SELECT u.email, p.display_name, r.role
FROM public.user_roles r
JOIN auth.users u ON u.id = r.user_id
LEFT JOIN public.profiles p ON p.id = r.user_id;
