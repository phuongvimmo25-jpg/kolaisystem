import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { todayVN } from "@/lib/date";

export interface Profile {
  id: string;
  display_name: string;
  avatar_url: string | null;
  day_number: number;
  streak: number;
  total_points: number;
  submission_count: number;
  watched_count: number;
  zalo_name: string | null;
  onboarded_at: string | null;
  current_milestone: number;
  start_date: string;
  last_active_date: string | null;
}

interface ProfileCtx {
  profile: Profile | null;
  loading: boolean;
  refetch: () => Promise<void>;
  /** Cập nhật ngay tại chỗ, không chờ mạng — dùng khi vừa lưu xong. */
  patchProfile: (patch: Partial<Profile>) => void;
}

const Ctx = createContext<ProfileCtx>({
  profile: null,
  loading: true,
  refetch: async () => {},
  patchProfile: () => {},
});

/**
 * Nạp hồ sơ MỘT LẦN cho cả app.
 * Trước đây mỗi component gọi useProfile là một lượt truy vấn riêng — chậm và thừa.
 */
export function ProfileProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }
    const { data } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
    if (data) {
      // Tự cập nhật số ngày theo ngày bắt đầu
      const start = new Date(data.start_date);
      const today = new Date(todayVN());
      const diffDays = Math.floor((today.getTime() - start.getTime()) / 86400000) + 1;
      const computedDay = Math.min(Math.max(diffDays, 1), 30);
      if (computedDay !== data.day_number) {
        // Không chờ — cập nhật nền, không chặn giao diện
        void supabase.from("profiles").update({ day_number: computedDay }).eq("id", user.id);
        data.day_number = computedDay;
      }
      setProfile(data as Profile);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const patchProfile = useCallback((patch: Partial<Profile>) => {
    setProfile((prev) => (prev ? { ...prev, ...patch } : prev));
  }, []);

  return (
    <Ctx.Provider value={{ profile, loading, refetch: fetchProfile, patchProfile }}>
      {children}
    </Ctx.Provider>
  );
}

export const useProfile = () => useContext(Ctx);
