import { BASE_EDITOR_YARNS } from "../data/baseEditorYarns.ts";
import type { EditorYarn } from "../types/editorYarn.ts";

export type EditorCell = { colorId: string; stitchId: string };

/** 에디터 기본 팔레트 + 커뮤니티 도안 전용 색 */
export const EDITOR_COLOR_HEX: Record<string, string> = {
  white: "#FFFFFF",
  coral: "#FC5F53",
  gray: "#E5E7EB",
  black: "#374151",
  beige: "#E8DCC8",
  navy: "#1E3A5F",
  brown: "#8B6914",
  pink: "#FFB3BA",
  mint: "#BAFFC9",
  sky: "#BAE1FF",
  yellow: "#FFFFBA",
};

export const EXTRA_PATTERN_YARNS: EditorYarn[] = [
  {
    id: "brown",
    label: "브라운",
    hex: EDITOR_COLOR_HEX.brown,
    brand: "뜨개러투게더",
    fiberType: "울",
    texture: "soft",
  },
  {
    id: "pink",
    label: "핑크",
    hex: EDITOR_COLOR_HEX.pink,
    brand: "뜨개러투게더",
    fiberType: "면",
    texture: "smooth",
  },
  {
    id: "mint",
    label: "민트",
    hex: EDITOR_COLOR_HEX.mint,
    brand: "뜨개러투게더",
    fiberType: "면",
    texture: "smooth",
  },
  {
    id: "sky",
    label: "스카이",
    hex: EDITOR_COLOR_HEX.sky,
    brand: "뜨개러투게더",
    fiberType: "면",
    texture: "smooth",
  },
  {
    id: "yellow",
    label: "옐로",
    hex: EDITOR_COLOR_HEX.yellow,
    brand: "뜨개러투게더",
    fiberType: "면",
    texture: "smooth",
  },
];

const HEX_TO_COLOR_ID: Record<string, string> = Object.fromEntries(
  Object.entries(EDITOR_COLOR_HEX).map(([id, hex]) => [hex.toUpperCase(), id]),
);

function parseRgb(hex: string): { r: number; g: number; b: number } | null {
  const raw = hex.trim().replace("#", "");
  if (raw.length !== 6) return null;
  const n = parseInt(raw, 16);
  if (Number.isNaN(n)) return null;
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

export function hexToColorId(hex: string): string {
  const normalized = (hex.startsWith("#") ? hex : `#${hex}`).toUpperCase();
  const direct = HEX_TO_COLOR_ID[normalized];
  if (direct) return direct;

  const rgb = parseRgb(normalized);
  if (!rgb) return "coral";

  let bestId = "coral";
  let bestDist = Infinity;
  for (const [id, paletteHex] of Object.entries(EDITOR_COLOR_HEX)) {
    const p = parseRgb(paletteHex);
    if (!p) continue;
    const dist =
      (rgb.r - p.r) ** 2 + (rgb.g - p.g) ** 2 + (rgb.b - p.b) ** 2;
    if (dist < bestDist) {
      bestDist = dist;
      bestId = id;
    }
  }
  return bestId;
}

export function cloneEditorGrid(grid: EditorCell[][]): EditorCell[][] {
  return grid.map((row) => row.map((cell) => ({ ...cell })));
}

export function scaleEditorGrid(
  src: EditorCell[][],
  rows: number,
  cols: number,
): EditorCell[][] {
  const srcRows = src.length;
  const srcCols = src[0]?.length ?? 0;
  if (!srcRows || !srcCols) return emptyGrid(rows, cols);
  if (srcRows === rows && srcCols === cols) return cloneEditorGrid(src);

  return Array.from({ length: rows }, (_, r) =>
    Array.from({ length: cols }, (_, c) => {
      const cell =
        src[Math.floor((r / rows) * srcRows)]?.[
          Math.floor((c / cols) * srcCols)
        ];
      return cell
        ? { ...cell }
        : { colorId: "white", stitchId: "empty" };
    }),
  );
}

export function paletteYarnsForGrid(
  grid: EditorCell[][],
  colorMap?: Record<string, string>,
): EditorYarn[] {
  const yarns = [...BASE_EDITOR_YARNS];
  const have = new Set(yarns.map((y) => y.id));
  const usedIds = new Set(grid.flat().map((cell) => cell.colorId));
  const hexLookup = { ...EDITOR_COLOR_HEX, ...colorMap };

  for (const id of usedIds) {
    if (have.has(id)) continue;
    const extra = EXTRA_PATTERN_YARNS.find((y) => y.id === id);
    if (extra) {
      yarns.push(extra);
      have.add(id);
      continue;
    }
    const hex = hexLookup[id];
    if (!hex) continue;
    yarns.push({
      id,
      label: id,
      hex,
      brand: "커스텀",
      fiberType: "혼합",
      texture: "smooth",
    });
    have.add(id);
  }

  return yarns;
}

const STITCH_POOL = [
  "knit",
  "purl",
  "yo",
  "k2tog",
  "slip",
  "empty",
  "bobble",
  "caston",
] as const;
const COLOR_POOL = ["white", "coral", "gray", "black", "beige", "navy"] as const;

export function emptyGrid(rows: number, cols: number): EditorCell[][] {
  return Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => ({
      colorId: "white",
      stitchId: "empty",
    })),
  );
}

