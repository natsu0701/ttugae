import type { AttachedPatternData } from "../data/offlineCommunity.ts";
import type { StoredPattern } from "../types/storedPattern.ts";
import type { EditorCell } from "./patternGrid.ts";
import { hexToColorId } from "./patternGrid.ts";
import { parseNeedleFromText } from "../data/knittingMetadataLibrary.ts";

export const WORKSPACE_GRID_KEY = "workspace_grid_cells";
export const WORKSPACE_NEEDLE_KEY = "workspace_needle_size";
const WORKSPACE_TS_KEY = "workspace_grid_cells_ts";

type HubCell = {
  x: number;
  y: number;
  hexColor?: string;
  stitchSymbol?: string;
};

type HubPatternPayload = {
  id?: string;
  title?: string;
  needleType?: string;
  needleSize?: string;
  yarnName?: string;
  totalStitches?: number;
  totalRows?: number;
  gridCells?: HubCell[] | EditorCell[][];
  colorMap?: Record<string, string>;
  needle?: AttachedPatternData["needle"];
};

const SYMBOL_TO_STITCH: Record<string, string> = {
  겉: "knit",
  안: "purl",
  늘: "yo",
  줄: "k2tog",
  knit: "knit",
  purl: "purl",
};

function isHubCellList(cells: unknown): cells is HubCell[] {
  return Array.isArray(cells) && Boolean(cells[0] && typeof cells[0] === "object" && "hexColor" in (cells[0] as object));
}

function isEditorGrid(cells: unknown): cells is EditorCell[][] {
  return (
    Array.isArray(cells) &&
    Array.isArray(cells[0]) &&
    Boolean((cells as EditorCell[][])[0]?.[0]?.colorId)
  );
}

function hubCellsToGrid(payload: HubPatternPayload): EditorCell[][] {
  const cells = payload.gridCells;
  if (isEditorGrid(cells)) return cells;
  const rows = Math.max(8, payload.totalRows ?? 20);
  const cols = Math.max(8, payload.totalStitches ?? 24);
  const grid: EditorCell[][] = Array.from({ length: rows }, (_, r) =>
    Array.from({ length: cols }, () => ({
      colorId: r % 4 === 0 ? "coral" : "white",
      stitchId: r % 2 === 0 ? "knit" : "purl",
    })),
  );
  if (isHubCellList(cells)) {
    cells.forEach((cell) => {
      if (cell.y >= 0 && cell.y < rows && cell.x >= 0 && cell.x < cols) {
        grid[cell.y][cell.x] = {
          colorId: hexToColorId(cell.hexColor ?? "#FC5F53"),
          stitchId: SYMBOL_TO_STITCH[cell.stitchSymbol ?? "겉"] ?? "knit",
        };
      }
    });
  }
  return grid;
}

export function writeWorkspaceGrid(data: AttachedPatternData) {
  localStorage.setItem(WORKSPACE_GRID_KEY, JSON.stringify(data));
  localStorage.setItem(WORKSPACE_TS_KEY, String(Date.now()));
  if (data.needle?.needleSize) {
    localStorage.setItem(WORKSPACE_NEEDLE_KEY, data.needle.needleSize);
  }
}

export function writeHubPatternPayload(payload: HubPatternPayload) {
  localStorage.setItem(WORKSPACE_GRID_KEY, JSON.stringify(payload));
  localStorage.setItem(WORKSPACE_TS_KEY, String(Date.now()));
  if (payload.needleSize) {
    localStorage.setItem(WORKSPACE_NEEDLE_KEY, payload.needleSize);
  }
}

export function readWorkspaceNeedleSize(): string | null {
  return localStorage.getItem(WORKSPACE_NEEDLE_KEY);
}

export function readWorkspaceGrid(): AttachedPatternData | null {
  try {
    const raw = localStorage.getItem(WORKSPACE_GRID_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as HubPatternPayload & AttachedPatternData;
    const grid = hubCellsToGrid(parsed);
    if (!grid.length) return null;
    const needleSize = parsed.needle?.needleSize || parsed.needleSize || readWorkspaceNeedleSize() || "";
    const needle =
      parsed.needle ??
      (needleSize ? parseNeedleFromText(`${parsed.needleType ?? ""} ${needleSize}`) ?? undefined : undefined);
    return {
      id: parsed.id || "workspace-fork",
      title: parsed.title || "복제 도안",
      gridCols: grid[0]?.length ?? parsed.gridCols ?? 1,
      gridRows: grid.length,
      gridCells: grid,
      colorMap: parsed.colorMap,
      needle,
    };
  } catch {
    return null;
  }
}

export function readFreshWorkspaceGrid(maxAgeMs = 30 * 60 * 1000): AttachedPatternData | null {
  const ts = Number(localStorage.getItem(WORKSPACE_TS_KEY) ?? 0);
  if (!ts || Date.now() - ts > maxAgeMs) return readWorkspaceGrid();
  return readWorkspaceGrid();
}

export function workspaceGridToStoredPattern(data: AttachedPatternData): StoredPattern {
  const rows = data.gridCells.length;
  const cols = data.gridCells[0]?.length ?? data.gridCols ?? 1;
  const needleSize = readWorkspaceNeedleSize();
  const needle =
    data.needle ??
    (needleSize ? parseNeedleFromText(needleSize) ?? undefined : undefined);
  return {
    id: `import-${data.id}-${Date.now()}`,
    title: data.title,
    updatedAt: Date.now(),
    gridSize: Math.max(rows, cols, data.gridRows, data.gridCols),
    grid: data.gridCells,
    colorMap: data.colorMap,
    needle,
  };
}
