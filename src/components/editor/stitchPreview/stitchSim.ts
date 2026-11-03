/**
 * Browser-only stitch-surface preview (no network / no 3D).
 * Isolated on purpose: delete this folder to drop the feature.
 */
import type { EditorCell } from "../../../utils/patternGrid.ts";
import {
  isRightSideKnitRow,
  knittingRowNumber,
  knittingStitchNumber,
} from "../../../utils/knittingChart.ts";

export type StitchSimMode = "sc" | "dc" | "knit";
export type StitchSimFabric = "flat" | "round";

export type StitchSimOptions = {
  mode: StitchSimMode;
  fabric: StitchSimFabric;
  stitchesPer10: number;
  rowsPer10: number;
  fuzz: number;
  peek: number;
};

export type StitchSimHit = {
  arrayRow: number;
  arrayCol: number;
  knitRow: number;
  knitStitch: number;
};

export type StitchSimGeometry = {
  width: number;
  height: number;
  cols: number;
  rows: number;
  hit: (px: number, py: number) => StitchSimHit | null;
};

type Rgb = [number, number, number];

const MAX_EDGE = 1400;

export function parseHex(hex: string): Rgb {
  const raw = hex.replace("#", "").trim();
  const full =
    raw.length === 3
      ? raw
          .split("")
          .map((ch) => ch + ch)
          .join("")
      : raw.padEnd(6, "0").slice(0, 6);
  const n = Number.parseInt(full, 16);
  if (!Number.isFinite(n)) return [230, 226, 220];
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function clamp(n: number, lo: number, hi: number) {
  return Math.min(hi, Math.max(lo, n));
}

function shade(rgb: Rgb, t: number): Rgb {
  return rgb.map((ch) => {
    if (t >= 0) return Math.round(ch + (255 - ch) * t);
    return Math.round(ch * (1 + t));
  }) as Rgb;
}

function css(rgb: Rgb, a = 1) {
  if (a >= 1) return `rgb(${rgb[0]},${rgb[1]},${rgb[2]})`;
  return `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${a})`;
}

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a += 0x6d2b79f5;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function meanColor(colors: Rgb[]): Rgb {
  if (!colors.length) return [200, 190, 180];
  const acc: Rgb = [0, 0, 0];
  for (const c of colors) {
    acc[0] += c[0];
    acc[1] += c[1];
    acc[2] += c[2];
  }
  return acc.map((v) => Math.round(v / colors.length)) as Rgb;
}

function fillYarn(
  ctx: CanvasRenderingContext2D,
  ax: number,
  ay: number,
  bx: number,
  by: number,
  width: number,
  color: Rgb,
  fuzz: number,
) {
  const mx = (ax + bx) / 2;
  const my = (ay + by) / 2;
  const len = Math.hypot(bx - ax, by - ay) / 2;
  const ang = Math.atan2(by - ay, bx - ax);
  const rx = Math.max(1.2, len * 1.06);
  const ry = Math.max(0.8, width);
  ctx.save();
  ctx.translate(mx, my);
  ctx.rotate(ang);
  const g = ctx.createLinearGradient(0, -ry, 0, ry);
  g.addColorStop(0, css(shade(color, -0.34)));
  g.addColorStop(0.42, css(shade(color, 0.2)));
  g.addColorStop(1, css(shade(color, -0.3)));
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
  if (ry >= 2.2) {
    ctx.save();
    ctx.clip();
    ctx.lineWidth = Math.max(0.55, ry * 0.22);
    const step = Math.max(2, ry * 0.85);
    for (let t = -rx * 1.15; t < rx * 1.15; t += step) {
      ctx.strokeStyle = css(shade(color, -0.22));
      ctx.globalAlpha = 0.38 + fuzz * 0.2;
      ctx.beginPath();
      ctx.moveTo(t, -ry);
      ctx.lineTo(t + ry * 1.05, ry);
      ctx.stroke();
      ctx.strokeStyle = css(shade(color, 0.28));
      ctx.globalAlpha = 0.22;
      ctx.beginPath();
      ctx.moveTo(t + step * 0.4, -ry);
      ctx.lineTo(t + step * 0.4 + ry * 1.05, ry);
      ctx.stroke();
    }
    ctx.restore();
  }
  ctx.restore();
}

function fillLobe(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  rot: number,
  color: Rgb,
) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(rot);
  const g = ctx.createLinearGradient(0, -ry, 0, ry);
  g.addColorStop(0, css(shade(color, 0.24)));
  g.addColorStop(0.55, css(shade(color, -0.04)));
  g.addColorStop(1, css(shade(color, -0.32)));
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = css(shade(color, -0.3));
  ctx.globalAlpha = 0.32;
  ctx.lineWidth = Math.max(0.5, ry * 0.14);
  ctx.beginPath();
  ctx.ellipse(0, 0, rx * 0.52, ry * 0.42, 0, Math.PI * 1.05, Math.PI * 1.9);
  ctx.stroke();
  ctx.restore();
}

