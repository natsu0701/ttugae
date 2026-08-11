import type { CommunityPattern } from "../data/communityPatterns.ts";
import {
  registerUserPatternThumbnail,
} from "../data/patternThumbnails.ts";
import type { EditorYarn } from "../types/editorYarn.ts";
import type { EditorCell } from "./patternGrid.ts";

const SHARED_KEY = "ttugae.community.shared.v1";

export const COMMUNITY_UPDATED_EVENT = "ttugae:community-updated";

export function loadSharedCommunityPatterns(): CommunityPattern[] {
  try {
    const raw = localStorage.getItem(SHARED_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as CommunityPattern[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveSharedCommunityPatterns(patterns: CommunityPattern[]) {
  localStorage.setItem(SHARED_KEY, JSON.stringify(patterns));
  window.dispatchEvent(new Event(COMMUNITY_UPDATED_EVENT));
}

export function gridToThumbnailHex(
  grid: EditorCell[][],
  colorMap: Record<string, string>,
  maxSize = 12,
): string[][] {
  const rows = grid.length;
  const cols = grid[0]?.length ?? 1;
  const outRows = Math.min(maxSize, rows);
  const outCols = Math.min(maxSize, cols);

  return Array.from({ length: outRows }, (_, r) =>
    Array.from({ length: outCols }, (_, c) => {
      const sr = Math.floor((r / outRows) * rows);
      const sc = Math.floor((c / outCols) * cols);
      const cell = grid[sr]?.[sc];
      if (!cell || cell.stitchId === "empty") return "#FFFFFF";
      return colorMap[cell.colorId] ?? "#FFFFFF";
    }),
  );
}

function editorGridToBooleanGrid(grid: EditorCell[][]): boolean[][] {
  return grid.map((row) =>
    row.map((cell) => cell.stitchId !== "empty" && cell.colorId !== "white"),
  );
}

function formatToday() {
  const d = new Date();
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
}

function yarnSummary(yarns: EditorYarn[]) {
  const types = [...new Set(yarns.map((y) => y.fiberType))];
  return types.slice(0, 3).join(", ") || "혼합 실";
}

export type PublishPostMeta = {
  title: string;
  yarnNeedle: string;
  review: string;
  finishedPhotoDataUrl?: string;
};

export function deleteSharedCommunityPattern(communityId: string): void {
  saveSharedCommunityPatterns(
    loadSharedCommunityPatterns().filter((p) => p.id !== communityId),
  );
}

export function getSharedCommunityPattern(
  communityId: string,
): CommunityPattern | undefined {
  return loadSharedCommunityPatterns().find((p) => p.id === communityId);
}

export function publishPatternToCommunity(input: {
  id: string;
  title: string;
  grid: EditorCell[][];
  gridRows: number;
  gridCols: number;
  colorMap: Record<string, string>;
  yarns: EditorYarn[];
  meta?: PublishPostMeta;
  existingCommunityId?: string;
}): CommunityPattern {
  const communityId = input.existingCommunityId ?? `user-${input.id}`;
  const thumbnail = gridToThumbnailHex(input.grid, input.colorMap);
  registerUserPatternThumbnail(communityId, thumbnail);

  const prev = loadSharedCommunityPatterns().find((p) => p.id === communityId);
  const title = input.meta?.title.trim() || input.title.trim() || "새 도안";
  const yarnNeedle = input.meta?.yarnNeedle.trim() || "";
  const review = input.meta?.review.trim() || "";
  const defaultYarn =
    input.yarns.map((y) => `${y.brand} ${y.label}`).join(" · ") || "미지정";

  const finishedImage =
    input.meta?.finishedPhotoDataUrl ??
    prev?.finishedImage ??
    "그림4_AI예상_스웨터.PNG";

  const pattern: CommunityPattern = {
    id: communityId,
    title,
    author: "나",
    likes: prev?.likes ?? 0,
    scraps: prev?.scraps ?? 0,
    category: "showcase",
    gridCols: input.gridCols,
    gridRows: input.gridRows,
    grid: editorGridToBooleanGrid(input.grid),
    publishedAt: prev?.publishedAt ?? formatToday(),
    hasAttachedPattern: true,
    aiPredictedImage: prev?.aiPredictedImage ?? "그림4_AI예상_스웨터.PNG",
    finishedImage,
    finishedCaption:
      review ||
      (yarnNeedle ? `${yarnNeedle}` : `사용 실: ${yarnSummary(input.yarns)}.`),
    finishedDetail: {
      yarn: yarnNeedle || defaultYarn,
      needle: prev?.finishedDetail.needle ?? "4.0mm",
      duration: prev?.finishedDetail.duration ?? "—",
      review: review || "에디터에서 공유한 도안입니다.",
    },
  };

  const existing = loadSharedCommunityPatterns().filter((p) => p.id !== communityId);
  saveSharedCommunityPatterns([pattern, ...existing]);

  return pattern;
}
