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
  title: string;
  description: string;
  /** Mã video YouTube. Để trống nếu chưa có. */
  youtubeId: string;
  duration: string;
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
    title: "Phần 1 — Nền tảng",
    subtitle: "Dựng nền móng trước khi chạy: tư duy, hồ sơ, và sản phẩm đầu tiên.",
    lessons: [
      {
        key: "p1-b1",
        title: "Bài 1 — Tư duy của chiến thần",
        description:
          "Vì sao phần lớn người làm affiliate bỏ cuộc trong 30 ngày đầu, và tư duy nào giúp bạn đi tiếp.",
        youtubeId: "",
        duration: "12 phút",
        assignment:
          "Viết ra 3 lý do bạn bắt đầu, và 3 điều bạn sẵn sàng đánh đổi trong 30 ngày tới. Nộp bản Google Docs.",
      },
      {
        key: "p1-b2",
        title: "Bài 2 — Dựng hồ sơ cá nhân",
        description:
          "Cách viết bio, chọn ảnh đại diện và định vị bản thân để người lạ tin bạn ngay trong 5 giây.",
        youtubeId: "",
        duration: "15 phút",
        assignment:
          "Viết lại bio của bạn theo công thức trong bài. Chụp màn hình hồ sơ trước và sau, dán vào Google Docs.",
      },
      {
        key: "p1-b3",
        title: "Bài 3 — Chọn sản phẩm đầu tiên",
        description:
          "Tiêu chí chọn sản phẩm dễ bán, hoa hồng tốt, và hợp với tệp khán giả bạn đang có.",
        youtubeId: "",
        duration: "18 phút",
        assignment:
          "Chọn 3 sản phẩm, chấm điểm từng sản phẩm theo bảng tiêu chí trong bài, kết luận chọn cái nào và vì sao.",
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
