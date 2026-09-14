import { memo, useEffect, useRef } from "react";
import { stitchSymbol } from "../../data/stitchSymbols.ts";
import { symbolColorForBackground } from "../../utils/colorContrast.ts";
import type { EditorCell } from "../../utils/patternGrid.ts";

type PatternChartGridProps = {
  cells: EditorCell[][];
  colorMap: Record<string, string>;
  className?: string;
  /** fill: 부모를 채움(카드). cells: 칸을 정사각형으로(상세 미리보기) */
  fit?: "fill" | "cells";
};

function symbolFontPx(cols: number) {
  if (cols > 40) return 5;
  if (cols > 28) return 6;
  if (cols > 20) return 8;
  if (cols > 14) return 10;
  return 12;
}

function chartPaintKey(
  cells: EditorCell[][],
  colorMap: Record<string, string>,
  cssW: number,
  cssH: number,
) {
  const rows = cells.length;
  const cols = cells[0]?.length ?? 0;
  let key = `${cssW}x${cssH}|${rows}x${cols}|`;
  for (let r = 0; r < rows; r++) {
    const row = cells[r];
    for (let c = 0; c < cols; c++) {
      key += `${row[c].colorId}:${row[c].stitchId},`;
    }
    key += "|";
  }
  for (const id of Object.keys(colorMap)) {
    key += `${id}:${colorMap[id]};`;
  }
  return key;
}

function paintChart(
  canvas: HTMLCanvasElement,
  cells: EditorCell[][],
  colorMap: Record<string, string>,
) {
  const rows = cells.length;
  const cols = cells[0]?.length ?? 0;
  if (rows === 0 || cols === 0) return;

  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const cssW = Math.max(1, canvas.clientWidth);
  const cssH = Math.max(1, canvas.clientHeight);
  const pixelW = Math.round(cssW * dpr);
  const pixelH = Math.round(cssH * dpr);
  if (canvas.width !== pixelW) canvas.width = pixelW;
  if (canvas.height !== pixelH) canvas.height = pixelH;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, cssW, cssH);
  ctx.fillStyle = "#f5f5f4";
  ctx.fillRect(0, 0, cssW, cssH);

  const gap = cssW / cols > 10 ? 1 : 0.5;
  const cellW = (cssW - gap * (cols - 1)) / cols;
  const cellH = (cssH - gap * (rows - 1)) / rows;
  const radius = Math.min(2, cellW * 0.12, cellH * 0.12);
  const fontPx = Math.min(symbolFontPx(cols), cellW * 0.72, cellH * 0.72);

  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = `500 ${fontPx}px ui-sans-serif, system-ui, sans-serif`;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const cell = cells[r][c];
      const bg = colorMap[cell.colorId] ?? "#FFFFFF";
      const x = c * (cellW + gap);
      const y = r * (cellH + gap);

      ctx.fillStyle = bg;
      if (radius > 0.4 && typeof ctx.roundRect === "function") {
        ctx.beginPath();
        ctx.roundRect(x, y, cellW, cellH, radius);
        ctx.fill();
      } else {
        ctx.fillRect(x, y, cellW, cellH);
      }

      const symbol = stitchSymbol(cell.stitchId);
      if (symbol && fontPx >= 4) {
        ctx.fillStyle = symbolColorForBackground(bg);
        ctx.fillText(symbol, x + cellW / 2, y + cellH / 2 + 0.2);
      }
    }
  }
}

function PatternChartGrid({
  cells,
  colorMap,
  className = "",
  fit = "fill",
}: PatternChartGridProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const paintKeyRef = useRef("");
  const rows = cells.length;
  const cols = cells[0]?.length ?? 1;
  const squareCells = fit === "cells";

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const draw = () => {
      const nextKey = chartPaintKey(cells, colorMap, canvas.clientWidth, canvas.clientHeight);
      if (nextKey === paintKeyRef.current && canvas.width > 0) return;
      paintKeyRef.current = nextKey;
      paintChart(canvas, cells, colorMap);
    };
    draw();

    const ro = new ResizeObserver(draw);
    ro.observe(canvas);
    return () => ro.disconnect();
  }, [cells, colorMap]);

  return (
    <canvas
      ref={canvasRef}
      className={`block ${squareCells ? "w-full" : "h-full w-full"} ${className}`}
      style={
        squareCells
          ? { aspectRatio: `${cols} / ${rows}`, height: "auto" }
          : undefined
      }
      aria-hidden
    />
  );
}

export default memo(PatternChartGrid);
