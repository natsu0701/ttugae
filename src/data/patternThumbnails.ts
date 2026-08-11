/** 커뮤니티 카드·상세용 미니 그리드 — 셀별 Hex (실제 도안마다 고유 패턴) */

const W = "#FFFFFF";
const C = "#FC5F53";
const G = "#E5E7EB";
const B = "#374151";
const BE = "#E8DCC8";
const BR = "#8B6914";
const N = "#1E3A5F";
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

/** 20×20 털모자 */
const HAT_20: string[][] = grid([
  [N, N, N, N, N, N, N, N, N, N, N, N],
  [N, G, G, G, G, G, G, G, G, G, G, N],
  [N, G, W, W, W, W, W, W, W, W, G, N],
  [N, G, W, N, N, N, N, N, N, W, G, N],
  [N, G, W, N, G, G, G, G, N, W, G, N],
  [N, G, W, N, G, W, W, G, N, W, G, N],
  [N, G, W, N, G, G, G, G, N, W, G, N],
  [N, G, W, N, N, N, N, N, N, W, G, N],
  [N, G, W, W, W, W, W, W, W, W, G, N],
  [N, G, G, G, G, G, G, G, G, G, G, N],
  [N, N, N, N, N, N, N, N, N, N, N, N],
  [G, G, G, G, G, G, G, G, G, G, G, G],
]);

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

export const PATTERN_THUMBNAILS: Record<string, string[][]> = {
  "cp-1": CHERRY_15,
  "cp-2": SCARF_30x40,
  "cp-3": BEAR_30x40,
  "cp-4": HAT_20,
  "cp-5": HEART_12,
  "cp-6": BLANKET_50,
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

export function getPatternThumbnail(patternId: string): string[][] {
  const user = loadUserThumbnails()[patternId];
  if (user?.length) return user;
  return PATTERN_THUMBNAILS[patternId] ?? CHERRY_15;
}
