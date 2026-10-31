import type { EditorCell } from "./patternGrid.ts";

/** 배열 위가 도안 위. 뜨기는 아래 1단부터. */
export function knittingRowNumber(arrayRow: number, rows: number) {
  return rows - arrayRow;
}

/** 배열 왼쪽이 도안 왼쪽. 1코는 오른쪽. */
export function knittingStitchNumber(arrayCol: number, cols: number) {
  return cols - arrayCol;
}

export function isRightSideKnitRow(knitRow: number) {
  return knitRow % 2 === 1;
}

export function cellsInKnitOrder(row: EditorCell[], knitRow: number): EditorCell[] {
  return isRightSideKnitRow(knitRow) ? [...row].reverse() : row;
}

export function knitOrderedRows(grid: EditorCell[][]) {
  const rows = grid.length;
  return grid
    .map((row, arrayRow) => {
      const n = knittingRowNumber(arrayRow, rows);
      return {
        n,
        rs: isRightSideKnitRow(n),
        cells: cellsInKnitOrder(row, n),
      };
    })
    .sort((a, b) => a.n - b.n);
}

export function countCellsByColor(grid: EditorCell[][]): Map<string, number> {
  const counts = new Map<string, number>();
  for (const row of grid) {
    for (const cell of row) {
      counts.set(cell.colorId, (counts.get(cell.colorId) ?? 0) + 1);
    }
  }
  return counts;
}
