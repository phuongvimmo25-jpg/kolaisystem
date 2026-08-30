/**
 * Nội dung khoá học.
 *
 * ĐỂ THÊM BÀI GIẢNG THẬT: sửa `youtubeId` thành mã video YouTube.
 * Mã video là đoạn sau "v=" trong link, ví dụ:
 *   https://www.youtube.com/watch?v=dQw4w9WgXcQ  ->  youtubeId: "dQw4w9WgXcQ"
 * Để trống ("") thì bài đó hiện nhãn "Sắp ra mắt".
 */

export interface Lesson {
  /** Khoá định danh — ĐỪNG đổi sau khi học viên đã nộp bài, sẽ mất liên kết bài nộp. */
  key: string;
  /** Số hiệu hiển thị, ví dụ "1.1". */
  code: string;
  title: string;
  description: string;
  /** Mã video YouTube. Để trống nếu chưa có. */
  youtubeId: string;
  /** Thời lượng, để trống nếu chưa biết. */
  duration?: string;
  /** Đề bài học viên phải làm và nộp qua Google Docs. */
  assignment: string;
}

export interface Part {
  key: string;
  title: string;
  subtitle: string;
  lessons: Lesson[];
}

export const COURSE_OVERVIEW = {
  title: "Hệ thống huấn luyện cấp tốc của những chiến thần",
  intro:
    "Chương trình huấn luyện dành cho KOL và Affiliate Việt Nam. Bạn xem bài giảng, làm bài tập, nộp qua Google Docs. Mỗi bài nộp được ghi nhận bằng một huy hiệu khiên vàng trên bảng Vinh danh.",
  steps: [
    {
      title: "Xem bài giảng",
      description: "Mở từng bài theo thứ tự. Xem hết video rồi bấm “Đã xem xong” để hệ thống ghi nhận.",
    },
    {
      title: "Làm bài tập",
      description: "Mỗi bài giảng có một đề bài. Làm trên Google Docs, nhớ mở quyền xem cho người có link.",
    },
    {
      title: "Nộp link",
      description: "Dán link Google Docs vào tab Nộp bài tập. Nộp rồi vẫn sửa link được bất cứ lúc nào.",
    },
    {
      title: "Nhận huy hiệu",
      description: "Mỗi bài nộp = 1 khiên vàng cạnh tên bạn ở bảng Vinh danh. Nộp càng nhiều, hạng càng cao.",
    },
  ],
  scoring: [
    { label: "Nộp 1 bài tập", points: 10 },
    { label: "Xem xong 1 video", points: 5 },
  ],
};

export const PARTS: Part[] = [
  {
    key: "phan-1",
    title: "Phần 1 — Nền tảng công cụ AI",
    subtitle: "Hiểu bộ công cụ trước khi bắt tay làm: Skill, MCP, Sub-Agent, ChatGPT và Codex.",
    lessons: [
      {
        key: "p1-b1",
        code: "1.1",
        title: "Hiểu tổng quan về Skill · MCP · Sub-Agent",
        description:
          "Ba khái niệm nền tảng của hệ thống AI hiện đại: Skill là gì, MCP kết nối những gì, và Sub-Agent hoạt động ra sao.",
        youtubeId: "jYKzQePWbO8",
        assignment:
          "Viết lại bằng lời của bạn: Skill, MCP và Sub-Agent là gì, mỗi cái dùng để làm gì. Nêu 1 ví dụ bạn có thể áp dụng vào công việc của mình.",
      },
      {
        key: "p1-b2",
        code: "1.2",
        title: "Hiểu tất tần tật về ChatGPT · Work · Codex",
        description:
          "Phân biệt ChatGPT, chế độ Work và Codex — cái nào dùng khi nào, mạnh yếu ở đâu.",
        youtubeId: "tCrqO_1YXTU",
        duration: "16 phút",
        assignment:
          "Lập bảng so sánh ChatGPT, Work và Codex theo 3 cột: dùng khi nào, điểm mạnh, điểm yếu. Kết luận bạn sẽ dùng cái nào cho công việc chính của mình.",
      },
      {
        key: "p1-b3",
        code: "1.3",
        title: "Hướng dẫn cài ChatGPT · Tạo tài khoản · Tải Codex về máy",
        description:
          "Làm theo từng bước: tạo tài khoản, cài đặt và chạy được Codex trên máy của bạn.",
        youtubeId: "",
        assignment:
          "Chụp màn hình chứng minh bạn đã cài xong và chạy được Codex trên máy. Ghi lại lỗi bạn gặp và cách khắc phục (nếu có).",
      },
    ],
  },
];

/** Tất cả bài học của mọi phần, gộp phẳng thành một mảng. */
export const ALL_LESSONS: Lesson[] = PARTS.flatMap((p) => p.lessons);

export function findLesson(key: string): Lesson | undefined {
  return ALL_LESSONS.find((l) => l.key === key);
}

export const POINTS_PER_SUBMISSION = 10;
export const POINTS_PER_VIDEO = 5;

// ─────────────────────────────────────────────────────────────
// HẠN NỘP BÀI
// ─────────────────────────────────────────────────────────────

/**
 * Ngày khai giảng — MỐC GỐC để tính hạn nộp mọi bài.
 * Định dạng YYYY-MM-DD, theo giờ Việt Nam.
 *
 * ĐỔI NGÀY NÀY khi mở lớp mới. Cả lớp dùng chung một hạn,
 * nên bảng Vinh danh công bằng giữa các học viên.
 */
export const COURSE_START_DATE = "2026-08-30";

/**
 * Mỗi bài cách nhau bao nhiêu ngày. Mặc định 1 bài / ngày:
 * bài 1 hạn hết ngày khai giảng, bài 2 hạn hết ngày hôm sau...
 */
export const DAYS_PER_LESSON = 1;

/** Hạn nộp của bài thứ `index` (tính từ 0) — 23:59:59 giờ Việt Nam. */
export function getLessonDeadline(index: number): Date {
  const [y, m, d] = COURSE_START_DATE.split("-").map(Number);
  // 23:59:59 giờ VN (UTC+7) = 16:59:59 UTC cùng ngày
  const utcMs = Date.UTC(y, m - 1, d + index * DAYS_PER_LESSON, 16, 59, 59);
  return new Date(utcMs);
}

export interface DeadlineInfo {
  lesson: Lesson;
  index: number;
  deadline: Date;
  overdue: boolean;
}

/** Tất cả bài kèm hạn nộp, theo đúng thứ tự trong khoá. */
export function allDeadlines(now: Date = new Date()): DeadlineInfo[] {
  return ALL_LESSONS.map((lesson, index) => {
    const deadline = getLessonDeadline(index);
    return { lesson, index, deadline, overdue: now.getTime() > deadline.getTime() };
  });
}

/**
 * Bài đang tới hạn: bài gần nhất chưa quá hạn.
 * Hết hạn tất cả thì trả về null.
 */
export function currentDeadline(now: Date = new Date()): DeadlineInfo | null {
  return allDeadlines(now).find((d) => !d.overdue) ?? null;
}
