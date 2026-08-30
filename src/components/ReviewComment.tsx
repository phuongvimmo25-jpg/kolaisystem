import { Clock3, Loader2, AlertTriangle } from "lucide-react";
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
          <span className="text-[13px] font-bold text-gold">{reviewer.name}</span>
          <span className="rounded-full bg-gold/15 px-1.5 py-px text-[10px] font-bold uppercase tracking-wider text-gold/80">
            {fromAdmin ? "Đánh giá của Admin" : ROLE_LABEL}
          </span>
          {score !== null && (
            <span className="ml-auto text-sm font-black text-gold">{score}/10</span>
          )}
        </div>
        <p className="mt-1 text-[14px] leading-relaxed text-foreground/90">{feedback}</p>
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
    <div className="mt-3 flex items-center gap-2.5 rounded-xl border border-border/60 bg-background/40 p-3">
      <Avatar reviewer={reviewer} />
      <div className="min-w-0 flex-1">
        <div className="text-[13px] font-bold text-muted-foreground">{reviewer.name}</div>
        <p className="mt-0.5 inline-flex items-center gap-1.5 text-[13px] text-muted-foreground">
          <Clock3 className="h-3.5 w-3.5" />
          {minutesLeft > 0
            ? `Sẽ phản hồi sau khoảng ${minutesLeft} phút nữa`
            : "Đang xem bài của bạn..."}
        </p>
      </div>
    </div>
  );
}

/** Đang gọi AI chấm. */
export function ReviewLoading({ reviewer = DEFAULT_REVIEWER }: { reviewer?: ReviewerInfo }) {
  return (
    <div className="mt-3 flex items-center gap-2.5 rounded-xl border border-border/60 bg-background/40 p-3">
      <Avatar reviewer={reviewer} />
      <div className="min-w-0 flex-1">
        <div className="text-[13px] font-bold text-muted-foreground">{reviewer.name}</div>
        <p className="mt-0.5 inline-flex items-center gap-1.5 text-[13px] text-muted-foreground">
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          Đang đọc bài của bạn...
        </p>
      </div>
    </div>
  );
}

/** Không đọc được tài liệu. */
export function ReviewError({ message }: { message: string }) {
  return (
    <div className="mt-3 flex gap-2.5 rounded-xl border border-red-500/30 bg-red-500/[0.06] p-3">
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
      <div className="min-w-0 flex-1">
        <div className="text-[13px] font-bold text-red-300">Chưa chấm được bài này</div>
        <p className="mt-0.5 text-[13px] leading-relaxed text-red-200/80">{message}</p>
      </div>
    </div>
  );
}
