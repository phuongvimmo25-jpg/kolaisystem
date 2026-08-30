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

/** Menu người dùng — thay cho trang Hồ sơ cũ, giữ thanh điều hướng đúng 3 mục. */
function UserMenu() {
  const { user, signOut } = useAuth();
  const { profile, refetch } = useProfile();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);

  const initials = profile?.display_name?.slice(0, 2).toUpperCase() ?? "KO";

  const openRename = () => {
    setName(profile?.display_name ?? "");
    setOpen(true);
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
    setOpen(false);
    refetch();
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="rounded-full outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-primary">
            <Avatar className="h-9 w-9 ring-2 ring-primary/30 transition hover:ring-primary/60">
              <AvatarImage src={profile?.avatar_url ?? undefined} className="object-cover" />
              <AvatarFallback className="bg-primary/20 text-xs font-bold text-primary">
                {initials}
              </AvatarFallback>
            </Avatar>
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-64">
          <DropdownMenuLabel className="font-normal">
            <div className="truncate text-sm font-bold">{profile?.display_name ?? "..."}</div>
            <div className="truncate text-xs text-muted-foreground">{user?.email}</div>
          </DropdownMenuLabel>

          <DropdownMenuSeparator />

          <div className="flex items-center justify-between px-2 py-1.5 text-xs">
            <span className="inline-flex items-center gap-1.5 text-muted-foreground">
              <ShieldCheck className="h-3.5 w-3.5 text-amber-400" />
              {profile?.submission_count ?? 0} khiên vàng
            </span>
            <span className="font-bold text-amber-400">{profile?.total_points ?? 0} điểm</span>
          </div>

          <DropdownMenuSeparator />

          <DropdownMenuItem onSelect={(e) => { e.preventDefault(); openRename(); }}>
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

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Đổi tên hiển thị</DialogTitle>
            <DialogDescription>
              Tên này hiện trên bảng Vinh danh cho mọi học viên cùng thấy.
            </DialogDescription>
          </DialogHeader>
          <div>
            <Label htmlFor="display-name" className="text-xs">Tên hiển thị</Label>
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
            <Button variant="ghost" onClick={() => setOpen(false)}>Huỷ</Button>
            <Button onClick={saveName} disabled={saving} className="bg-gradient-primary hover:opacity-90">
              {saving ? "Đang lưu..." : "Lưu"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export function AppLayout({ children }: { children: ReactNode }) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const isActive = (to: string) => (to === "/" ? path === "/" : path.startsWith(to));

  return (
    <div className="flex min-h-screen flex-col">
      {/* Thanh trên — logo, 3 tab (desktop), avatar */}
      <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 md:px-8">
          <Link to="/" className="flex shrink-0 items-center gap-2.5">
            <img
              src={logo}
              alt="KOL AI SYSTEM"
              width={32}
              height={32}
              className="drop-shadow-[0_0_12px_oklch(0.6_0.24_295/0.6)]"
            />
            <span className="text-sm font-black leading-tight tracking-tight">
              <span className="text-foreground">KOL AI </span>
              <span className="text-gradient-primary">SYSTEM</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-medium transition-all duration-200 ${
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

          <UserMenu />
        </div>
      </header>

      {/* Đồng hồ đếm ngược hạn nộp — luôn hiện, bám dưới thanh trên */}
      <CountdownBar />

      <main className="flex-1 pb-24 md:pb-8">
        <div className="mx-auto max-w-6xl px-4 py-6 md:px-8">{children}</div>
      </main>

      {/* Thanh dưới cho điện thoại */}
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
    </div>
  );
}
