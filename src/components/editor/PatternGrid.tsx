import { memo, useEffect, useRef, useState, type KeyboardEvent } from "react";
import { useTranslation } from "react-i18next";
import { stitchSymbol } from "../../data/stitchSymbols.ts";
import { symbolColorForBackground } from "../../utils/colorContrast.ts";
import {
  isRightSideKnitRow,
  knittingRowNumber,
  knittingStitchNumber,
} from "../../utils/knittingChart.ts";
import type { EditorCell } from "../../utils/patternGrid.ts";

type Selection = {
  r0: number;
  c0: number;
  r1: number;
  c1: number;
};

type PatternGridProps = {
  grid: EditorCell[][];
  colorMap: Record<string, string>;
  selection: Selection | null;
  pointerDisabled: boolean;
  progressKnitRow?: number | null;
  onCellPointerDown: (r: number, c: number) => void;
  onCellPointerEnter: (r: number, c: number) => void;
};

const GAP_PX = 1;
const FRAME_PAD_PX = 8;
const MIN_CELL_PX = 4;
const RULER_PX = 18;

function inSelection(selection: Selection | null, r: number, c: number) {
  if (!selection) return false;
  const rMin = Math.min(selection.r0, selection.r1);
  const rMax = Math.max(selection.r0, selection.r1);
  const cMin = Math.min(selection.c0, selection.c1);
  const cMax = Math.max(selection.c0, selection.c1);
  return r >= rMin && r <= rMax && c >= cMin && c <= cMax;
}

