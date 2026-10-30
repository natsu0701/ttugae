import { memo, useEffect, useRef, useState } from "react";
import { stitchSymbol } from "../../data/stitchSymbols.ts";
import { symbolColorForBackground } from "../../utils/colorContrast.ts";
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
  onCellPointerDown: (r: number, c: number) => void;
  onCellPointerEnter: (r: number, c: number) => void;
};

const GAP_PX = 1;
const FRAME_PAD_PX = 8;
const MIN_CELL_PX = 4;

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
  onCellPointerDown,
  onCellPointerEnter,
}: PatternGridProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState({ w: 0, h: 0 });
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

  const innerW = Math.max(0, box.w - FRAME_PAD_PX * 2);
  const innerH = Math.max(0, box.h - FRAME_PAD_PX * 2);
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

  return (
    <div
      ref={wrapRef}
      className="flex h-full w-full min-h-0 min-w-0 items-center justify-center"
    >
      <div
        className="rounded-xl bg-white shadow-sm"
        style={{
          padding: FRAME_PAD_PX,
          width: cell ? gridW + FRAME_PAD_PX * 2 : undefined,
          height: cell ? gridH + FRAME_PAD_PX * 2 : undefined,
          visibility: cell ? "visible" : "hidden",
        }}
      >
        <div
          className={`grid bg-stone-200/70 ${pointerDisabled ? "pointer-events-none" : ""}`}
          style={{
            gridTemplateColumns: `repeat(${gridCols}, ${cell}px)`,
            gridTemplateRows: `repeat(${gridRows}, ${cell}px)`,
            gap: GAP_PX,
            width: gridW,
            height: gridH,
          }}
        >
          {grid.map((row, r) =>
            row.map((cellData, c) => {
              const selected = inSelection(selection, r, c);
              const bgHex = colorMap[cellData.colorId] ?? "#FFFFFF";
              const symbolColor = symbolColorForBackground(bgHex);
              return (
                <button
                  key={`${r}-${c}`}
                  type="button"
                  className={`relative flex items-center justify-center rounded-sm ${stitchSize}`}
                  style={{
                    width: cell,
                    height: cell,
                    backgroundColor: bgHex,
                  }}
                  onPointerDown={(e) => {
                    e.preventDefault();
                    onCellPointerDown(r, c);
                  }}
                  onPointerEnter={() => onCellPointerEnter(r, c)}
                >
                  {selected && (
                    <span
                      className="pointer-events-none absolute inset-0 rounded-sm bg-coral/40"
                      aria-hidden
                    />
                  )}
                  <span
                    className="pointer-events-none relative z-[1] font-sans font-normal"
                    style={{ color: symbolColor }}
                  >
                    {stitchSymbol(cellData.stitchId)}
                  </span>
                </button>
              );
            }),
          )}
        </div>
      </div>
    </div>
  );
}

export default memo(PatternGrid);
