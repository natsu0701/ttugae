import type { EditorCell } from "./patternGrid.ts";

export type PatternValidationOk = {
  ok: true;
};

export type PatternValidationError = {
  ok: false;
  /** 1-based 단 번호 (위에서부터) */
  rowNumber: number;
  expected: number;
  actual: number;
};

export type PatternValidation = PatternValidationOk | PatternValidationError;

function rowConsumeProduce(row: EditorCell[]): { consume: number; produce: number } {
  let consume = 0;
  let produce = 0;

  for (const cell of row) {
    const id = cell.stitchId;
    if (id === "yo") {
      produce += 1;
      continue;
    }
    if (id === "k2tog" || id === "ssk") {
      consume += 2;
      produce += 1;
      continue;
    }
    // empty·겉뜨기·안뜨기 등: 차트 한 칸 = 코 1개
    consume += 1;
    produce += 1;
  }

  return { consume, produce };
}

/**
 * 각 단의 코 수가 사용자가 설정한 전체 코 수(격자 가로)와 맞는지 검사합니다.
 * 코늘리기(yo) / 코줄이기(k2tog, ssk)가 한 단 안에서 균형이 깨지면 오류입니다.
 */
export function validatePattern(gridData: EditorCell[][]): PatternValidation {
  if (!gridData.length || !gridData[0]?.length) {
    return { ok: false, rowNumber: 1, expected: 0, actual: 0 };
  }

  const expected = gridData[0].length;

  for (let r = 0; r < gridData.length; r++) {
    const row = gridData[r] ?? [];
    const { consume, produce } = rowConsumeProduce(row);
    if (consume !== expected || produce !== expected) {
      return {
        ok: false,
        rowNumber: r + 1,
        expected,
        actual: produce !== expected ? produce : consume,
      };
    }
  }

  return { ok: true };
}
