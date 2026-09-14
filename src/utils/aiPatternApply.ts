import type { EditorCell } from "./patternGrid.ts";

const EMPTY: EditorCell = { colorId: "white", stitchId: "empty" };

function pickColor(colorIds: string[], preferred: string[], fallbackIndex = 0): string {
  for (const id of preferred) {
    if (colorIds.includes(id)) return id;
  }
  return colorIds[fallbackIndex % colorIds.length] ?? "coral";
}

/** 가디건 실루엣 — 몸판 겉뜨기, 넥·단 리브·테두리 안뜨기/코줄임 */
function generateCardigan(rows: number, cols: number, colorIds: string[]): EditorCell[][] {
  const body = pickColor(colorIds, ["beige", "gray", "white"]);
  const accent = pickColor(colorIds, ["coral", "navy", "black"]);
  const edge = pickColor(colorIds, ["navy", "black", "gray"]);

  const cx = (cols - 1) / 2;
  const neckRows = Math.max(2, Math.floor(rows * 0.14));
  const shoulderRow = Math.floor(rows * 0.22);

  return Array.from({ length: rows }, (_, r) =>
    Array.from({ length: cols }, (_, c) => {
      const relR = r / Math.max(rows - 1, 1);
      const distC = Math.abs(c - cx) / Math.max(cols / 2, 1);

      const armhole =
        relR > 0.18 &&
        relR < 0.42 &&
        distC > 0.62 &&
        distC < 0.92;
      const bodyHalfWidth = 0.78 - Math.abs(relR - 0.55) * 0.15;
      const outside = distC > bodyHalfWidth || armhole;

      const neckCut =
        r < neckRows &&
        distC < (neckRows - r) / Math.max(neckRows, 1) * 0.38;

      if (outside || neckCut) return { ...EMPTY };

      const isBottomHem = r >= rows - 3;
      const isTopNeck = r < shoulderRow && distC < 0.28;
      const isSideEdge = distC > bodyHalfWidth - 0.08;
      const isRibRow = r % 4 === 0 || isBottomHem;

      if (isTopNeck) {
        return { colorId: accent, stitchId: "k2tog" };
      }
      if (isSideEdge || r === 0) {
        return { colorId: edge, stitchId: r === 0 ? "caston" : "slip" };
      }
      if (isRibRow) {
        return { colorId: body, stitchId: "purl" };
      }
      return { colorId: body, stitchId: "knit" };
    }),
  );
}

function generateScarf(rows: number, cols: number, colorIds: string[]): EditorCell[][] {
  const main = pickColor(colorIds, ["coral", "beige", "gray"]);
  const border = pickColor(colorIds, ["navy", "black"]);

  return Array.from({ length: rows }, (_, r) =>
    Array.from({ length: cols }, (_, c) => {
      const edge = r < 2 || r >= rows - 2 || c < 2 || c >= cols - 2;
      if (edge) return { colorId: border, stitchId: r % 2 === 0 ? "purl" : "knit" };
      return { colorId: main, stitchId: "knit" };
    }),
  );
}

function generateCherry(rows: number, cols: number, colorIds: string[]): EditorCell[][] {
  const red = pickColor(colorIds, ["coral"]);
  const green = pickColor(colorIds, ["gray", "navy", "black"]);
  const bg = pickColor(colorIds, ["white"]);

  const cx = (cols - 1) / 2;
  const cy = Math.floor(rows * 0.55);
  const radius = Math.min(cols, rows) * 0.28;

  return Array.from({ length: rows }, (_, r) =>
    Array.from({ length: cols }, (_, c) => {
      const d = Math.hypot(c - cx, r - cy);
      const stem = c >= cx - 1 && c <= cx + 1 && r < cy - radius * 0.5;
      if (stem) return { colorId: green, stitchId: "purl" };
      if (d <= radius) return { colorId: red, stitchId: "knit" };
      if (d <= radius + 1.2) return { colorId: red, stitchId: "k2tog" };
      return { colorId: bg, stitchId: "empty" };
    }),
  );
}

function generateStripe(rows: number, cols: number, colorIds: string[]): EditorCell[][] {
  return Array.from({ length: rows }, (_, r) =>
    Array.from({ length: cols }, (_, c) => ({
      colorId: colorIds[r % colorIds.length] ?? "coral",
      stitchId: c % 3 === 0 ? "purl" : "knit",
    })),
  );
}

function generateDefault(rows: number, cols: number, colorIds: string[]): EditorCell[][] {
  const a = pickColor(colorIds, ["coral", "beige"], 0);
  const b = pickColor(colorIds, ["gray", "navy"], 1);

  return Array.from({ length: rows }, (_, r) =>
    Array.from({ length: cols }, (_, c) => {
      const checker = (r + c) % 2 === 0;
      return {
        colorId: checker ? a : b,
        stitchId: r % 5 === 0 ? "purl" : "knit",
      };
    }),
  );
}

export function applyAiPatternFromMessage(
  grid: EditorCell[][],
  message: string,
  colorIds: string[],
): EditorCell[][] {
  const rows = grid.length;
  const cols = grid[0]?.length ?? 0;
  if (rows === 0 || cols === 0) return grid;

  const text = message.toLowerCase();

  if (
    text.includes("가디건") ||
    text.includes("cardigan") ||
    (text.includes("가을") && text.includes("도안"))
  ) {
    return generateCardigan(rows, cols, colorIds);
  }
  if (text.includes("스카프") || text.includes("목도리") || text.includes("scarf")) {
    return generateScarf(rows, cols, colorIds);
  }
  if (text.includes("체리") || text.includes("키링") || text.includes("cherry")) {
    return generateCherry(rows, cols, colorIds);
  }
  if (text.includes("줄무늬") || text.includes("stripe")) {
    return generateStripe(rows, cols, colorIds);
  }

  return generateDefault(rows, cols, colorIds);
}

export function getTteuniReply(message: string, t: (key: string) => string): string {
  const text = message.toLowerCase();
  if (
    text.includes("배색") ||
    text.includes("색상") ||
    text.includes("컬러") ||
    text.includes("color") ||
    text.includes("palette") ||
    text.includes("配色")
  ) {
    return t("editor.tteuniReplyColor");
  }
  if (
    text.includes("수정") ||
    text.includes("고치") ||
    text.includes("편집") ||
    text.includes("edit") ||
    text.includes("fix") ||
    text.includes("直し")
  ) {
    return t("editor.tteuniReplyEdit");
  }
  if (
    text.includes("가디건") ||
    text.includes("cardigan") ||
    text.includes("カーディガン")
  ) {
    return t("editor.tteuniReplyCardigan");
  }
  if (
    text.includes("스카프") ||
    text.includes("목도리") ||
    text.includes("scarf") ||
    text.includes("マフラー")
  ) {
    return t("editor.tteuniReplyScarf");
  }
  if (
    text.includes("체리") ||
    text.includes("키링") ||
    text.includes("cherry") ||
    text.includes("さくらんぼ")
  ) {
    return t("editor.tteuniReplyCherry");
  }
  if (text.includes("줄무늬") || text.includes("stripe") || text.includes("縞")) {
    return t("editor.tteuniReplyStripe");
  }
  if (text.includes("가을") || text.includes("autumn") || text.includes("fall") || text.includes("秋")) {
    return t("editor.tteuniReplyAutumn");
  }
  return t("editor.tteuniReplyDefault");
}
