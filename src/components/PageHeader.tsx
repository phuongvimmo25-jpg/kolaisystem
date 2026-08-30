import type { ReactNode } from "react";

/**
 * Tiêu đề trang dùng chung — giữ ba trang cùng một nhịp thị giác.
 *
 *   NHÃN NHỎ
 *   Tiêu đề lớn
 *   ▬▬            ← gạch gradient
 *   Mô tả một dòng
 */
export function PageHeader({
  eyebrow,
  title,
  accent,
  description,
  action,
}: {
  eyebrow?: string;
  /** Phần chữ thường của tiêu đề. */
  title: string;
  /** Phần được tô gradient, đặt sau `title`. */
  accent?: string;
  description?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <header className="mb-5 flex flex-wrap items-start justify-between gap-3">
      <div className="min-w-0">
        {eyebrow && <div className="eyebrow">{eyebrow}</div>}

        <h1 className="mt-1.5 text-[22px] font-black md:text-[28px]">
          <span className="text-foreground">{title}</span>
          {accent && <span className="text-gradient-primary"> {accent}</span>}
        </h1>

        <div className="title-rule mt-2.5" />

        {description && (
          <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-muted-foreground">
            {description}
          </p>
        )}
      </div>

      {action && <div className="shrink-0">{action}</div>}
    </header>
  );
}
