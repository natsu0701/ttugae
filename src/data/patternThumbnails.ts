/** 커뮤니티 카드·상세·에디터 불러오기용 도안 격자 */

import type { CommunityPattern } from "./communityPatterns.ts";
import {
  cloneEditorGrid,
  hexToColorId,
  scaleEditorGrid,
  type EditorCell,
  EDITOR_COLOR_HEX,
} from "../utils/patternGrid.ts";

const W = "#FFFFFF";
const C = "#FC5F53";
const G = "#E5E7EB";
const B = "#374151";
const BE = "#E8DCC8";
const BR = "#8B6914";
const P1 = "#FFB3BA";
const P2 = "#BAFFC9";
const P3 = "#BAE1FF";
const P4 = "#FFFFBA";

function grid(rows: string[][]): string[][] {
  return rows;
}

/** 15×15 체리 키링 무늬 (미리보기 12×12) */
const CHERRY_15: string[][] = grid([
  [W, W, W, C, C, C, C, W, W, W, W, W],
  [W, W, C, C, W, W, C, C, W, W, W, W],
  [W, C, C, W, W, W, W, C, C, W, W, W],
  [W, C, C, W, W, W, W, C, C, W, W, W],
  [C, C, C, C, C, C, C, C, C, C, W, W],
  [C, C, C, C, C, C, C, C, C, C, W, W],
  [W, C, C, C, C, C, C, C, C, W, W, W],
  [W, W, C, C, C, C, C, C, W, W, W, W],
  [W, W, W, C, C, C, C, W, W, W, W, W],
  [W, W, W, W, C, C, W, W, W, W, W, W],
  [W, W, W, W, W, W, W, W, W, W, W, W],
  [W, W, W, W, W, W, W, W, W, W, W, W],
]);

/** 30×40 무지개 스카프 (미리보기 12×10) */
const SCARF_30x40: string[][] = grid([
  [P1, P1, P1, P1, P1, P1, P1, P1, P1, P1, P1, P1],
  [P2, P2, P2, P2, P2, P2, P2, P2, P2, P2, P2, P2],
  [P3, P3, P3, P3, P3, P3, P3, P3, P3, P3, P3, P3],
  [P4, P4, P4, P4, P4, P4, P4, P4, P4, P4, P4, P4],
  [C, C, C, C, C, C, C, C, C, C, C, C],
  [P1, P1, P1, P1, P1, P1, P1, P1, P1, P1, P1, P1],
  [P2, P2, P2, P2, P2, P2, P2, P2, P2, P2, P2, P2],
  [P3, P3, P3, P3, P3, P3, P3, P3, P3, P3, P3, P3],
  [P4, P4, P4, P4, P4, P4, P4, P4, P4, P4, P4, P4],
  [G, G, G, G, G, G, G, G, G, G, G, G],
]);

/** 22×28 곰돌이 (미리보기 12×10) */
const BEAR_30x40: string[][] = grid([
  [BE, BE, BE, BE, BR, BR, BR, BR, BE, BE, BE, BE],
  [BE, BE, BR, BR, BR, BR, BR, BR, BR, BR, BE, BE],
  [BE, BR, BR, W, W, BR, BR, W, W, BR, BR, BE],
  [BE, BR, BR, W, B, BR, BR, W, B, BR, BR, BE],
  [BE, BR, BR, BR, BR, BR, BR, BR, BR, BR, BR, BE],
  [BE, BR, BR, BR, BR, BR, BR, BR, BR, BR, BR, BE],
  [BE, BE, BR, BR, BR, BR, BR, BR, BR, BR, BE, BE],
  [BE, BE, BE, BR, BR, BR, BR, BR, BR, BE, BE, BE],
  [BE, BE, BE, BE, BR, BR, BR, BR, BE, BE, BE, BE],
  [BE, BE, BE, BE, BE, BE, BE, BE, BE, BE, BE, BE],
]);

/** 20×20 털모자 — 그레이 겉뜨기 단색 */
const HAT_20: string[][] = grid(
  Array.from({ length: 20 }, () => Array.from({ length: 20 }, () => G)),
);

/** 12×12 하트 코스터 */
const HEART_12: string[][] = grid([
  [W, W, C, C, W, W, W, C, C, W, W, W],
  [W, C, C, C, C, W, C, C, C, C, W, W],
  [C, C, C, C, C, C, C, C, C, C, W, W],
  [C, C, C, C, C, C, C, C, C, C, W, W],
  [C, C, C, C, C, C, C, C, C, C, W, W],
  [W, C, C, C, C, C, C, C, C, W, W, W],
  [W, W, C, C, C, C, C, C, W, W, W, W],
  [W, W, W, C, C, C, C, W, W, W, W, W],
  [W, W, W, W, C, C, W, W, W, W, W, W],
  [W, W, W, W, W, W, W, W, W, W, W, W],
  [G, G, G, G, G, G, G, G, G, G, G, G],
  [G, G, G, G, G, G, G, G, G, G, G, G],
]);

