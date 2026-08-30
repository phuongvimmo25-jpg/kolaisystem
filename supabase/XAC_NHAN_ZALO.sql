-- =====================================================
-- Man hinh xac nhan ten Zalo khi dang nhap lan dau
-- =====================================================

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS zalo_name    TEXT,
  ADD COLUMN IF NOT EXISTS onboarded_at TIMESTAMPTZ;

-- Admin xem duoc ten Zalo cua moi hoc vien de doi chieu khi duyet nhom
DROP POLICY IF EXISTS "Admins view all profiles" ON public.profiles;
CREATE POLICY "Admins view all profiles" ON public.profiles
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- Xem danh sach da khai ten Zalo
SELECT p.display_name, p.zalo_name, p.onboarded_at
FROM public.profiles p
ORDER BY p.onboarded_at DESC NULLS LAST;
