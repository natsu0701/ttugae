import { validatePattern } from "./validatePattern.ts";
import {
  EDITOR_COLOR_HEX,
  hexToColorId,
  type EditorCell,
} from "./patternGrid.ts";

export type ScanMismatch = {
  row: number;
  col: number;
  kind: "color" | "stitch";
  gridColorId: string;
  photoColorId: string;
  gridStitchId: string;
  photoStitchId: string;
};

export type FinishedWorkScanResult = {
  estimatedCols: number | null;
  estimatedRows: number | null;
  gridCols: number;
  gridRows: number;
  countMismatch: boolean;
  colorMismatches: ScanMismatch[];
  stitchMismatches: ScanMismatch[];
  suggestedGrid: EditorCell[][];
  messages: string[];
};

type Rgb = { r: number; g: number; b: number };

function parseHex(hex: string): Rgb | null {
  const raw = hex.trim().replace("#", "");
  if (raw.length !== 6) return null;
  const n = Number.parseInt(raw, 16);
  if (Number.isNaN(n)) return null;
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

function rgbToHex(rgb: Rgb): string {
  const to = (v: number) => v.toString(16).padStart(2, "0");
  return `#${to(rgb.r)}${to(rgb.g)}${to(rgb.b)}`;
}

function luminance(rgb: Rgb): number {
  return (0.2126 * rgb.r + 0.7152 * rgb.g + 0.0722 * rgb.b) / 255;
}

function nearestPaletteId(rgb: Rgb, palette: Record<string, string>): string {
  let bestId = hexToColorId(rgbToHex(rgb));
  let best = Infinity;
  for (const [id, hex] of Object.entries(palette)) {
    const p = parseHex(hex);
    if (!p) continue;
    const dist = (rgb.r - p.r) ** 2 + (rgb.g - p.g) ** 2 + (rgb.b - p.b) ** 2;
    if (dist < best) {
      best = dist;
      bestId = id;
    }
  }
  return bestId;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.decoding = "async";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("완성작 사진을 불러오지 못했어요."));
    img.src = src;
  });
}

function drawForScan(img: HTMLImageElement): ImageData {
  const maxSide = 480;
  const scale = Math.min(1, maxSide / Math.max(img.naturalWidth, img.naturalHeight));
  const w = Math.max(24, Math.round(img.naturalWidth * scale));
  const h = Math.max(24, Math.round(img.naturalHeight * scale));
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("이미지 분석을 준비하지 못했어요.");
  ctx.drawImage(img, 0, 0, w, h);
  return ctx.getImageData(0, 0, w, h);
}

function pixel(data: ImageData, x: number, y: number): Rgb {
  const i = (y * data.width + x) * 4;
  return { r: data.data[i], g: data.data[i + 1], b: data.data[i + 2] };
}

function findKnitBounds(data: ImageData): { x0: number; y0: number; x1: number; y1: number } {
  const { width: w, height: h } = data;
  let x0 = w;
  let y0 = h;
  let x1 = 0;
  let y1 = 0;

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const rgb = pixel(data, x, y);
      const sat =
        (Math.max(rgb.r, rgb.g, rgb.b) - Math.min(rgb.r, rgb.g, rgb.b)) / 255;
      if (luminance(rgb) > 0.9 && sat < 0.08) continue;
      if (x < x0) x0 = x;
      if (y < y0) y0 = y;
      if (x > x1) x1 = x;
      if (y > y1) y1 = y;
    }
  }

  if (x1 <= x0 || y1 <= y0) {
    return { x0: 0, y0: 0, x1: w - 1, y1: h - 1 };
  }

  const padX = Math.round((x1 - x0) * 0.04);
  const padY = Math.round((y1 - y0) * 0.04);
  return {
    x0: Math.max(0, x0 + padX),
    y0: Math.max(0, y0 + padY),
    x1: Math.min(w - 1, x1 - padX),
    y1: Math.min(h - 1, y1 - padY),
  };
}

function estimatePeriod(series: number[]): number | null {
  const n = series.length;
  if (n < 16) return null;
  const mean = series.reduce((a, b) => a + b, 0) / n;
  const norm = series.map((v) => v - mean);
  let bestLag = 0;
  let best = -Infinity;
  const minLag = 3;
  const maxLag = Math.max(minLag + 1, Math.floor(n / 8));
  for (let lag = minLag; lag <= maxLag; lag++) {
    let sum = 0;
    for (let i = 0; i < n - lag; i++) sum += norm[i] * norm[i + lag];
    if (sum > best) {
      best = sum;
      bestLag = lag;
    }
  }
  return bestLag > 0 ? bestLag : null;
}