/** 50×50 담요 (미리보기 12×12) */
const BLANKET_50: string[][] = grid([
  [BE, BE, BE, C, C, BE, BE, C, C, BE, BE, BE],
  [BE, C, C, BE, BE, C, C, BE, BE, C, C, BE],
  [C, BE, BE, C, BE, BE, C, BE, BE, C, BE, BE],
  [BE, BE, C, C, BE, BE, BE, C, C, BE, BE, C],
  [C, C, BE, BE, C, C, BE, BE, C, C, BE, BE],
  [BE, C, C, BE, BE, C, C, BE, BE, C, C, BE],
  [BE, BE, BE, C, C, BE, BE, C, C, BE, BE, BE],
  [C, BE, BE, BE, C, C, BE, BE, BE, C, BE, BE],
  [BE, C, C, BE, BE, C, C, BE, BE, C, C, BE],
  [BE, BE, C, C, BE, BE, BE, C, C, BE, BE, C],
  [C, C, BE, BE, C, C, BE, BE, C, C, BE, BE],
  [BE, BE, BE, BE, BE, BE, BE, BE, BE, BE, BE, BE],
]);

/** 16×20 화이트 장갑 */
const GLOVES_16x20: string[][] = grid([
  [W, W, G, G, W, G, G, W, G, G, W, W],
  [W, G, W, W, G, W, W, G, W, W, G, W],
  [W, G, W, W, G, W, W, G, W, W, G, G],
  [W, G, W, W, G, W, W, G, W, W, G, G],
  [W, G, G, G, G, G, G, G, G, G, G, W],
  [W, G, W, W, W, W, W, W, W, W, G, W],
  [W, G, W, W, W, W, W, W, W, W, G, W],
  [W, G, W, W, W, W, W, W, W, W, G, W],
  [W, G, G, G, G, G, G, G, G, G, G, W],
  [W, G, G, G, G, G, G, G, G, G, G, W],
]);

/** 12×12 분홍 별 코스터 */
const STAR_12: string[][] = grid([
  [W, W, W, W, W, P1, W, W, W, W, W, W],
  [W, W, W, W, P1, P1, P1, W, W, W, W, W],
  [W, P1, P1, P1, P1, P1, P1, P1, P1, P1, W, W],
  [W, W, P1, P1, P1, P1, P1, P1, P1, W, W, W],
  [W, W, W, P1, P1, P1, P1, P1, W, W, W, W],
  [W, W, P1, P1, P1, P1, P1, P1, P1, W, W, W],
  [W, P1, P1, P1, W, W, W, P1, P1, P1, W, W],
  [W, P1, W, W, W, W, W, W, W, P1, W, W],
  [W, W, W, W, W, W, W, W, W, W, W, W],
  [W, W, W, W, W, W, W, W, W, W, W, W],
  [G, G, G, G, G, G, G, G, G, G, G, G],
  [G, G, G, G, G, G, G, G, G, G, G, G],
]);

/** 18×28 분홍 양말 */
const SOCKS_18x28: string[][] = grid([
  [W, P1, P1, P1, P1, P1, P1, P1, P1, P1, P1, W],
  [W, P1, W, W, W, W, W, W, W, W, P1, W],
  [W, P1, P1, P1, P1, P1, P1, P1, P1, P1, P1, W],
  [W, P1, W, W, W, W, W, W, W, W, P1, W],
  [W, P1, P1, P1, P1, P1, P1, P1, P1, P1, P1, W],
  [W, W, P1, P1, P1, P1, P1, P1, P1, P1, W, W],
  [W, W, W, C, C, C, C, C, C, W, W, W],
  [W, W, W, C, C, C, C, C, C, W, W, W],
  [W, W, W, P1, P1, P1, P1, P1, P1, W, W, W],
  [W, W, W, W, P1, P1, P1, P1, W, W, W, W],
]);

