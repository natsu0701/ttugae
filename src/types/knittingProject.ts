import type { EditorCell } from "../utils/patternGrid.ts";
import { cloneEditorGrid } from "../utils/patternGrid.ts";

export type ChartTargetPart =
  | "body"
  | "bodyBack"
  | "sleeveLeft"
  | "sleeveRight"
  | "collar";

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
  facesIndependent?: boolean;
}

export const CHART_PART_LABELS: Record<ChartTargetPart, string> = {
  body: "앞면",
  bodyBack: "뒷면",
  sleeveLeft: "왼소매",
  sleeveRight: "오른소매",
  collar: "목둘레",
};

export const CAST_ON_PARTS: ChartTargetPart[] = [
  "body",
  "sleeveLeft",
  "sleeveRight",
  "collar",
];

export function newChartId(): string {
  return crypto.randomUUID?.() ?? `chart-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function frontBodyChart(charts: KnittingChart[]): KnittingChart | undefined {
  return charts.find((chart) => chart.targetPart === "body") ?? charts[0];
}

export function backBodyChart(charts: KnittingChart[]): KnittingChart | undefined {
  return charts.find((chart) => chart.targetPart === "bodyBack");
}

export function visibleEditorCharts(
  charts: KnittingChart[],
  facesIndependent: boolean,
): KnittingChart[] {
  if (facesIndependent) return charts;
  return charts.filter((chart) => chart.targetPart !== "bodyBack");
}

/** 뒷면 도안이 없으면 앞면을 복제해 바로 뒤에 넣습니다. */
export function ensureBackBodyChart(charts: KnittingChart[]): KnittingChart[] {
  if (backBodyChart(charts)) return charts;
  const front = frontBodyChart(charts);
  if (!front) return charts;
  const back: KnittingChart = {
    id: newChartId(),
    name: CHART_PART_LABELS.bodyBack,
    targetPart: "bodyBack",
    gridData: cloneEditorGrid(front.gridData),
  };
  const idx = charts.findIndex((chart) => chart.id === front.id);
  const next = [...charts];
  next.splice(idx < 0 ? charts.length : idx + 1, 0, back);
  return next;
}