export function resizeGrid(
  prev: EditorCell[][],
  newRows: number,
  newCols: number,
): EditorCell[][] {
  return Array.from({ length: newRows }, (_, r) =>
    Array.from({ length: newCols }, (_, c) => {
      const cell = prev[r]?.[c];
      return cell
        ? { ...cell }
        : { colorId: "white", stitchId: "empty" };
    }),
  );
}

function seedFromId(id: string) {
  return id.split("").reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
}

/** 에디터·미리보기용 — 여러 색·기호가 섞인 샘플 도안 */
export function createRealisticDemoGrid(
  rows: number,
  cols: number,
  seedKey = "default",
): EditorCell[][] {
  const seed = seedFromId(seedKey);
  const cx = (cols - 1) / 2;
  const cy = (rows - 1) / 2;

  return Array.from({ length: rows }, (_, r) =>
    Array.from({ length: cols }, (_, c) => {
      const dx = (c - cx) / Math.max(cols / 2, 1);
      const dy = (r - cy) / Math.max(rows / 2, 1);
      const dist = Math.sqrt(dx * dx + dy * dy);
      const n = (r * 31 + c * 17 + seed) % 11;

      const ribRow = r % 3 === 0;
      const border =
        r === 0 || c === 0 || r === rows - 1 || c === cols - 1;
      const heart = dist < 0.42 && r > rows * 0.25;
      const stripe = (r + c) % 5 === 0;

      let colorId: (typeof COLOR_POOL)[number] = "white";
      let stitchId: (typeof STITCH_POOL)[number] = "knit";

      if (border) {
        colorId = "navy";
        stitchId = "caston";
      } else if (heart) {
        colorId = "coral";
        stitchId = r % 2 === 0 ? "knit" : "purl";
      } else if (stripe) {
        colorId = "beige";
        stitchId = "yo";
      } else if (ribRow) {
        colorId = "gray";
        stitchId = "purl";
      } else if (dist > 0.75) {
        colorId = "black";
        stitchId = "slip";
      } else if (n === 0 || n === 1) {
        colorId = "coral";
        stitchId = "bobble";
      } else {
        colorId = "white";
        stitchId = c % 4 === 0 ? "k2tog" : "knit";
      }

      return { colorId, stitchId };
    }),
  );
}

export function previewColorHex(colorId: string) {
  return EDITOR_COLOR_HEX[colorId] ?? "#FFFFFF";
}
