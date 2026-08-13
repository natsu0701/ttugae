import type { EditorCell } from "../utils/patternGrid.ts";

export type ChartTargetPart = "body" | "sleeveLeft" | "sleeveRight" | "collar";

export interface KnittingChart {
  id: string;
  name: string;
  targetPart: ChartTargetPart;
  gridData: EditorCell[][];
}

export interface KnittingProject {
  id: string;
  title: string;
  charts: KnittingChart[];
  activeChartId: string;
}

export const CHART_PART_LABELS: Record<ChartTargetPart, string> = {
  body: "앞판 몸통",
  sleeveLeft: "왼소매",
  sleeveRight: "오른소매",
  collar: "목둘레",
};

export function newChartId(): string {
  return crypto.randomUUID?.() ?? `chart-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}
