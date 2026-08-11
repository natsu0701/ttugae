import type { StoredPattern } from "../Dashboard.tsx";
import { BASE_EDITOR_YARNS } from "../data/baseEditorYarns.ts";
import { emptyGrid } from "./patternGrid.ts";
import { saveShareDraft, type ShareDraftPayload } from "./shareDraft.ts";

const FALLBACK_COLOR_HEX: Record<string, string> = {
  coral: "#FC5F53",
  black: "#374151",
  white: "#FFFFFF",
  gray: "#E5E7EB",
  cream: "#FFFFFF",
  pink: "#FC5F53",
};

/** 저장된 도안 → 게시물 작성용 드래프트 */
export function shareDraftFromStoredPattern(pattern: StoredPattern): ShareDraftPayload {
  const gridRows = pattern.grid.length;
  const gridCols = pattern.grid[0]?.length ?? pattern.gridSize;
  const colorIds = new Set<string>();
  pattern.grid.flat().forEach((cell) => colorIds.add(cell.colorId));

  const colorMap: Record<string, string> = {};
  for (const yarn of BASE_EDITOR_YARNS) {
    if (colorIds.has(yarn.id)) colorMap[yarn.id] = yarn.hex;
  }
  for (const id of colorIds) {
    if (!colorMap[id]) colorMap[id] = FALLBACK_COLOR_HEX[id] ?? "#E5E7EB";
  }

  const yarns = BASE_EDITOR_YARNS.filter((y) => colorIds.has(y.id));

  return {
    pattern,
    yarns,
    colorMap,
    gridRows,
    gridCols,
  };
}

/** 커뮤니티 FAB 등 에디터 없이 작성 페이지로 갈 때 사용 */
export function openShareDraftFromPatterns(
  patterns: StoredPattern[],
): ShareDraftPayload {
  const sorted = patterns.slice().sort((a, b) => b.updatedAt - a.updatedAt);
  const latest = sorted[0];

  const draft: ShareDraftPayload = latest
    ? shareDraftFromStoredPattern(latest)
    : shareDraftFromStoredPattern({
        id: crypto.randomUUID?.() ?? String(Date.now()),
        title: "새 도안",
        updatedAt: Date.now(),
        gridSize: 14,
        grid: emptyGrid(14, 14),
      });

  saveShareDraft(draft);
  return draft;
}
