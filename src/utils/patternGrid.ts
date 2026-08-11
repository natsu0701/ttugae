export type EditorCell = { colorId: string; stitchId: string };

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

const PREVIEW_COLOR_HEX: Record<string, string> = {
  white: "#FFFFFF",
  coral: "#FC5F53",
  gray: "#E5E7EB",
  black: "#374151",
  beige: "#E8DCC8",
  navy: "#1E3A5F",
};

export function previewColorHex(colorId: string) {
  return PREVIEW_COLOR_HEX[colorId] ?? "#FFFFFF";
}
