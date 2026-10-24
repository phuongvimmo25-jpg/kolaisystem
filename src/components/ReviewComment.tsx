import { Clock3, Loader2, AlertTriangle, ShieldCheck, BadgeCheck } from "lucide-react";
import fallbackPhoto from "@/assets/logo.png";

export interface ReviewerInfo {
  name: string;
  avatarUrl: string | null;
}

const DEFAULT_REVIEWER: ReviewerInfo = { name: "Phong Menly", avatarUrl: null };
const ROLE_LABEL = "Người hướng dẫn";

/** Ảnh đại diện người chấm — lấy từ tài khoản Google của Admin. */
function Avatar({ reviewer }: { reviewer: ReviewerInfo }) {
  return (
    <img
      src={reviewer.avatarUrl ?? fallbackPhoto}
      alt={reviewer.name}
      referrerPolicy="no-referrer"
      className="h-9 w-9 shrink-0 rounded-full object-cover ring-2 ring-gold/45"
      loading="lazy"
    />
  );
}

/** Khung nhận xét — trông như một comment của Phong dưới bài nộp. */
export function ReviewComment({
  score,
  feedback,
  fromAdmin,
  reviewer = DEFAULT_REVIEWER,
}: {
  score: number | null;
  feedback: string;
  fromAdmin?: boolean;
  reviewer?: ReviewerInfo;
}) {
  return (
    <div className="mt-3 flex gap-2.5 rounded-xl border border-gold/25 bg-gold/[0.05] p-3">
      <Avatar reviewer={reviewer} />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="text-[14px] font-bold text-gold">{reviewer.name}</span>
          <span className="rounded-full bg-gold/15 px-1.5 py-px text-[12px] font-bold uppercase tracking-wider text-gold/80">
            {fromAdmin ? "Đánh giá của Admin" : ROLE_LABEL}
          </span>
          {score !== null && (
            <span className="ml-auto text-sm font-black text-gold">{score}/10</span>
          )}
        </div>
        <p className="mt-1 text-[15px] leading-relaxed text-foreground">{feedback}</p>
        {!fromAdmin && (
          <p className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2.5 py-1 text-[12px] font-bold text-emerald-700 dark:text-emerald-300">
            <BadgeCheck className="h-3.5 w-3.5" /> Bài nộp hợp lệ · đã tính 1 khiên vàng
          </p>
        )}
        {!fromAdmin && score !== null && (
          <p className="mt-1.5 text-[12px] leading-relaxed text-muted-foreground">
            Điểm đã chốt — Phong chấm một lần duy nhất để công tâm với tất cả anh em.
          </p>
        )}
      </div>
    </div>
  );
}

/** Đang chờ tới lượt chấm. */
export function ReviewPending({
  minutesLeft,
  reviewer = DEFAULT_REVIEWER,
}: {
  minutesLeft: number;
  reviewer?: ReviewerInfo;
}) {
  return (
    <div className="mt-3 flex items-start gap-2.5 rounded-xl border border-emerald-500/25 bg-emerald-500/[0.05] px-3 py-2.5">
      <Avatar reviewer={reviewer} />
      <div className="min-w-0 flex-1">
        <p className="inline-flex items-center gap-1.5 text-[14px] font-semibold text-emerald-700 dark:text-emerald-300">
          <BadgeCheck className="h-4 w-4 shrink-0" /> Đã nhận bài của bạn
        </p>
        <p className="mt-1 inline-flex items-center gap-1.5 text-[12.5px] text-gold/90">
          <ShieldCheck className="h-3.5 w-3.5 shrink-0" /> Đã tính 1 khiên vàng — bạn không cần làm
          gì thêm
        </p>
        <p className="mt-1 inline-flex items-center gap-1.5 text-[12.5px] text-muted-foreground">
          <Clock3 className="h-3.5 w-3.5 shrink-0" />
          {minutesLeft > 0
            ? `Phong sẽ nhận xét sau khoảng ${minutesLeft} phút nữa`
            : "Phong đang đọc bài của bạn..."}
        </p>
      </div>
    </div>
  );
}

