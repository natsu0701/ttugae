import { assetUrl } from "../utils/appPath.ts";

export type ArPlaylistItem = {
  id: string;
  title: string;
  /** `public/` 기준 경로. 예: `overlays/guide-1.webm` */
  src: string;
};

/**
 * 카메라 위에 겹칠 영상 재생목록.
 * 파일은 `public/overlays/`에 넣고, 이 배열에 항목을 추가하면 화면에 나타납니다.
 */
export const AR_PLAYLIST: ArPlaylistItem[] = [
  {
    id: "guide-1",
    title: "1단 안내",
    src: "overlays/guide-1.mp4",
  },
  {
    id: "guide-2",
    title: "2단 안내",
    src: "overlays/guide-2.mp4",
  },
];

export function playlistVideoUrl(item: ArPlaylistItem): string {
  return assetUrl(item.src);
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
