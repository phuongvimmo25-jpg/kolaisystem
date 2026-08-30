import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface Reviewer {
  id: string;
  name: string;
  avatarUrl: string | null;
}

/**
 * Lấy hồ sơ của Admin để hiện làm người chấm bài.
 * Bảng user_roles có policy cho phép ai cũng đọc được dòng role='admin'.
 */
export function useReviewer() {
  const [reviewer, setReviewer] = useState<Reviewer | null>(null);

  const load = useCallback(async () => {
    const { data: roles } = await supabase
      .from("user_roles")
      .select("user_id")
      .eq("role", "admin")
      .limit(1);

    const adminId = roles?.[0]?.user_id;
    if (!adminId) return;

    const { data: profile } = await supabase
      .from("profiles")
      .select("id, display_name, avatar_url")
      .eq("id", adminId)
      .maybeSingle();

    if (profile) {
      setReviewer({
        id: profile.id,
        name: profile.display_name,
        avatarUrl: profile.avatar_url,
      });
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return reviewer;
}
