import { useEffect, useRef, useState } from "react";

/**
 * Phải mở bài bao nhiêu giây mới được bấm Hoàn thành.
 * Không dùng YouTube API vì nó chiếm quyền thẻ iframe và làm video đen màn hình.
 * Cách này đếm thời gian học viên thực sự ở lại trang, chỉ tính khi tab đang hiện.
 */
export const REQUIRED_SECONDS = 120;

export function useVideoProgress(lessonKey: string, enabled: boolean) {
  const [seconds, setSeconds] = useState(0);
  const secRef = useRef(0);

  // Đổi bài thì đếm lại từ đầu
  useEffect(() => {
    secRef.current = 0;
    setSeconds(0);
  }, [lessonKey]);

  useEffect(() => {
    if (!enabled || typeof document === "undefined") return;

    const id = setInterval(() => {
      // Tab bị ẩn hoặc chuyển sang cửa sổ khác thì ngừng đếm
      if (document.visibilityState !== "visible") return;
      secRef.current += 1;
      setSeconds(secRef.current);
    }, 1000);

    return () => clearInterval(id);
  }, [lessonKey, enabled]);

  const ratio = Math.min(1, seconds / REQUIRED_SECONDS);
  return {
    seconds,
    ratio,
    enough: seconds >= REQUIRED_SECONDS,
    remaining: Math.max(0, REQUIRED_SECONDS - seconds),
  };
}
