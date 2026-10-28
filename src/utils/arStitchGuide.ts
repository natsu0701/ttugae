import type { EditorCell } from "./patternGrid.ts";

export type StitchCoord = {
  row: number;
  col: number;
};

function isWorkableCell(cell: EditorCell | undefined): boolean {
  return Boolean(cell && cell.stitchId !== "empty");
}

/**
 * Knitting-chart order: start at the bottom row, right-to-left on odd
 * knitted rows, left-to-right on even rows. Empty cells are skipped.
 */
export function buildStitchPath(grid: EditorCell[][]): StitchCoord[] {
  const rows = grid.length;
  const cols = grid[0]?.length ?? 0;
  if (rows === 0 || cols === 0) return [];

  const path: StitchCoord[] = [];
  for (let knitted = 0; knitted < rows; knitted += 1) {
    const row = rows - 1 - knitted;
    const rightToLeft = knitted % 2 === 0;
    if (rightToLeft) {
      for (let col = cols - 1; col >= 0; col -= 1) {
        if (isWorkableCell(grid[row]?.[col])) path.push({ row, col });
      }
    } else {
      for (let col = 0; col < cols; col += 1) {
        if (isWorkableCell(grid[row]?.[col])) path.push({ row, col });
      }
    }
  }

  if (path.length > 0) return path;

  for (let knitted = 0; knitted < rows; knitted += 1) {
    const row = rows - 1 - knitted;
    for (let col = cols - 1; col >= 0; col -= 1) {
      path.push({ row, col });
    }
  }
  return path;
}

export function nextStitchIndex(index: number, total: number): number {
  if (total <= 0) return 0;
  return (index + 1) % total;
}

const STITCH_INDEX_PREFIX = "ttugae.ar.stitchIndex.";

export function loadStitchIndex(patternId: string, total: number): number {
  if (!patternId || total <= 0) return 0;
  try {
    const raw = localStorage.getItem(`${STITCH_INDEX_PREFIX}${patternId}`);
    if (raw == null) return 0;
    const parsed = Number(raw);
    if (!Number.isFinite(parsed)) return 0;
    return ((Math.trunc(parsed) % total) + total) % total;
  } catch {
    return 0;
  }
}

export function persistStitchIndex(patternId: string, index: number): void {
  if (!patternId) return;
  try {
    localStorage.setItem(`${STITCH_INDEX_PREFIX}${patternId}`, String(index));
  } catch {
    // private mode
  }
}