function majorityColor(colors: Rgb[]): Rgb {
  const keyCount = new Map<string, { n: number; c: Rgb }>();
  for (const c of colors) {
    const k = c.join(",");
    const prev = keyCount.get(k);
    if (prev) prev.n += 1;
    else keyCount.set(k, { n: 1, c });
  }
  let best: { n: number; c: Rgb } | null = null;
  for (const v of keyCount.values()) {
    if (!best || v.n > best.n) best = v;
  }
  return best?.c ?? [240, 240, 240];
}

function gridColors(grid: EditorCell[][], colorMap: Record<string, string>): Rgb[][] {
  return grid.map((row) =>
    row.map((cell) => parseHex(colorMap[cell.colorId] ?? "#F4F0EA")),
  );
}

export function drawStitchSimulation(
  canvas: HTMLCanvasElement,
  grid: EditorCell[][],
  colorMap: Record<string, string>,
  options: StitchSimOptions,
): StitchSimGeometry | null {
  const rows = grid.length;
  const cols = grid[0]?.length ?? 0;
  if (!rows || !cols) return null;

  const colors = gridColors(grid, colorMap);
  const flat = colors.flat();
  const avg = meanColor(flat);
  const bgYarn = majorityColor(flat);
  const fuzz = clamp(options.fuzz, 0, 1);
  const peek = clamp(options.peek, 0, 1);
  const gS = clamp(options.stitchesPer10, 8, 40);
  const gR = clamp(options.rowsPer10, 8, 48);
  const aspect = gS / gR;
  const isKnit = options.mode === "knit";
  const isDc = options.mode === "dc";
  const isFlat = options.fabric === "flat";

  const sw = clamp(Math.floor(Math.min(MAX_EDGE / cols, MAX_EDGE / (rows * aspect))), 10, 64);
  const sh = sw * aspect;
  const offsets = Array.from({ length: rows }, (_, knitIndex) => {
    const knitRow = knitIndex + 1;
    const rtl = isFlat ? isRightSideKnitRow(knitRow) : true;
    if (isFlat) return (rtl ? 1 : -1) * 0.045 * sw;
    return knitIndex * 0.055 * sw;
  });
  const minOff = Math.min(...offsets);
  const maxOff = Math.max(...offsets);
  const padX = Math.round(sw * 0.85);
  const padT = Math.round(Math.max(sw * 0.7, sh * 0.45));
  const padB = Math.round(Math.max(sw * 0.9, sh * 0.55));
  const width = Math.round(padX * 2 + cols * sw + (maxOff - minOff));
  const height = Math.round(padT + rows * sh + padB);
  const rowX = offsets.map((v) => padX + (v - minOff));
  const rowTop = (knitIndex: number) => padT + (rows - 1 - knitIndex) * sh;
  const visCol = (arrayCol: number) => arrayCol;

  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  ctx.clearRect(0, 0, width, height);
  if (isKnit) {
    ctx.fillStyle = css(shade(avg, -0.55));
    ctx.fillRect(0, 0, width, height);
  } else {
    ctx.fillStyle = "#f4f1ea";
    ctx.fillRect(0, 0, width, height);
    ctx.save();
    ctx.shadowColor = "rgba(40, 25, 10, 0.32)";
    ctx.shadowBlur = sw * 1.4;
    ctx.shadowOffsetY = sw * 0.4;
    ctx.fillStyle = css(shade(avg, -0.5));
    ctx.beginPath();
    for (let k = 0; k < rows; k++) {
      ctx.rect(rowX[k] + sw * 0.08, rowTop(k) - sh * 0.04, cols * sw - sw * 0.16, sh * 1.08);
    }
    ctx.fill();
    ctx.restore();
  }

  const colorAtKnit = (knitIndex: number, arrayCol: number) => {
    const arrayRow = rows - 1 - knitIndex;
    return colors[arrayRow][arrayCol];
  };

  const rowColors = (knitIndex: number) => {
    const arrayRow = rows - 1 - knitIndex;
    return colors[arrayRow];
  };

  const carriedOf = (knitIndex: number, arrayCol: number): Rgb[] => {
    if (peek <= 0) return [];
    const row = rowColors(knitIndex);
    const me = row[arrayCol];
    const meKey = me.join(",");
    const others = [...new Map(row.map((c) => [c.join(","), c] as const)).values()].filter(
      (c) => c.join(",") !== meKey && c.join(",") !== bgYarn.join(","),
    );
    return others.slice(0, 3);
  };

  const drawHead = (cx: number, hy: number, color: Rgb, dir: number) => {
    const hry = Math.min(sh * 0.22, sw * 0.24);
    fillLobe(ctx, cx + dir * sw * 0.2, hy, sw * 0.32, hry, dir * 0.28, color);
    fillLobe(ctx, cx - dir * sw * 0.2, hy, sw * 0.32, hry, -dir * 0.28, shade(color, -0.04));
  };

  const drawBody = (
    cx: number,
    top: number,
    color: Rgb,
    rs: boolean,
    lean: number,
    rng: () => number,
  ) => {
    const bot = top + sh;
    const j = (rng() - 0.5) * fuzz * sw * 0.08;
    if (isKnit) {
      const dirPair: Array<[number, number]> = [
        [-1, 0.3],
        [1, 0.7],
      ];
      for (const [dir, fx] of dirPair) {
        ctx.save();
        ctx.translate(cx - sw / 2 + sw * fx + j, top + sh * 0.56 + j * 0.4);
        ctx.rotate(dir * (0.48 + (rng() - 0.5) * 0.1 * fuzz));
        const rx = sw * 0.26;
        const ry = sh * 0.76;
        const g = ctx.createLinearGradient(-rx, 0, rx, 0);
        g.addColorStop(0, css(shade(color, -0.36)));
        g.addColorStop(0.5, css(shade(color, 0.16)));
        g.addColorStop(1, css(shade(color, -0.22)));
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = css(shade(color, -0.16));
        ctx.globalAlpha = 0.32 + fuzz * 0.28;
        ctx.lineWidth = Math.max(0.55, sw * 0.03);
        for (let t = -1; t <= 1; t += 0.66) {
          ctx.beginPath();
          ctx.moveTo(-rx * 0.8, ry * t * 0.55 - ry * 0.1);
          ctx.quadraticCurveTo(0, ry * t * 0.55 + ry * 0.05, rx * 0.8, ry * t * 0.55 - ry * 0.1);
          ctx.stroke();
        }
        ctx.restore();
      }
      return;
    }

    if (isDc) {
      const d = lean * sw * 0.1;
      const wid = sw * 0.2 * (1 + (rng() - 0.5) * 0.1);
      if (rs) {
        fillYarn(ctx, cx - sw * 0.19 - d, top + sh * 0.14, cx - sw * 0.19 + d, bot + sh * 0.05, wid, color, fuzz);
        fillYarn(
          ctx,
          cx + sw * 0.19 - d,
          top + sh * 0.14,
          cx + sw * 0.19 + d,
          bot + sh * 0.05,
          wid,
          shade(color, -0.05),
          fuzz,
        );
        ctx.save();
        ctx.translate(cx, top + sh * 0.48);
        ctx.rotate(lean * 0.4);
        const g = ctx.createLinearGradient(0, -sh * 0.07, 0, sh * 0.07);
        g.addColorStop(0, css(shade(color, 0.2)));
        g.addColorStop(1, css(shade(color, -0.28)));
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.ellipse(0, 0, sw * 0.4, Math.min(sh * 0.07, sw * 0.15), 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      } else {
        fillYarn(ctx, cx - sw * 0.2 + d, top + sh * 0.12, cx - sw * 0.2 - d, bot + sh * 0.04, wid * 0.92, color, fuzz);
        fillYarn(
          ctx,
          cx + sw * 0.2 + d,
          top + sh * 0.12,
          cx + sw * 0.2 - d,
          bot + sh * 0.04,
          wid * 0.92,
          shade(color, -0.06),
          fuzz,
        );
        fillYarn(
          ctx,
          cx - sw * 0.42,
          top + sh * 0.42,
          cx + sw * 0.42,
          top + sh * 0.42,
          Math.min(sh * 0.07, sw * 0.15),
          shade(color, -0.04),
          fuzz,
        );
        fillYarn(
          ctx,
          cx - sw * 0.4,
          top + sh * 0.78,
          cx + sw * 0.4,
          top + sh * 0.78,
          Math.min(sh * 0.08, sw * 0.16),
          shade(color, -0.08),
          fuzz,
        );
      }
      return;
    }

    const wid = sw * 0.28 * (1 + (rng() - 0.5) * 0.08);
    if (rs) {
      const tx = cx + lean * sw * 0.05 + j;
      fillYarn(ctx, cx - sw * 0.25, top + sh * 0.2, tx, bot + sh * 0.06, wid, color, fuzz);
      fillYarn(ctx, cx + sw * 0.25, top + sh * 0.2, tx, bot + sh * 0.06, wid, shade(color, -0.05), fuzz);
    } else {
      const tx = cx + j;
      fillYarn(ctx, cx - sw * 0.25, top + sh * 0.18, tx, top + sh * 0.66, wid, color, fuzz);
      fillYarn(ctx, cx + sw * 0.25, top + sh * 0.18, tx, top + sh * 0.66, wid, shade(color, -0.05), fuzz);
      fillYarn(
        ctx,
        cx - sw * 0.36,
        top + sh * 0.8,
        cx + sw * 0.36,
        top + sh * 0.83,
        Math.min(sh * 0.15, sw * 0.17),
        shade(color, -0.04),
        fuzz,
      );
    }
  };

  const drawHeadsForRow = (knitIndex: number) => {
    if (isKnit) return;
    const knitRow = knitIndex + 1;
    const rtl = isFlat ? isRightSideKnitRow(knitRow) : true;
    const dir = rtl ? 1 : -1;
    const top = rowTop(knitIndex);
    const x0 = rowX[knitIndex];
    const order = Array.from({ length: cols }, (_, c) => c);
    if (rtl) order.reverse();
    order.forEach((c, n) => {
      let headColor: Rgb;
      if (n + 1 < cols) headColor = colorAtKnit(knitIndex, order[n + 1]);
      else if (knitIndex + 1 < rows) {
        headColor = isFlat
          ? colorAtKnit(knitIndex + 1, c)
          : colorAtKnit(knitIndex + 1, order[0]);
      } else headColor = colorAtKnit(knitIndex, c);
      const cx = x0 + visCol(c) * sw + sw / 2;
      drawHead(cx - dir * sw * 0.04, top + Math.min(sh * 0.05, sw * 0.05), headColor, dir);
    });
  };

  for (let k = 0; k < rows; k++) {
    const knitRow = k + 1;
    const rs = isFlat ? isRightSideKnitRow(knitRow) : true;
    const rtl = isFlat ? isRightSideKnitRow(knitRow) : true;
    const lean = rtl ? -1 : 1;
    const top = rowTop(k);
    const x0 = rowX[k];
    const row = rowColors(k);
    const rowAvg = meanColor(row);

    if (!isKnit) {
      ctx.fillStyle = css(shade(rowAvg, -0.4));
      ctx.fillRect(x0 - 0.5, top - 0.5, cols * sw + 1, sh + 1);
      for (let c = 0; c < cols; c++) {
        const X = x0 + visCol(c) * sw;
        ctx.fillStyle = css(shade(row[c], -0.28));
        ctx.beginPath();
        ctx.ellipse(X + sw / 2, top + sh * 0.52, sw * 0.48, sh * 0.54, 0, 0, Math.PI * 2);
        ctx.fill();
      }
      if (k > 0) drawHeadsForRow(k - 1);
    }

    const order = Array.from({ length: cols }, (_, c) => c);
    if (rtl) order.reverse();
    for (const c of order) {
      const rng = mulberry32((k + 3) * 73856093 ^ (c + 1) * 19349663 ^ 13);
      const cx = x0 + visCol(c) * sw + sw / 2 + (rng() - 0.5) * fuzz * sw * 0.06;
      drawBody(cx, top, row[c], rs, lean, rng);

      if (peek > 0) {
        const carried = carriedOf(k, c);
        const strength = (rs ? 0.16 : 1) * peek;
        if (carried.length && visCol(c) > 0) {
          ctx.save();
          ctx.globalAlpha = strength * 0.55;
          carried.forEach((cc, i) => {
            ctx.fillStyle = css(shade(cc, -0.08));
            ctx.beginPath();
            ctx.ellipse(
              x0 + visCol(c) * sw + 1.5,
              top + sh * (0.62 + i * 0.08),
              sw * 0.07,
              sh * 0.05,
              0,
              0,
              Math.PI * 2,
            );
            ctx.fill();
          });
          ctx.restore();
        }
      }
    }
  }

  if (fuzz > 0 && isKnit) {
    const rng = mulberry32(7);
    ctx.globalAlpha = 0.07 * fuzz;
    for (let i = 0; i < cols * rows * fuzz * 2; i++) {
      ctx.strokeStyle = rng() < 0.5 ? "#fff" : "#000";
      ctx.lineWidth = 0.5;
      const a = rng() * width;
      const b = rng() * height;
      const l = sw * 0.35;
      ctx.beginPath();
      ctx.moveTo(a, b);
      ctx.lineTo(a + (rng() - 0.5) * l, b + (rng() - 0.5) * l);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }

  return {
    width,
    height,
    cols,
    rows,
    hit: (px: number, py: number) => {
      for (let k = rows - 1; k >= 0; k--) {
        const top = rowTop(k);
        const left = rowX[k];
        if (py < top || py > top + sh || px < left || px > left + cols * sw) continue;
        const arrayCol = clamp(Math.floor((px - left) / sw), 0, cols - 1);
        const arrayRow = rows - 1 - k;
        return {
          arrayRow,
          arrayCol,
          knitRow: knittingRowNumber(arrayRow, rows),
          knitStitch: knittingStitchNumber(arrayCol, cols),
        };
      }
      return null;
    },
  };
}
