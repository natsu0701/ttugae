import { assetUrl } from "../utils/appPath.ts";

export type ArPlaylistItem = {
  id: string;
  titleKey: string;
  /** `public/` 기준 경로. 예: `overlays/knitting-needles.webm` */
  src: string;
  /** Safari 등 WebM 알파를 못 여는 브라우저용 투명 애니메이션. */
  fallbackSrc?: string;
};

/**
 * 카메라 위에 겹칠 영상 재생목록.
 * 원본은 알파 QuickTime(`대바늘(1).mov`, `코바늘(1).mov`)이고,
 * 웹용으로 VP9 WebM(알파)과 Safari용 WebP를 `public/overlays/`에 둔다.
 */
export const AR_PLAYLIST: ArPlaylistItem[] = [
  {
    id: "knitting",
    titleKey: "ar.trackKnitting",
    src: "overlays/knitting-needles.webm",
    fallbackSrc: "overlays/knitting-needles.webp",
  },
  {
    id: "crochet",
    titleKey: "ar.trackCrochet",
    src: "overlays/crochet-hook.webm",
    fallbackSrc: "overlays/crochet-hook.webp",
  },
];

export function playlistVideoUrl(item: ArPlaylistItem): string {
  return assetUrl(item.src);
}

export function playlistFallbackUrl(item: ArPlaylistItem): string | null {
  return item.fallbackSrc ? assetUrl(item.fallbackSrc) : null;
}

function isWebKitWithoutVp9Alpha(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  if (/iP(ad|hone|od)/.test(ua)) return true;
  if (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1) return true;
  return /Safari/.test(ua) && !/Chrome|Chromium|CriOS|Edg|OPR|Firefox/.test(ua);
}

/**
 * Chrome/Firefox는 VP9 WebM 알파를 합성한다. Safari·iOS는 코덱만 열고 알파는 버려
 * 투명 픽셀이 검정으로 보이므로 여기선 false.
 */
export function canPlayWebmVp9Alpha(): boolean {
  if (typeof document === "undefined") return true;
  if (isWebKitWithoutVp9Alpha()) return false;
  const probe = document.createElement("video");
  return probe.canPlayType('video/webm; codecs="vp9"') !== "";
}

export function formatClock(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const total = Math.floor(seconds);
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const secs = total % 60;
  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  }
  return `${minutes}:${String(secs).padStart(2, "0")}`;
}