function estimateStitchLayout(
  data: ImageData,
  bounds: { x0: number; y0: number; x1: number; y1: number },
): { cols: number | null; rows: number | null } {
  const cols: number[] = [];
  const rows: number[] = [];
  for (let x = bounds.x0; x <= bounds.x1; x++) {
    let acc = 0;
    let n = 0;
    for (let y = bounds.y0; y <= bounds.y1; y += 2) {
      acc += luminance(pixel(data, x, y));
      n += 1;
    }
    cols.push(n ? acc / n : 0);
  }
  for (let y = bounds.y0; y <= bounds.y1; y++) {
    let acc = 0;
    let n = 0;
    for (let x = bounds.x0; x <= bounds.x1; x += 2) {
      acc += luminance(pixel(data, x, y));
      n += 1;
    }
    rows.push(n ? acc / n : 0);
  }

  const periodX = estimatePeriod(cols);
  const periodY = estimatePeriod(rows);
  const width = bounds.x1 - bounds.x0 + 1;
  const height = bounds.y1 - bounds.y0 + 1;
  return {
    cols: periodX ? Math.max(4, Math.round(width / periodX)) : null,
    rows: periodY ? Math.max(4, Math.round(height / periodY)) : null,
  };
}

type CellSample = {
  rgb: Rgb;
  colorId: string;
  stitchId: string;
};

function sampleCell(
  data: ImageData,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  palette: Record<string, string>,
): CellSample {
  const insetX = Math.max(1, Math.round((x1 - x0) * 0.22));
  const insetY = Math.max(1, Math.round((y1 - y0) * 0.22));
  const sx0 = x0 + insetX;
  const sy0 = y0 + insetY;
  const sx1 = Math.max(sx0 + 1, x1 - insetX);
  const sy1 = Math.max(sy0 + 1, y1 - insetY);

  let rAcc = 0;
  let gAcc = 0;
  let bAcc = 0;
  let lumAcc = 0;
  let lumSq = 0;
  let gx = 0;
  let gy = 0;
  let n = 0;

  for (let y = sy0; y < sy1; y++) {
    for (let x = sx0; x < sx1; x++) {
      const rgb = pixel(data, x, y);
      rAcc += rgb.r;
      gAcc += rgb.g;
      bAcc += rgb.b;
      const lum = luminance(rgb);
      lumAcc += lum;
      lumSq += lum * lum;
      if (x + 1 < sx1) gx += Math.abs(lum - luminance(pixel(data, x + 1, y)));
      if (y + 1 < sy1) gy += Math.abs(lum - luminance(pixel(data, x, y + 1)));
      n += 1;
    }
  }

  const rgb = {
    r: Math.round(rAcc / Math.max(1, n)),
    g: Math.round(gAcc / Math.max(1, n)),
    b: Math.round(bAcc / Math.max(1, n)),
  };
  const meanLum = lumAcc / Math.max(1, n);
  const variance = lumSq / Math.max(1, n) - meanLum * meanLum;
  const colorId = nearestPaletteId(rgb, palette);

  let stitchId = "knit";
  if (meanLum > 0.92 && variance < 0.004) {
    stitchId = "empty";
  } else if (gy > gx * 1.18) {
    stitchId = "knit";
  } else if (gx > gy * 1.18) {
    stitchId = "purl";
  } else if (variance > 0.02) {
    stitchId = "knit";
  } else {
    stitchId = "purl";
  }

  return { rgb, colorId, stitchId };
}

export const PROJECT_FINISHED_PHOTOS: { file: string; label: string }[] = [
  { file: "completed_Beige cardigan.jpg", label: "베이지 가디건" },
  { file: "completed_cherry.jpg", label: "체리 키링" },
  { file: "completed_bear.jpg", label: "곰돌이 인형" },
  { file: "completed_beenie_grey.jpg", label: "회색 털모자" },
  { file: "completed_heart.png", label: "하트 코스터" },
  { file: "completed_gloves_white.jpg", label: "화이트 장갑" },
  { file: "completed_star.jpg", label: "별 코스터" },
  { file: "completed_socks.jpg", label: "분홍 양말" },
  { file: "completed_beenie_yellow.jpg", label: "노란 비니" },
  { file: "completed_muffler_rainbow.jpg", label: "무지개 스카프" },
];

