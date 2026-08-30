import { useState, type ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { GraduationCap, FileText, Trophy, LogOut, ShieldCheck, Pencil } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { CountdownBar } from "@/components/CountdownBar";
import logo from "@/assets/logo.png";

const NAV = [
  { to: "/", label: "Bài giảng", icon: GraduationCap },
  { to: "/bai-tap", label: "Nộp bài tập", icon: FileText },
  { to: "/vinh-danh", label: "Vinh danh", icon: Trophy },
] as const;

/** Hộp thoại đổi tên hiển thị — dùng chung cho cả sidebar và thanh mobile. */
function RenameDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const { user } = useAuth();
  const { profile, refetch } = useProfile();
  const [name, setName] = useState(profile?.display_name ?? "");
  const [saving, setSaving] = useState(false);

  // Mở lại thì nạp tên hiện tại
  const handleOpenChange = (v: boolean) => {
    if (v) setName(profile?.display_name ?? "");
    onOpenChange(v);
  };

  const saveName = async () => {
    const trimmed = name.trim();
    if (!trimmed) {
      toast.error("Tên không được để trống");
      return;
    }
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({ display_name: trimmed })
      .eq("id", user.id);
    setSaving(false);
    if (error) {
      toast.error("Không đổi được tên", { description: error.message });
      return;
    }
    toast.success("Đã đổi tên hiển thị");
    onOpenChange(false);
    refetch();
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Đổi tên hiển thị</DialogTitle>
          <DialogDescription>
            Tên này hiện trên bảng Vinh danh cho mọi học viên cùng thấy.
          </DialogDescription>
        </DialogHeader>
        <div>
          <Label htmlFor="display-name" className="text-xs">
            Tên hiển thị
          </Label>
          <Input
            id="display-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={40}
            className="mt-1 bg-background/50"
            onKeyDown={(e) => e.key === "Enter" && saveName()}
          />
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Huỷ
          </Button>
          <Button onClick={saveName} disabled={saving} className="bg-gradient-primary hover:opacity-90">
            {saving ? "Đang lưu..." : "Lưu"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/** Menu bấm vào ảnh đại diện — thay cho trang Hồ sơ cũ. */
function AvatarMenu({ size = "md", onRename }: { size?: "sm" | "md"; onRename: () => void }) {
  const { user, signOut } = useAuth();
  const { profile } = useProfile();
  const cls = size === "sm" ? "h-8 w-8" : "h-9 w-9";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-primary">
          <Avatar className={`${cls} ring-2 ring-primary/30 transition hover:ring-primary/60`}>
            <AvatarImage src={profile?.avatar_url ?? undefined} className="object-cover" />
            <AvatarFallback className="bg-primary/20 text-xs font-bold text-primary">
              {profile?.display_name?.slice(0, 2).toUpperCase() ?? "KO"}
            </AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-60">
        <DropdownMenuLabel className="font-normal">
          <div className="truncate text-sm font-bold">{profile?.display_name ?? "..."}</div>
          <div className="truncate text-xs text-muted-foreground">{user?.email}</div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <div className="flex items-center justify-between px-2 py-1.5 text-xs">
          <span className="inline-flex items-center gap-1.5 text-muted-foreground">
            <ShieldCheck className="h-3.5 w-3.5 text-gold" />
            {profile?.submission_count ?? 0} khiên
          </span>
          <span className="font-bold text-gold">{profile?.total_points ?? 0} điểm</span>
        </div>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onSelect={(e) => {
            e.preventDefault();
            onRename();
          }}
        >
          <Pencil className="mr-2 h-3.5 w-3.5" /> Đổi tên hiển thị
        </DropdownMenuItem>

        <DropdownMenuItem onSelect={() => signOut()} className="text-destructive focus:text-destructive">
          <LogOut className="mr-2 h-3.5 w-3.5" /> Đăng xuất
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function AppLayout({ children }: { children: ReactNode }) {
  const { signOut } = useAuth();
  const { profile } = useProfile();
  const path = useRouterState({ select: (s) => s.location.pathname });
  const [renameOpen, setRenameOpen] = useState(false);

  const isActive = (to: string) => (to === "/" ? path === "/" : path.startsWith(to));

  return (
    <div className="flex min-h-screen">
      {/* ── Sidebar (máy tính) ─────────────────────────────── */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-border bg-sidebar/80 backdrop-blur-xl md:flex">
        <div className="flex items-center gap-3 px-6 py-6">
          <img
            src={logo}
            alt="KOL AI SYSTEM"
            width={36}
            height={36}
            className="drop-shadow-[0_0_12px_oklch(0.6_0.24_295/0.6)]"
          />
          <div>
            <div className="text-sm font-bold leading-tight tracking-tight">KOL AI</div>
            <div className="text-sm font-bold leading-tight tracking-tight text-gradient-primary">
              SYSTEM
            </div>
          </div>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                isActive(item.to)
                  ? "bg-gradient-primary text-primary-foreground shadow-[0_4px_20px_-4px_oklch(0.55_0.24_295/0.6)]"
                  : "text-muted-foreground hover:bg-sidebar-accent hover:text-foreground"
              }`}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="border-t border-border p-4">
          <button
            onClick={() => setRenameOpen(true)}
            className="-mx-2 mb-3 flex w-[calc(100%+1rem)] items-center gap-3 rounded-lg px-2 py-2 text-left transition hover:bg-sidebar-accent/50"
          >
            <Avatar className="h-9 w-9 ring-2 ring-primary/30">
              <AvatarImage src={profile?.avatar_url ?? undefined} className="object-cover" />
              <AvatarFallback className="bg-primary/20 text-xs font-bold text-primary">
                {profile?.display_name?.slice(0, 2).toUpperCase() ?? "KO"}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-semibold">{profile?.display_name ?? "..."}</div>
              <div className="flex items-center gap-1 truncate text-xs text-muted-foreground">
                <ShieldCheck className="h-3 w-3 text-gold" />
                {profile?.submission_count ?? 0} khiên · {profile?.total_points ?? 0} điểm
              </div>
            </div>
          </button>
          <button
            onClick={() => signOut()}
            className="flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive"
          >
            <LogOut className="h-3.5 w-3.5" /> Đăng xuất
          </button>
        </div>
      </aside>

      {/* ── Nội dung ───────────────────────────────────────── */}
      <main className="flex-1 pb-20 md:ml-64 md:pb-0">
        {/* Thanh trên cho điện thoại */}
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-border bg-background/80 px-4 py-3 backdrop-blur-xl md:hidden">
          <div className="flex items-center gap-2">
            <img src={logo} alt="" width={28} height={28} />
            <span className="text-sm font-bold text-gradient-primary">KOL AI SYSTEM</span>
          </div>
          <AvatarMenu size="sm" onRename={() => setRenameOpen(true)} />
        </header>

        {/* Đồng hồ đếm ngược — viên nhỏ, giữa màn hình */}
        <div className="pt-3">
          <CountdownBar />
        </div>

        <div className="mx-auto max-w-6xl px-4 py-5 md:px-8">{children}</div>
      </main>

      {/* ── Thanh dưới (điện thoại) ────────────────────────── */}
      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-sidebar/95 backdrop-blur-xl md:hidden">
        <div className="grid grid-cols-3">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={`flex flex-col items-center justify-center gap-1 py-2.5 text-[10px] font-medium transition ${
                isActive(item.to) ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <item.icon
                className={`h-5 w-5 ${
                  isActive(item.to) ? "drop-shadow-[0_0_6px_oklch(0.6_0.24_295/0.8)]" : ""
                }`}
              />
              {item.label}
            </Link>
          ))}
        </div>
      </nav>

      <RenameDialog open={renameOpen} onOpenChange={setRenameOpen} />
    </div>
  );
}
