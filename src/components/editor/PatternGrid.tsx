import { memo } from "react";
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
  const gridRows = grid.length;
  const gridCols = grid[0]?.length ?? 0;
  const stitchSize =
    gridCols > 30 ? "text-3xs" : gridCols > 20 ? "text-3xs" : "text-2xs";

  return (
    <div
      className="max-h-full max-w-full rounded-xl bg-white p-3 shadow-sm"
      style={{
        aspectRatio: `${gridCols} / ${gridRows}`,
        width: gridCols >= gridRows ? "100%" : "auto",
        height: gridRows > gridCols ? "100%" : "auto",
      }}
    >
      <div
        className={`h-full w-full ${pointerDisabled ? "pointer-events-none" : ""}`}
        style={{ aspectRatio: `${gridCols} / ${gridRows}` }}
      >
        <div
          className="grid h-full w-full gap-px rounded-xl bg-stone-200/70 p-1"
          style={{
            gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))`,
            gridTemplateRows: `repeat(${gridRows}, minmax(0, 1fr))`,
          }}
        >
          {grid.map((row, r) =>
            row.map((cell, c) => {
              const selected = inSelection(selection, r, c);
              const bgHex = colorMap[cell.colorId] ?? "#FFFFFF";
              const symbolColor = symbolColorForBackground(bgHex);
              return (
                <button
                  key={`${r}-${c}`}
                  type="button"
                  className={`relative h-full w-full min-w-0 rounded-sm ${stitchSize}`}
                  style={{ backgroundColor: bgHex }}
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
                    {stitchSymbol(cell.stitchId)}
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
