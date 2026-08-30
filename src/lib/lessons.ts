/**
 * Nội dung khoá học — tổ chức theo NGÀY.
 *
 * Mỗi NGÀY có nhiều video bài giảng nhưng CHỈ MỘT bài tập nộp.
 *
 * THÊM VIDEO: sửa `youtubeId` thành mã video YouTube — đoạn sau "v=" trong link.
 *   https://www.youtube.com/watch?v=dQw4w9WgXcQ  ->  youtubeId: "dQw4w9WgXcQ"
 * Để trống ("") thì video đó hiện nhãn "Sắp ra mắt".
 */

export interface Lesson {
  /** Khoá định danh — ĐỪNG đổi sau khi khoá học chạy. */
  key: string;
  /** Số hiệu hiển thị, ví dụ "1.1". */
  code: string;
  title: string;
  description: string;
  /** Mã video YouTube. Để trống nếu chưa có. */
  youtubeId: string;
  /** Thời lượng, để trống nếu chưa biết. */
  duration?: string;
}

export interface Day {
  /** Khoá bài nộp — ĐỪNG đổi sau khi học viên đã nộp, sẽ mất liên kết. */
  key: string;
  /** Ngày thứ mấy của khoá. */
  day: number;
  title: string;
  subtitle: string;
  /** Các video của ngày này. */
  lessons: Lesson[];
  /** Mục tiêu của bài tập ngày này. */
  assignment: string;
  /** Danh sách cụ thể phải có trong bản Google Docs nộp lên. */
  deliverables: string[];
}

export const COURSE_OVERVIEW = {
  title: "Hệ thống huấn luyện cấp tốc của những chiến thần",
  intro:
    "Chương trình huấn luyện dành cho KOL và Affiliate Việt Nam. Mỗi ngày mở một buổi học, xem hết video rồi nộp một bài tập qua Google Docs. Mỗi bài nộp được ghi nhận bằng một huy hiệu khiên vàng trên bảng Vinh danh.",
  steps: [
    {
      title: "Xem bài giảng",
      description: "Mỗi ngày mở một buổi. Xem hết video rồi bấm “Hoàn thành” để hệ thống ghi nhận.",
    },
    {
      title: "Làm bài tập",
      description:
        "Mỗi ngày một bài tập. Làm trên Google Docs, nhớ mở quyền xem cho người có link.",
    },
    {
      title: "Nộp link",
      description:
        "Dán link Google Docs vào tab Nộp bài tập. Nộp rồi vẫn sửa link được bất cứ lúc nào.",
    },
    {
      title: "Nhận huy hiệu",
      description: "Mỗi bài nộp = 1 khiên vàng cạnh tên bạn ở bảng Vinh danh.",
    },
  ],
  scoring: [
    { label: "Nộp bài tập của một ngày", points: 10 },
    { label: "Xem xong 1 video", points: 5 },
  ],
};

/** Video giới thiệu ở Trang chủ — xem trước khi vào học. */
export const COURSE_INTRO = {
  youtubeId: "XAcAxlUrEHU",
  eyebrow: "Bắt đầu từ đây",
  title: "Tổng quan hành trình",
  description:
    "Dành 10 phút xem video này trước. Bạn sẽ hiểu toàn bộ lộ trình, cách hệ thống chấm điểm, và điều gì đang chờ ở cuối chặng đường.",
};

export const DAYS: Day[] = [
  {
    key: "ngay-1",
    day: 1,
    title: "Ngày 1 — Nền tảng công cụ AI",
    subtitle: "Hiểu bộ công cụ trước khi bắt tay làm: Skill, MCP, Sub-Agent, ChatGPT và Codex.",
    lessons: [
      {
        key: "p1-b1",
        code: "1.1",
        title: "Hiểu tổng quan về Skill · MCP · Sub-Agent",
        description:
          "Ba khái niệm nền tảng của hệ thống AI hiện đại: Skill là gì, MCP kết nối những gì, và Sub-Agent hoạt động ra sao.",
        youtubeId: "jYKzQePWbO8",
      },
      {
        key: "p1-b2",
        code: "1.2",
        title: "Hiểu tất tần tật về ChatGPT · Work · Codex",
        description:
          "Phân biệt ChatGPT, chế độ Work và Codex — cái nào dùng khi nào, mạnh yếu ở đâu.",
        youtubeId: "tCrqO_1YXTU",
        duration: "16 phút",
      },
      {
        key: "p1-b3",
        code: "1.3",
        title: "Setup cài đặt ChatGPT Codex — Cách dùng không tốn token",
        description:
          "Đăng ký tài khoản ChatGPT Plus, cài app Codex về máy, và cách dùng sao cho không đốt token.",
        youtubeId: "Is-Z7yFm6qc",
      },
    ],
    assignment: "Nắm được Skill, cài xong Codex và dùng thành thạo giao diện.",
    deliverables: [
      "Hiểu được Skill là gì và nó hoạt động như thế nào với AI Agent",
      "Tải được ChatGPT Codex về máy",
      "Làm quen được toàn bộ giao diện từ web tới app và có thể thao tác như một chuyên gia",
    ],
  },
];

