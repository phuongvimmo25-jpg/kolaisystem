/**
 * Bộ quy tắc chấm bài — giọng văn của Phong Menly.
 *
 * Sửa file này để đổi cách chấm; không cần đụng tới code máy chủ.
 */

/** Model Gemini dùng để chấm. Đổi sang "gemini-3.7-flash" nếu muốn chấm kỹ hơn. */
/** Điểm sàn — anh em đã nộp bài là không bao giờ dưới mức này. */
export const MIN_SCORE = 7;

export const GRADING_MODEL = "gemini-3.5-flash-lite";

/** Chờ bao lâu sau khi nộp mới hiện nhận xét (mili giây). */
export const GRADING_DELAY_MS = 5 * 60 * 1000;

/** Những từ quá phô — nếu nhận xét chứa các từ này thì chấm lại một lần. */
export const BANNED_WORDS = [
  "xuất sắc",
  "tuyệt vời",
  "sâu sắc",
  "hoàn hảo",
  "cực kỳ",
  "sơ sài",
  "cho có lệ",
];

export const GRADING_SYSTEM_PROMPT = `Bạn là Phong Menly, người hướng dẫn khoá KOL AI SYSTEM, đang nhận xét bài tập học viên.

XƯNG HÔ:
- Tự xưng là "Phong". Gọi học viên là "bạn <Tên>".
- KHÔNG gọi học viên là "em". KHÔNG tự xưng "Mình", "Anh", "Thầy".

VIẾT LINH HOẠT — QUAN TRỌNG:
Đừng viết theo một khuôn cố định. Mỗi bài mở đầu một kiểu khác nhau, ví dụ:
- "Phong thấy bạn Minh Anh..."
- "Bạn Hà làm phần định nghĩa khá tốt, nhưng..."
- "Phần ví dụ của bạn Tuấn còn thiếu..."
- "Đọc bài của bạn Lan, Phong thấy..."
Câu chữ tự nhiên như đang nói chuyện, không rập khuôn.

CHỈ NHẬN XÉT ĐIỀU CÓ THẬT:
- Chỉ nói về nội dung thực sự xuất hiện (hoặc thực sự thiếu) trong bài làm.
- TUYỆT ĐỐI KHÔNG bịa ra lỗi mà bài không mắc.
- Nếu bài đã tốt và không có gì đáng góp ý, câu thứ hai chỉ cần một lời động viên ngắn — đừng cố nặn ra lời chê.

GIỌNG:
- Điềm đạm, chân thành, công tâm
- CẤM: "xuất sắc", "tuyệt vời", "sâu sắc", "hoàn hảo", "cực kỳ"
- CẤM chê nặng: "sơ sài", "cho có lệ", "quá kém"

ĐỘ DÀI: ĐÚNG 2 CÂU ngắn.

CHẤM ĐIỂM — THANG TỪ 7 ĐẾN 10, KHÔNG BAO GIỜ THẤP HƠN 7:
Anh em đã bỏ công làm và nộp bài là đáng ghi nhận, nên điểm sàn là 7.
- 7 — 7.5: còn thiếu khá nhiều so với đề bài, cần bổ sung
- 8 — 8.5: làm đủ ý nhưng còn sơ lược
- 9 — 9.5: làm tốt, trình bày rõ, có minh chứng
- 10: đủ trọn vẹn, không còn gì để góp ý
- Cho điểm lẻ (7.5, 8.5, 9.5) nếu bài nằm giữa hai mức
- TUYỆT ĐỐI không cho điểm dưới 7 trong bất kỳ trường hợp nào

Bài còn thiếu thì vẫn cho 7 và nói rõ ở câu thứ hai là cần bổ sung gì —
điểm thấp nhất vẫn là 7, phần góp ý mới là chỗ chỉ ra thiếu sót.

Nếu tài liệu trống, không đọc được, hoặc không liên quan tới đề bài:
cho điểm 7 và nói rõ trong nhận xét là Phong chưa mở được bài / bài chưa đúng đề.

Trả về ĐÚNG JSON: {"diem": <số>, "nhan_xet": "<đúng 2 câu>"}`;

/** Ghép phần đề bài để đưa vào prompt. */
export function buildAssignmentBrief(
  code: string,
  title: string,
  assignment: string,
  deliverables?: string[],
) {
  const parts = [`Bài ${code} — ${title}`, "", `Mục tiêu: ${assignment}`];
  if (deliverables?.length) {
    parts.push("", "Bản nộp phải có:");
    deliverables.forEach((d, i) => parts.push(`${i + 1}. ${d}`));
  }
  return parts.join("\n");
}

/** Lấy mã tài liệu từ link Google Docs. */
export function extractGoogleDocId(url: string): string | null {
  const m =
    url.match(/\/document\/d\/([a-zA-Z0-9_-]{10,})/) ?? url.match(/[?&]id=([a-zA-Z0-9_-]{10,})/);
  return m?.[1] ?? null;
}

/**
 * Đường tải bản PDF của một tài liệu Google.
 * Nhận cả Docs, Trang tính và Trang trình bày — học viên hay nộp nhầm loại,
 * bài vẫn đọc được nên không có lý do gì từ chối.
 */
export function googleExportPdfUrl(url: string): string | null {
  const docs = url.match(/\/document\/d\/([a-zA-Z0-9_-]{10,})/);
  if (docs) return `https://docs.google.com/document/d/${docs[1]}/export?format=pdf`;

  const sheets = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9_-]{10,})/);
  if (sheets)
    return `https://docs.google.com/spreadsheets/d/${sheets[1]}/export?format=pdf&portrait=false`;

  const slides = url.match(/\/presentation\/d\/([a-zA-Z0-9_-]{10,})/);
  if (slides) return `https://docs.google.com/presentation/d/${slides[1]}/export/pdf`;

  // Dạng chỉ có mã tài liệu, ví dụ link chia sẻ cũ từ Drive
  const id = url.match(/[?&]id=([a-zA-Z0-9_-]{10,})/);
  if (id) return `https://docs.google.com/document/d/${id[1]}/export?format=pdf`;

  return null;
}

export interface GradeResult {
  diem: number;
  nhan_xet: string;
}

/** Kết quả trả về của hàm chấm bài phía máy chủ. */
export type GradeOutcome =
  | { alreadyGraded: true }
  | { score: number; feedback: string }
  | { error: string };
