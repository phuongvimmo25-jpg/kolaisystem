-- =====================================================
-- KOL AI SYSTEM — Dung lai toan bo database
-- Gop tu 4 file migration, chay theo dung thu tu.
-- Dan toan bo file nay vao Supabase SQL Editor va bam Run.
-- =====================================================


-- ############ 20260419051054_a75880d0-d403-4248-8a28-b278357e3c81.sql ############

CREATE TABLE public.profiles (
  id UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL DEFAULT 'KOL Mới',
  avatar_url TEXT,
  day_number INT NOT NULL DEFAULT 1,
  streak INT NOT NULL DEFAULT 0,
  total_points INT NOT NULL DEFAULT 0,
  current_milestone NUMERIC NOT NULL DEFAULT 0,
  start_date DATE NOT NULL DEFAULT (now() AT TIME ZONE 'Asia/Ho_Chi_Minh')::date,
  last_active_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE TABLE public.daily_missions (
  id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  mission_key TEXT NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT false,
  quantity_logged INT NOT NULL DEFAULT 0,
  points_awarded INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, date, mission_key)
);

ALTER TABLE public.daily_missions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own missions" ON public.daily_missions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own missions" ON public.daily_missions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own missions" ON public.daily_missions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own missions" ON public.daily_missions FOR DELETE USING (auth.uid() = user_id);

CREATE TABLE public.income_milestones (
  id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  milestone_amount NUMERIC NOT NULL,
  achieved_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, milestone_amount)
);

ALTER TABLE public.income_milestones ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Milestones viewable by everyone" ON public.income_milestones FOR SELECT USING (true);
CREATE POLICY "Users insert own milestones" ON public.income_milestones FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own milestones" ON public.income_milestones FOR DELETE USING (auth.uid() = user_id);

CREATE TABLE public.badges (
  id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_key TEXT NOT NULL,
  earned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, badge_key)
);

ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Badges viewable by everyone" ON public.badges FOR SELECT USING (true);
CREATE POLICY "Users insert own badges" ON public.badges FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.watched_videos (
  id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  video_key TEXT NOT NULL,
  watched_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, video_key)
);

ALTER TABLE public.watched_videos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own watched" ON public.watched_videos FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own watched" ON public.watched_videos FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_missions_updated_at BEFORE UPDATE ON public.daily_missions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1), 'KOL Mới'),
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Avatar images are publicly accessible"
  ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "Users can upload their own avatar"
  ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can update their own avatar"
  ON storage.objects FOR UPDATE USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can delete their own avatar"
  ON storage.objects FOR DELETE USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE INDEX idx_missions_user_date ON public.daily_missions(user_id, date);
CREATE INDEX idx_milestones_user ON public.income_milestones(user_id);
CREATE INDEX idx_badges_user ON public.badges(user_id);
CREATE INDEX idx_profiles_points ON public.profiles(total_points DESC);


-- ############ 20260419051118_afca2b3f-3b9d-42f8-b95b-3864f9936da3.sql ############

DROP POLICY IF EXISTS "Avatar images are publicly accessible" ON storage.objects;
CREATE POLICY "Avatar images are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] IS NOT NULL);


-- ############ 20260427143104_95f6871e-e0bf-4725-acd2-5ce66b9c2889.sql ############
-- Enum vai trò
DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Bảng user_roles
CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function: kiểm tra vai trò
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- RLS policies cho user_roles
DROP POLICY IF EXISTS "Users view own roles" ON public.user_roles;
CREATE POLICY "Users view own roles" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins manage roles" ON public.user_roles;
CREATE POLICY "Admins manage roles" ON public.user_roles
  FOR ALL USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Function: admin xóa user khỏi hệ thống
CREATE OR REPLACE FUNCTION public.admin_delete_user(_target_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Chỉ quản trị viên mới có quyền xóa thành viên';
  END IF;

  IF _target_user_id = auth.uid() THEN
    RAISE EXCEPTION 'Không thể tự xóa tài khoản của chính mình';
  END IF;

  DELETE FROM public.daily_missions WHERE user_id = _target_user_id;
  DELETE FROM public.income_milestones WHERE user_id = _target_user_id;
  DELETE FROM public.watched_videos WHERE user_id = _target_user_id;
  DELETE FROM public.badges WHERE user_id = _target_user_id;
  DELETE FROM public.user_roles WHERE user_id = _target_user_id;
  DELETE FROM public.profiles WHERE id = _target_user_id;
  DELETE FROM auth.users WHERE id = _target_user_id;
END;
$$;

-- ############ 20260427143132_8b03f640-3e99-417a-8be0-054643332513.sql ############
REVOKE EXECUTE ON FUNCTION public.admin_delete_user(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_delete_user(uuid) TO authenticated;
