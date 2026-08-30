import { useState, type ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { Home, GraduationCap, FileText, Trophy, LogOut, ShieldCheck, Pencil } from "lucide-react";
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
  { to: "/", label: "Trang chủ", icon: Home },
  { to: "/bai-giang", label: "Bài giảng", icon: GraduationCap },
  { to: "/bai-tap", label: "Nộp bài", icon: FileText },
  { to: "/vinh-danh", label: "Vinh danh", icon: Trophy },
] as const;

function RenameDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const { user } = useAuth();
  const { profile, refetch } = useProfile();
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);

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
          <Button
            onClick={saveName}
            disabled={saving}
            className="bg-gradient-primary hover:opacity-90"
          >
            {saving ? "Đang lưu..." : "Lưu"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function AvatarMenu({ onRename }: { onRename: () => void }) {
  const { user, signOut } = useAuth();
  const { profile } = useProfile();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="shrink-0 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-primary">
          <Avatar className="h-8 w-8 ring-2 ring-primary/30 transition hover:ring-primary/60">
            <AvatarImage src={profile?.avatar_url ?? undefined} className="object-cover" />
            <AvatarFallback className="bg-primary/20 text-[10px] font-bold text-primary">
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
        <DropdownMenuItem
          onSelect={() => signOut()}
          className="text-destructive focus:text-destructive"
        >
          <LogOut className="mr-2 h-3.5 w-3.5" /> Đăng xuất
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function AppLayout({ children }: { children: ReactNode }) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const [renameOpen, setRenameOpen] = useState(false);
  const isActive = (to: string) => (to === "/" ? path === "/" : path.startsWith(to));

  return (
    <div className="flex min-h-screen flex-col">
      {/* ── Thanh trên: logo · 3 tab dạng segmented · đồng hồ · avatar ── */}
      <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-[1400px] items-center gap-2 px-4 md:gap-3 md:px-6">
          <Link to="/" className="flex shrink-0 items-center gap-2">
            <img
              src={logo}
              alt="KOL AI SYSTEM"
              width={28}
              height={28}
              className="drop-shadow-[0_0_10px_oklch(0.6_0.24_295/0.55)]"
            />
            <span className="hidden text-[13px] font-black leading-none tracking-tight sm:inline">
              <span className="text-foreground">KOL AI </span>
              <span className="text-gradient-primary">SYSTEM</span>
            </span>
          </Link>

          {/* Segmented control — gọn, nổi bật mục đang mở */}
          <nav className="hidden flex-1 justify-center md:flex">
            <div className="inline-flex items-center gap-0.5 rounded-full border border-border/70 bg-card/50 p-1">
              {NAV.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[13px] font-semibold transition-all duration-200 ${
                    isActive(item.to)
                      ? "bg-gradient-primary text-primary-foreground shadow-[0_2px_12px_-2px_oklch(0.55_0.24_295/0.75)]"
                      : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-foreground"
                  }`}
                >
                  <item.icon className="h-3.5 w-3.5" />
                  {item.label}
                </Link>
              ))}
            </div>
          </nav>

          <div className="ml-auto flex min-w-0 items-center gap-2 md:gap-3">
            <CountdownBar />
            <AvatarMenu onRename={() => setRenameOpen(true)} />
          </div>
        </div>
      </header>

      <main className="flex-1 pb-20 md:pb-8">
        <div className="mx-auto max-w-[1400px] px-4 py-5 md:px-6 md:py-6">{children}</div>
      </main>

      {/* Thanh dưới cho điện thoại */}
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-sidebar/95 backdrop-blur-xl md:hidden">
        <div className="grid grid-cols-4 pb-[env(safe-area-inset-bottom)]">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={`flex flex-col items-center justify-center gap-1 py-3 text-[11px] font-semibold transition ${
                isActive(item.to) ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <item.icon
                className={`h-5 w-5 ${isActive(item.to) ? "drop-shadow-[0_0_6px_oklch(0.6_0.24_295/0.8)]" : ""}`}
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
