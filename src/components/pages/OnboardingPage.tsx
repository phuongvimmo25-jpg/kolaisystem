import { useState } from "react";
import { ArrowRight, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import logo from "@/assets/logo.png";

/**
 * Bước đệm khi đăng nhập lần đầu — học viên khai tên Zalo.
 * Xác nhận xong là vào thẳng app.
 */
export function OnboardingPage() {
  const { user } = useAuth();
  const { profile, refetch } = useProfile();
  const [zaloName, setZaloName] = useState("");
  const [saving, setSaving] = useState(false);

  const confirm = async () => {
    const name = zaloName.trim();
    if (name.length < 2) {
      toast.error("Chưa có tên Zalo", { description: "Nhập đúng tên hiển thị trên Zalo của bạn." });
      return;
    }
    if (!user) return;

    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({ zalo_name: name, onboarded_at: new Date().toISOString() })
      .eq("id", user.id);

    if (error) {
      setSaving(false);
      toast.error("Chưa lưu được", { description: error.message });
      return;
    }

    toast.success("Đã xác nhận!");
    // refetch xong, cổng ở __root mở ra và học viên vào thẳng app
    await refetch();
  };

  return (
    <div
      className="flex min-h-screen items-center justify-center px-4 py-8"
      style={{
        backgroundImage:
          "radial-gradient(ellipse 60% 50% at 50% 0%, oklch(0.78 0.16 75 / 0.16), transparent 60%), linear-gradient(180deg, #0A0A0F 0%, #14100A 100%)",
      }}
    >
      <div className="w-full max-w-sm rounded-2xl border border-gold/25 bg-card/70 p-6 backdrop-blur-xl sm:p-7">
        <div className="text-center">
          <img src={logo} alt="" width={48} height={48} className="mx-auto" />
          <h1 className="mt-3 text-[21px] font-black">
            Chào <span className="text-gradient-gold">{profile?.display_name ?? "bạn"}</span>
          </h1>
          <p className="mx-auto mt-2 max-w-[17rem] text-[14px] leading-relaxed text-muted-foreground">
            Cho Phong biết tên Zalo của bạn trước khi bắt đầu nhé.
          </p>
        </div>

        <div className="mt-5 space-y-4">
          <div>
            <Label htmlFor="zalo-name" className="text-[13px] font-medium">
              Tên Zalo của bạn
            </Label>
            <Input
              id="zalo-name"
              value={zaloName}
              onChange={(e) => setZaloName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !saving && confirm()}
              placeholder="Đúng tên hiển thị trên Zalo"
              maxLength={60}
              autoFocus
              className="mt-1.5 bg-background/60"
            />
          </div>

          <Button
            onClick={confirm}
            disabled={saving}
            size="lg"
            className="w-full bg-gradient-gold text-gold-foreground hover:opacity-90"
          >
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Đang vào...
              </>
            ) : (
              <>
                Xác nhận <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