function PatternGrid({
  grid,
  colorMap,
  selection,
  pointerDisabled,
  progressKnitRow = null,
  onCellPointerDown,
  onCellPointerEnter,
}: PatternGridProps) {
  const { t } = useTranslation();
  const wrapRef = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState({ w: 0, h: 0 });
  const [cursor, setCursor] = useState({ r: 0, c: 0 });
  const gridRows = grid.length;
  const gridCols = grid[0]?.length ?? 0;
  const stitchSize =
    gridCols > 30 ? "text-3xs" : gridCols > 20 ? "text-3xs" : "text-2xs";

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const cr = entries[0]?.contentRect;
      if (!cr) return;
      setBox({ w: cr.width, h: cr.height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    setCursor((prev) => ({
      r: Math.min(Math.max(0, prev.r), Math.max(0, gridRows - 1)),
      c: Math.min(Math.max(0, prev.c), Math.max(0, gridCols - 1)),
    }));
  }, [gridRows, gridCols]);

  const innerW = Math.max(0, box.w - FRAME_PAD_PX * 2 - RULER_PX * 2);
  const innerH = Math.max(0, box.h - FRAME_PAD_PX * 2 - RULER_PX);
  const cell =
    innerW && innerH && gridCols && gridRows
      ? Math.max(
          MIN_CELL_PX,
          Math.floor(
            Math.min(
              (innerW - GAP_PX * (gridCols - 1)) / gridCols,
              (innerH - GAP_PX * (gridRows - 1)) / gridRows,
            ),
          ),
        )
      : 0;
  const gridW = cell * gridCols + GAP_PX * Math.max(0, gridCols - 1);
  const gridH = cell * gridRows + GAP_PX * Math.max(0, gridRows - 1);
  const dense = cell < 14;

  const showRowNum = (n: number) =>
    !dense || n === 1 || n === gridRows || n % 2 === 1;
  const showColNum = (n: number) =>
    !dense || n === 1 || n === gridCols || n % 5 === 0;

  return (
    <div
      ref={wrapRef}
      className="flex h-full w-full min-h-0 min-w-0 items-center justify-center"
    >
      <div
        className="rounded-xl bg-white shadow-sm"
        style={{
          padding: FRAME_PAD_PX,
          width: cell ? gridW + RULER_PX * 2 + FRAME_PAD_PX * 2 : undefined,
          height: cell ? gridH + RULER_PX + FRAME_PAD_PX * 2 : undefined,
          visibility: cell ? "visible" : "hidden",
        }}
      >
        <div
          className="grid"
          style={{
            gridTemplateColumns: `${RULER_PX}px ${gridW}px ${RULER_PX}px`,
            gridTemplateRows: `${gridH}px ${RULER_PX}px`,
          }}
        >
          <div className="flex flex-col" style={{ height: gridH, gap: GAP_PX }}>
            {grid.map((_, r) => {
              const n = knittingRowNumber(r, gridRows);
              const show = !isRightSideKnitRow(n) && showRowNum(n);
              const current = progressKnitRow === n;
              return (
                <div
                  key={`l-${r}`}
                  className={`flex items-center justify-center font-sans text-2xs tabular-nums ${
                    current ? "font-semibold text-coral" : "text-stone-400"
                  }`}
                  style={{ height: cell }}
                >
                  {show || current ? n : ""}
                </div>
              );
            })}
          </div>

          <div
            role="grid"
            aria-label={t("editor.chartGridAria")}
            className={`grid bg-stone-200/70 select-none ${pointerDisabled ? "pointer-events-none" : ""}`}
            style={{
              gridTemplateColumns: `repeat(${gridCols}, ${cell}px)`,
              gridTemplateRows: `repeat(${gridRows}, ${cell}px)`,
              gap: GAP_PX,
              width: gridW,
              height: gridH,
            }}
            onKeyDown={(e: KeyboardEvent<HTMLDivElement>) => {
              if (pointerDisabled) return;
              let nextR = cursor.r;
              let nextC = cursor.c;
              if (e.key === "ArrowUp") nextR -= 1;
              else if (e.key === "ArrowDown") nextR += 1;
              else if (e.key === "ArrowLeft") nextC -= 1;
              else if (e.key === "ArrowRight") nextC += 1;
              else return;
              e.preventDefault();
              const r = Math.min(gridRows - 1, Math.max(0, nextR));
              const c = Math.min(gridCols - 1, Math.max(0, nextC));
              setCursor({ r, c });
              const el = e.currentTarget.querySelector<HTMLElement>(`#chart-cell-${r}-${c}`);
              el?.focus();
            }}
          >
            {grid.map((row, r) =>
              row.map((cellData, c) => {
                const selected = inSelection(selection, r, c);
                const bgHex = colorMap[cellData.colorId] ?? "#FFFFFF";
                const symbolColor = symbolColorForBackground(bgHex);
                const knitN = knittingRowNumber(r, gridRows);
                const isProgressCurrent = progressKnitRow != null && knitN === progressKnitRow;
                const isProgressDone = progressKnitRow != null && knitN < progressKnitRow;
                return (
                  <button
                    key={`${r}-${c}`}
                    id={`chart-cell-${r}-${c}`}
                    type="button"
                    role="gridcell"
                    tabIndex={pointerDisabled ? -1 : cursor.r === r && cursor.c === c ? 0 : -1}
                    aria-label={t("editor.chartCellAria", {
                      row: knittingRowNumber(r, gridRows),
                      stitch: knittingStitchNumber(c, gridCols),
                    })}
                    className={`relative flex items-center justify-center rounded-sm font-mono ${stitchSize}`}
                    style={{
                      width: cell,
                      height: cell,
                      backgroundColor: bgHex,
                    }}
                    onPointerDown={() => {
                      setCursor({ r, c });
                      onCellPointerDown(r, c);
                    }}
                    onClick={(e) => {
                      if (e.detail === 0) onCellPointerDown(r, c);
                    }}
                    onPointerEnter={() => onCellPointerEnter(r, c)}
                    onFocus={() => setCursor({ r, c })}
                  >
                    {isProgressDone ? (
                      <span
                        className="pointer-events-none absolute inset-0 rounded-sm bg-stone-950/20"
                        aria-hidden
                      />
                    ) : null}
                    {isProgressCurrent ? (
                      <span
                        className="pointer-events-none absolute inset-0 rounded-sm bg-amber-300/45 ring-1 ring-inset ring-amber-400/80"
                        aria-hidden
                      />
                    ) : null}
                    {selected && (
                      <span
                        className="pointer-events-none absolute inset-0 rounded-sm bg-coral/40"
                        aria-hidden
                      />
                    )}
                    <span
                      className="pointer-events-none relative z-[1] font-normal leading-none"
                      style={{ color: symbolColor }}
                    >
                      {stitchSymbol(cellData.stitchId)}
                    </span>
                  </button>
                );
              }),
            )}
          </div>

          <div className="flex flex-col" style={{ height: gridH, gap: GAP_PX }}>
            {grid.map((_, r) => {
              const n = knittingRowNumber(r, gridRows);
              const show = isRightSideKnitRow(n) && showRowNum(n);
              const current = progressKnitRow === n;
              return (
                <div
                  key={`r-${r}`}
                  className={`flex items-center justify-center font-sans text-2xs tabular-nums ${
                    current ? "font-semibold text-coral" : "text-stone-400"
                  }`}
                  style={{ height: cell }}
                >
                  {show || current ? n : ""}
                </div>
              );
            })}
          </div>

          <div />
          <div className="flex" style={{ width: gridW, gap: GAP_PX }}>
            {Array.from({ length: gridCols }, (_, c) => {
              const n = knittingStitchNumber(c, gridCols);
              return (
                <div
                  key={`c-${c}`}
                  className="flex items-center justify-center font-sans text-2xs tabular-nums text-stone-400"
                  style={{ width: cell }}
                >
                  {showColNum(n) ? n : ""}
                </div>
              );
            })}
          </div>
          <div />
        </div>
      </div>
    </div>
  );
}

export default memo(PatternGrid);
