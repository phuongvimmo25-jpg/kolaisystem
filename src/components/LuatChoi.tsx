import { useState } from "react";
import { ChevronDown, ScrollText } from "lucide-react";

/** Chỉ giữ những luật anh em hay hiểu nhầm. Còn lại app đã báo tại chỗ rồi. */
const LUAT: { hoi: string; dap: string }[] = [
  {
    hoi: "Mỗi ngày nộp mấy bài?",
    dap: "Đúng một bài, dù ngày đó có bao nhiêu video.",
  },
  {
    hoi: "Nộp dồn hai ngày trong cùng một hôm?",
    dap: "Vẫn chỉ một khiên. Khiên đếm theo số ngày có nộp bài, không phải số bài. Điểm thì vẫn cộng đủ.",
  },
  {
    hoi: "Bao giờ có khiên, bao giờ có điểm?",
    dap: "Nộp xong là có khiên ngay. Năm phút sau Phong chấm điểm, thang 7 đến 10.",
  },
  {
    hoi: "Chấm rồi có sửa được không?",
    dap: "Điểm đã chấm là chốt. Link bài thì sửa thoải mái, không mất khiên.",
  },
  {
    hoi: "Khi nào mở ngày tiếp theo?",
    dap: "Nộp xong ngày trước, xem hết video của ngày mới, và phải tới ngày mở.",
  },
];

/** Bảng luật — thu gọn sẵn, ai cần thì bấm mở. */
export function LuatChoi() {
  const [mo, setMo] = useState(false);

  return (
    <section className="rounded-2xl border border-border/70 bg-card/40">
      <button
        onClick={() => setMo((v) => !v)}
        aria-expanded={mo}
        className="flex w-full items-center gap-2.5 px-3.5 py-3 text-left"
      >
        <ScrollText className="h-4 w-4 shrink-0 text-gold" />
        <span className="min-w-0 flex-1 text-[14px] font-bold text-foreground">
          Luật tính khiên và điểm
        </span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform ${mo ? "rotate-180" : ""}`}
        />
      </button>

      {mo && (
        <div className="space-y-2 border-t border-border/60 px-3.5 py-3">
          {LUAT.map((l) => (
            <div key={l.hoi}>
              <div className="text-[14px] font-bold text-foreground">{l.hoi}</div>
              <p className="mt-0.5 text-[14px] leading-relaxed text-muted-foreground">{l.dap}</p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
