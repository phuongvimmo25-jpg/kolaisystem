import { useEffect, useState, useCallback } from "react";
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
  current_milestone: number;
  start_date: string;
  last_active_date: string | null;
}

export function useProfile() {
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
      // Auto-update day_number based on start_date
      const start = new Date(data.start_date);
      const today = new Date(todayVN());
      const diffDays = Math.floor((today.getTime() - start.getTime()) / 86400000) + 1;
      const computedDay = Math.min(Math.max(diffDays, 1), 30);
      if (computedDay !== data.day_number) {
        await supabase.from("profiles").update({ day_number: computedDay }).eq("id", user.id);
        data.day_number = computedDay;
      }
      setProfile(data as Profile);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return { profile, loading, refetch: fetchProfile };
}
