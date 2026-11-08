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
 * 파일은 `public/overlays/`에 넣고, 이 배열에 항목을 추가하면 화면에 나타납니다.
 * 알파가 있는 VP9 WebM(1920×1080). 오버레이는 object-contain으로 화면 안에 맞춥니다.
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

export function canPlayWebmVp9(): boolean {
  if (typeof document === "undefined") return true;
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
