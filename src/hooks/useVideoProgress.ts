import { useCallback, useEffect, useRef, useState } from "react";

/** Phải xem đủ bao nhiêu phần trăm video mới được bấm Hoàn thành. */
export const REQUIRED_WATCH_RATIO = 0.8;

interface YTPlayer {
  getCurrentTime: () => number;
  getDuration: () => number;
  getPlayerState: () => number;
  destroy: () => void;
}

interface YTNamespace {
  Player: new (el: HTMLElement | string, opts: { events?: { onReady?: () => void } }) => YTPlayer;
}

declare global {
  interface Window {
    YT?: YTNamespace;
    onYouTubeIframeAPIReady?: () => void;
  }
}

let apiPromise: Promise<void> | null = null;

/** Nạp thư viện YouTube một lần duy nhất cho cả trang. */
function loadYouTubeApi(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.YT?.Player) return Promise.resolve();
  if (apiPromise) return apiPromise;

  apiPromise = new Promise<void>((resolve) => {
    const prev = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      prev?.();
      resolve();
    };
    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    document.head.appendChild(tag);
  });
  return apiPromise;
}

/**
 * Theo dõi học viên thực sự xem được bao nhiêu phần video.
 *
 * Chỉ tính thời lượng ĐÃ PHÁT, không tính việc kéo thanh tua tới cuối:
 * mỗi giây phát được cộng đúng một giây.
 */
export function useVideoProgress(iframeId: string, enabled: boolean) {
  const [ratio, setRatio] = useState(0);
  const watchedRef = useRef(0);
  const lastTickRef = useRef<number | null>(null);
  const playerRef = useRef<YTPlayer | null>(null);

  // Đổi bài thì đếm lại từ đầu
  useEffect(() => {
    watchedRef.current = 0;
    lastTickRef.current = null;
    setRatio(0);
  }, [iframeId]);

  useEffect(() => {
    if (!enabled || typeof window === "undefined") return;
    let cancelled = false;
    let timer: ReturnType<typeof setInterval> | null = null;

    loadYouTubeApi().then(() => {
      if (cancelled || !window.YT?.Player) return;
      const el = document.getElementById(iframeId);
      if (!el) return;

      const player = new window.YT.Player(el, {});
      playerRef.current = player;

      timer = setInterval(() => {
        try {
          // 1 = đang phát
          if (player.getPlayerState?.() !== 1) {
            lastTickRef.current = null;
            return;
          }
          const now = player.getCurrentTime();
          const dur = player.getDuration();
          if (!dur || dur <= 0) return;

          const last = lastTickRef.current;
          // Chỉ cộng khi thời gian nhích lên tự nhiên (dưới 2 giây),
          // kéo tua sẽ nhảy xa hơn nên không được tính
          if (last !== null && now > last && now - last < 2) {
            watchedRef.current += now - last;
          }
          lastTickRef.current = now;

          setRatio(Math.min(1, watchedRef.current / dur));
        } catch {
          /* trình phát chưa sẵn sàng */
        }
      }, 1000);
    });

    return () => {
      cancelled = true;
      if (timer) clearInterval(timer);
      try {
        playerRef.current?.destroy();
      } catch {
        /* bỏ qua */
      }
      playerRef.current = null;
    };
  }, [iframeId, enabled]);

  const reset = useCallback(() => {
    watchedRef.current = 0;
    lastTickRef.current = null;
    setRatio(0);
  }, []);

  return { ratio, enough: ratio >= REQUIRED_WATCH_RATIO, reset };
}
