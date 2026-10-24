import { useEffect } from "react";
import { Sparkles } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { LuatChoi } from "@/components/LuatChoi";
import { TIN_MOI, danhDauDaXem, AnhMinhHoa } from "@/components/CoGiMoi";

/** Tab "Có gì mới" — mọi thay đổi của hệ thống, tin mới nhất nằm trên cùng. */
export function NewsPage() {
  // Vào tận nơi đọc rồi thì khung nhắc ở trang chủ không cần hiện nữa
  useEffect(() => {
    danhDauDaXem();
  }, []);

  return (
    <div className="mx-auto max-w-[860px] space-y-5">
      <PageHeader
        eyebrow="Cập nhật"
        title="Có gì"
        accent="mới"
        description="Mọi thay đổi của hệ thống đều được ghi lại ở đây, mới nhất nằm trên cùng."
      />

      <div className="space-y-3">
        {TIN_MOI.map((t) => (
          <article
            key={t.key}
            className="rounded-2xl border border-border/70 bg-card/50 p-4 transition-colors hover:border-gold/30"
          >
            <div className="flex items-center gap-2">
              <span className="shrink-0 rounded-md bg-gold/15 px-2 py-0.5 text-[12px] font-black tabular-nums text-gold">
                {t.ngay}
              </span>
              <h2 className="min-w-0 flex-1 text-[16px] font-bold text-foreground">{t.tieuDe}</h2>
            </div>
            <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">{t.noiDung}</p>
            {t.anh && <AnhMinhHoa anh={t.anh} chuThich={t.chuThichAnh} khoanh={t.khoanh} />}
          </article>
        ))}
      </div>

      {TIN_MOI.length === 0 && (
        <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-border/70 py-12 text-center">
          <Sparkles className="h-6 w-6 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Chưa có tin nào.</p>
        </div>
      )}

      <LuatChoi />
    </div>
  );
}