/** Tất cả video của mọi ngày, gộp phẳng. */
export const ALL_LESSONS: Lesson[] = DAYS.flatMap((d) => d.lessons);

export function findLesson(key: string): Lesson | undefined {
  return ALL_LESSONS.find((l) => l.key === key);
}

export function findDay(key: string): Day | undefined {
  return DAYS.find((d) => d.key === key);
}

/** Ngày chứa video này. */
export function dayOfLesson(lessonKey: string): Day | undefined {
  return DAYS.find((d) => d.lessons.some((l) => l.key === lessonKey));
}

export const POINTS_PER_SUBMISSION = 10;
export const POINTS_PER_VIDEO = 5;

// ─────────────────────────────────────────────────────────────
// LỊCH MỞ KHOÁ & HẠN NỘP
// ─────────────────────────────────────────────────────────────

/**
 * Ngày khai giảng — MỐC GỐC cho cả lịch mở khoá lẫn hạn nộp.
 * Định dạng YYYY-MM-DD, theo giờ Việt Nam. ĐỔI KHI MỞ LỚP MỚI.
 */
export const COURSE_START_DATE = "2026-08-30";

/** Nhãn hiển thị: "Ngày 1", "Ngày 2"... */
export function dayLabel(day: number): string {
  return "Ngày " + day;
}

/** Mốc mở khoá của một ngày — 00:00 giờ Việt Nam. */
export function getDayOpenDate(day: number): Date {
  const [y, m, d] = COURSE_START_DATE.split("-").map(Number);
  // 00:00 giờ VN (UTC+7) = 17:00 UTC ngày hôm trước
  return new Date(Date.UTC(y, m - 1, d + (day - 1) - 1, 17, 0, 0));
}

/** Hạn nộp bài của một ngày — 23:59:59 giờ Việt Nam của chính ngày đó. */
export function getDayDeadline(day: number): Date {
  const [y, m, d] = COURSE_START_DATE.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d + (day - 1), 16, 59, 59));
}

/** Ngày này đã tới lịch mở chưa. */
export function isDayOpen(day: number, now: Date = new Date()): boolean {
  return now.getTime() >= getDayOpenDate(day).getTime();
}

/** Ngày mở dạng dd/mm để hiện cho học viên. */
export function formatOpenDate(day: number): string {
  return getDayOpenDate(day).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    timeZone: "Asia/Ho_Chi_Minh",
  });
}

/** Lý do một ngày chưa mở được. */
export type LockReason =
  | { locked: false }
  | { locked: true; kind: "date"; openDate: string }
  | { locked: true; kind: "prev"; needDay: number };

/**
 * Ngày này đã mở cho học viên chưa.
 * Phải thoả CẢ HAI: đã tới lịch, VÀ đã nộp bài của mọi ngày trước đó.
 */
export function dayLockState(
  day: number,
  submittedKeys: Set<string>,
  now: Date = new Date(),
): LockReason {
  if (!isDayOpen(day, now)) {
    return { locked: true, kind: "date", openDate: formatOpenDate(day) };
  }
  // Ngày trước chưa nộp thì chưa được học tiếp
  for (const d of DAYS) {
    if (d.day < day && !submittedKeys.has(d.key)) {
      return { locked: true, kind: "prev", needDay: d.day };
    }
  }
  return { locked: false };
}

export interface DeadlineInfo {
  day: Day;
  deadline: Date;
  overdue: boolean;
}

/** Tất cả ngày kèm hạn nộp, theo thứ tự. */
export function allDeadlines(now: Date = new Date()): DeadlineInfo[] {
  return DAYS.map((day) => {
    const deadline = getDayDeadline(day.day);
    return { day, deadline, overdue: now.getTime() > deadline.getTime() };
  });
}

/** Ngày đang tới hạn: ngày gần nhất chưa quá hạn. Hết hạn tất cả thì null. */
export function currentDeadline(now: Date = new Date()): DeadlineInfo | null {
  return allDeadlines(now).find((d) => !d.overdue) ?? null;
}
