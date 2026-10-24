import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

export type Giao = "dark" | "light";
const KHOA = "kol-giao-dien";

/** Đọc lựa chọn đã lưu; chưa chọn bao giờ thì theo cài đặt của máy. */
export function giaoDaLuu(): Giao {
  try {
    const v = localStorage.getItem(KHOA);
    if (v === "light" || v === "dark") return v;
  } catch {
    /* trình duyệt chặn đọc — dùng mặc định */
  }
  try {
    if (window.matchMedia("(prefers-color-scheme: light)").matches) return "light";
  } catch {
    /* không hỏi được hệ điều hành */
  }
  return "dark";
}

function apDung(g: Giao) {
  document.documentElement.setAttribute("data-theme", g);
}

/** Nút chuyển giao diện sáng ↔ tối, nhớ lựa chọn cho lần sau. */
export function ThemeToggle() {
  const [giao, setGiao] = useState<Giao>("dark");

  useEffect(() => {
    const g = giaoDaLuu();
    setGiao(g);
    apDung(g);
  }, []);

  const doi = () => {
    const g: Giao = giao === "dark" ? "light" : "dark";
    setGiao(g);
    apDung(g);
    try {
      localStorage.setItem(KHOA, g);
    } catch {
      /* không lưu được thì vẫn đổi trong phiên này */
    }
  };

  return (
    <button
      onClick={doi}
      title={giao === "dark" ? "Chuyển sang giao diện sáng" : "Chuyển sang giao diện tối"}
      aria-label={giao === "dark" ? "Chuyển sang giao diện sáng" : "Chuyển sang giao diện tối"}
      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border bg-card/60 text-muted-foreground transition hover:border-gold/40 hover:text-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
    >
      {giao === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  );
}