/** 20×20 노란 비니 */
const YELLOW_HAT_20: string[][] = grid([
  [P4, P4, P4, P4, P4, P4, P4, P4, P4, P4, P4, P4],
  [P4, C, C, C, C, C, C, C, C, C, C, P4],
  [P4, C, W, W, W, W, W, W, W, W, C, P4],
  [P4, C, W, P4, P4, P4, P4, P4, P4, W, C, P4],
  [P4, C, W, P4, C, C, C, C, P4, W, C, P4],
  [P4, C, W, P4, C, W, W, C, P4, W, C, P4],
  [P4, C, W, P4, C, C, C, C, P4, W, C, P4],
  [P4, C, W, P4, P4, P4, P4, P4, P4, W, C, P4],
  [P4, C, W, W, W, W, W, W, W, W, C, P4],
  [P4, C, C, C, C, C, C, C, C, C, C, P4],
  [P4, P4, P4, P4, P4, P4, P4, P4, P4, P4, P4, P4],
  [BE, BE, BE, BE, BE, BE, BE, BE, BE, BE, BE, BE],
]);

export const PATTERN_THUMBNAILS: Record<string, string[][]> = {
  "cp-1": CHERRY_15,
  "cp-2": SCARF_30x40,
  "cp-3": BEAR_30x40,
  "cp-4": HAT_20,
  "cp-5": HEART_12,
  "cp-6": BLANKET_50,
  "cp-7": GLOVES_16x20,
  "cp-8": STAR_12,
  "cp-9": SOCKS_18x28,
  "cp-10": YELLOW_HAT_20,
};

const USER_THUMB_KEY = "ttugae.pattern.thumbnails.v1";

function loadUserThumbnails(): Record<string, string[][]> {
  try {
    const raw = localStorage.getItem(USER_THUMB_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Record<string, string[][]>;
  } catch {
    return {};
  }
}

export function registerUserPatternThumbnail(patternId: string, cells: string[][]) {
  const all = loadUserThumbnails();
  all[patternId] = cells;
  localStorage.setItem(USER_THUMB_KEY, JSON.stringify(all));
}

function stitchForHexCell(hex: string, r: number, c: number): string {
  if (hex.toUpperCase() === "#FFFFFF") return "empty";
  if (r % 2 === 1) return "purl";
  if ((r + c) % 7 === 0) return "yo";
  return "knit";
}

export function hexGridToEditorCells(hexGrid: string[][]): EditorCell[][] {
  return hexGrid.map((row, r) =>
    row.map((hex, c) => ({
      colorId: hexToColorId(hex),
      stitchId: stitchForHexCell(hex, r, c),
    })),
  );
}

export function editorGridToHex(
  grid: EditorCell[][],
  colorMap: Record<string, string> = EDITOR_COLOR_HEX,
): string[][] {
  return grid.map((row) =>
    row.map((cell) => {
      if (cell.stitchId === "empty" && cell.colorId === "white") return "#FFFFFF";
      return colorMap[cell.colorId] ?? EDITOR_COLOR_HEX[cell.colorId] ?? "#FFFFFF";
    }),
  );
}

function motifForPatternId(patternId: string): EditorCell[][] {
  const user = loadUserThumbnails()[patternId];
  if (user?.length) return hexGridToEditorCells(user);
  const hex = PATTERN_THUMBNAILS[patternId] ?? CHERRY_15;
  return hexGridToEditorCells(hex);
}

export function getPatternThumbnail(patternId: string): string[][] {
  const user = loadUserThumbnails()[patternId];
  if (user?.length) return user;
  return PATTERN_THUMBNAILS[patternId] ?? CHERRY_15;
}

export function getPatternColorMap(
  pattern?: Pick<CommunityPattern, "colorMap"> | null,
): Record<string, string> {
  return { ...EDITOR_COLOR_HEX, ...pattern?.colorMap };
}

/** 미리보기와 에디터 불러오기가 공유하는 격자 */
export function getPatternEditorGrid(
  pattern: Pick<
    CommunityPattern,
    "id" | "gridRows" | "gridCols" | "editorGrid"
  >,
): EditorCell[][] {
  if (pattern.editorGrid?.length) {
    return cloneEditorGrid(pattern.editorGrid);
  }
  return scaleEditorGrid(
    motifForPatternId(pattern.id),
    pattern.gridRows,
    pattern.gridCols,
  );
}

const previewGridCache = new Map<string, EditorCell[][]>();

function previewGridFor(pattern: CommunityPattern): EditorCell[][] {
  const key = `${pattern.id}:${pattern.gridRows}x${pattern.gridCols}:${pattern.editorGrid?.length ?? 0}`;
  const cached = previewGridCache.get(key);
  if (cached) return cached;
  const cells = getPatternEditorGrid(pattern);
  previewGridCache.set(key, cells);
  return cells;
}

export function getPatternPreviewModel(pattern: CommunityPattern): {
  cells: EditorCell[][];
  colorMap: Record<string, string>;
} {
  return {
    cells: previewGridFor(pattern),
    colorMap: getPatternColorMap(pattern),
  };
}