/** Đang gọi AI chấm. */
export function ReviewLoading({ reviewer = DEFAULT_REVIEWER }: { reviewer?: ReviewerInfo }) {
  return (
    <div className="mt-3 flex items-center gap-2.5 rounded-xl border border-border/60 bg-background/40 px-3 py-2.5">
      <Avatar reviewer={reviewer} />
      <p className="inline-flex min-w-0 flex-1 items-center gap-1.5 text-[14px] text-muted-foreground">
        <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin" />
        Đang đọc bài của bạn...
      </p>
    </div>
  );
}

/** Không đọc được tài liệu. */
export function ReviewError({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="mt-3 flex gap-2.5 rounded-xl border border-red-500/30 bg-red-500/[0.06] p-3">
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-600 dark:text-red-400" />
      <div className="min-w-0 flex-1">
        <div className="text-[14px] font-bold text-red-700 dark:text-red-300">Phong chưa mở được bài của bạn</div>
        <p className="mt-0.5 text-[14px] leading-relaxed text-red-700 dark:text-red-700 dark:text-red-200">{message}</p>
        <p className="mt-1.5 text-[14px] leading-relaxed text-emerald-700 dark:text-emerald-700 dark:text-emerald-300">
          Bài nộp của bạn <b>vẫn được giữ nguyên</b> và đã được tính khiên. Mở tài liệu, đặt quyền
          <b>“Bất kỳ ai có đường liên kết”</b> rồi bấm nút dưới — Phong sẽ chấm lại ngay, bạn không
          phải nộp lại.
        </p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="mt-2 rounded-lg border border-red-400/40 bg-red-500/10 px-2.5 py-1 text-[13px] font-bold text-red-700 dark:text-red-200 transition hover:bg-red-500/20"
          >
            Đã công khai · Yêu cầu Phong chấm lại
          </button>
        )}
      </div>
    </div>
  );
}

/** Chỗ dành riêng cho đánh giá của Admin — luôn hiện, kể cả khi chưa chấm. */
export function AdminReviewSlot({
  score,
  feedback,
  reviewer = DEFAULT_REVIEWER,
  isAdmin,
  onEdit,
}: {
  score: number | null;
  feedback: string | null;
  reviewer?: ReviewerInfo;
  isAdmin?: boolean;
  onEdit?: () => void;
}) {
  // Đã có đánh giá
  if (feedback) {
    return (
      <div className="mt-2 flex gap-2.5 rounded-xl border border-emerald-500/30 bg-emerald-500/[0.06] p-3">
        <Avatar reviewer={reviewer} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="text-[14px] font-bold text-emerald-700 dark:text-emerald-300">{reviewer.name}</span>
            <span className="rounded-full bg-emerald-500/15 px-1.5 py-px text-[12px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-700 dark:text-emerald-300">
              Chấm trực tiếp
            </span>
            {score !== null && (
              <span className="ml-auto text-sm font-black text-emerald-700 dark:text-emerald-300">{score}/10</span>
            )}
          </div>
          <p className="mt-1 text-[15px] leading-relaxed text-foreground">{feedback}</p>
          {isAdmin && onEdit && (
            <button
              onClick={onEdit}
              className="mt-1.5 text-[13px] text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
            >
              Sửa đánh giá
            </button>
          )}
        </div>
      </div>
    );
  }

  // Chưa có — chừa sẵn chỗ
  return (
    <div className="mt-2 flex items-center gap-2.5 rounded-xl border border-dashed border-border/70 bg-background/30 p-3">
      <Avatar reviewer={reviewer} />
      <p className="min-w-0 flex-1 text-[14px] text-muted-foreground">
        {isAdmin ? "Bạn chưa chấm bài này." : "Đánh giá trực tiếp sẽ có sau."}
      </p>
      {isAdmin && onEdit && (
        <button
          onClick={onEdit}
          className="shrink-0 rounded-lg border border-gold/35 bg-gold/10 px-2.5 py-1 text-[13px] font-bold text-gold transition hover:bg-gold/20"
        >
          Chấm ngay
        </button>
      )}
    </div>
  );
}