export async function scanFinishedWorkAgainstGrid(
  imageSrc: string,
  grid: EditorCell[][],
  colorMap: Record<string, string> = {},
): Promise<FinishedWorkScanResult> {
  const rows = grid.length;
  const cols = grid[0]?.length ?? 0;
  if (!rows || !cols) {
    throw new Error("비교할 도안 격자가 비어 있습니다.");
  }

  const img = await loadImage(imageSrc);
  const data = drawForScan(img);
  const bounds = findKnitBounds(data);
  const layout = estimateStitchLayout(data, bounds);
  const palette = { ...EDITOR_COLOR_HEX, ...colorMap };

  const suggested: EditorCell[][] = [];
  const colorMismatches: ScanMismatch[] = [];
  const stitchMismatches: ScanMismatch[] = [];
  const bw = bounds.x1 - bounds.x0 + 1;
  const bh = bounds.y1 - bounds.y0 + 1;

  for (let r = 0; r < rows; r++) {
    const row: EditorCell[] = [];
    for (let c = 0; c < cols; c++) {
      const x0 = bounds.x0 + Math.floor((c / cols) * bw);
      const x1 = bounds.x0 + Math.floor(((c + 1) / cols) * bw);
      const y0 = bounds.y0 + Math.floor((r / rows) * bh);
      const y1 = bounds.y0 + Math.floor(((r + 1) / rows) * bh);
      const sample = sampleCell(data, x0, y0, Math.max(x0 + 1, x1), Math.max(y0 + 1, y1), palette);
      const current = grid[r][c];
      const next: EditorCell = {
        colorId: sample.stitchId === "empty" ? current.colorId : sample.colorId,
        stitchId: sample.stitchId === "empty" ? current.stitchId : sample.stitchId,
      };
      row.push(next);

      if (sample.stitchId === "empty" && current.stitchId === "empty") continue;

      if (sample.colorId !== current.colorId && sample.stitchId !== "empty") {
        colorMismatches.push({
          row: r + 1,
          col: c + 1,
          kind: "color",
          gridColorId: current.colorId,
          photoColorId: sample.colorId,
          gridStitchId: current.stitchId,
          photoStitchId: sample.stitchId,
        });
      }
      if (
        sample.stitchId !== "empty" &&
        current.stitchId !== "empty" &&
        sample.stitchId !== current.stitchId &&
        (sample.stitchId === "knit" || sample.stitchId === "purl") &&
        (current.stitchId === "knit" || current.stitchId === "purl")
      ) {
        stitchMismatches.push({
          row: r + 1,
          col: c + 1,
          kind: "stitch",
          gridColorId: current.colorId,
          photoColorId: sample.colorId,
          gridStitchId: current.stitchId,
          photoStitchId: sample.stitchId,
        });
      }
    }
    suggested.push(row);
  }

  const countMismatch = Boolean(
    (layout.cols && Math.abs(layout.cols - cols) >= 2) ||
      (layout.rows && Math.abs(layout.rows - rows) >= 2),
  );

  const messages: string[] = [];
  const rowCheck = validatePattern(grid);
  if (!rowCheck.ok) {
    messages.push(
      `${rowCheck.rowNumber}단의 코 수가 맞지 않습니다. 도안은 ${rowCheck.expected}코인데 실제 소비/생산은 ${rowCheck.actual}코입니다.`,
    );
  }
  if (countMismatch) {
    const photoCols = layout.cols ? `가로 약 ${layout.cols}코` : "가로 추정 불가";
    const photoRows = layout.rows ? `세로 약 ${layout.rows}단` : "세로 추정 불가";
    messages.push(
      `실물 사진에서 ${photoCols}, ${photoRows}로 보이며 현재 도안은 ${cols}코 × ${rows}단입니다.`,
    );
  }
  if (colorMismatches.length > 0) {
    const first = colorMismatches[0];
    messages.push(
      `${first.row}단 ${first.col}열의 배색이 실물 사진과 일치하지 않습니다. 자동으로 보정하시겠습니까?`,
    );
    if (colorMismatches.length > 1) {
      messages.push(`배색이 다른 칸은 모두 ${colorMismatches.length}곳입니다.`);
    }
  }
  if (stitchMismatches.length > 0) {
    const first = stitchMismatches[0];
    messages.push(
      `${first.row}단 ${first.col}열의 뜨개 기호가 실물 무늬와 다릅니다. 겉뜨기/안뜨기 흐름을 사진에 맞춰 보정할 수 있습니다.`,
    );
  }
  if (messages.length === 0) {
    messages.push("실물 사진과 현재 도안의 코 수, 배색, 기호 흐름이 대체로 일치합니다.");
  }

  return {
    estimatedCols: layout.cols,
    estimatedRows: layout.rows,
    gridCols: cols,
    gridRows: rows,
    countMismatch,
    colorMismatches,
    stitchMismatches,
    suggestedGrid: suggested,
    messages,
  };
}
