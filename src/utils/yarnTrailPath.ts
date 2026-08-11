export type TrailPoint = {
  x: number;
  y: number;
  timestamp: number;
};

const CORAL = "#FC5F53";

/** 페이드 시 선이 뜯기듯 가늘어지는 스케일 (0.58 ~ 1) */
export function fadeWidthScale(segmentOpacity: number): number {
  return 0.58 + segmentOpacity * 0.42;
}

/** 마이크로 파이버 5겹 — Solid 뼈대 + 초단 점선 노이즈 (긴 dash 금지) */
export const YARN_TRAIL = {
  coral: CORAL,
  lifespanMs: 950,
  layers: [
    { id: "halo-outer", width: 26, color: "#FC5F53", opacity: 0.03 },
    { id: "halo-mid", width: 20, color: "#FC5F53", opacity: 0.08 },
    { id: "body", width: 14, color: "#FC5F53", opacity: 0.95 },
    {
      id: "fiber-dark",
      width: 14,
      color: "#8B2B22",
      opacity: 0.12,
      dasharray: "1 4",
    },
    {
      id: "fiber-light",
      width: 14,
      color: "#FFFFFF",
      opacity: 0.25,
      dasharray: "2 6",
      dashoffset: 2,
    },
  ] as const,
} as const;

/** Catmull-Rom → cubic Bézier SVG path */
export function catmullRomToPath(
  points: Pick<TrailPoint, "x" | "y">[],
  tension = 1,
): string {
  const n = points.length;
  if (n === 0) return "";
  if (n === 1) return `M ${points[0].x} ${points[0].y}`;
  if (n === 2) {
    return `M ${points[0].x} ${points[0].y} L ${points[1].x} ${points[1].y}`;
  }

  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < n - 1; i++) {
    const p0 = points[Math.max(i - 1, 0)];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[Math.min(i + 2, n - 1)];

    const cp1x = p1.x + ((p2.x - p0.x) / 6) * tension;
    const cp1y = p1.y + ((p2.y - p0.y) / 6) * tension;
    const cp2x = p2.x - ((p3.x - p1.x) / 6) * tension;
    const cp2y = p2.y - ((p3.y - p1.y) / 6) * tension;

    d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
  }
  return d;
}

export type TrailSegment = {
  d: string;
  /** 구간 전체에 곱해지는 시간 기반 페이드 (0~1) */
  opacity: number;
};

/** timestamp 기준 — 오래된 꼬리일수록 투명 */
export function ageOpacity(
  timestamp: number,
  now: number,
  lifespanMs: number,
): number {
  const t = (now - timestamp) / lifespanMs;
  if (t >= 1) return 0;
  const eased = 1 - t * t;
  return Math.max(0, Math.min(1, eased));
}

export function pruneExpiredPoints(
  points: TrailPoint[],
  now: number,
  lifespanMs: number,
): void {
  let removeCount = 0;
  while (
    removeCount < points.length &&
    now - points[removeCount].timestamp >= lifespanMs
  ) {
    removeCount++;
  }
  if (removeCount > 0) {
    points.splice(0, removeCount);
  }
}

/** 시간에 따른 꼬리 페이드가 적용된 구간별 경로 */
export function buildTimeFadeSegments(
  points: TrailPoint[],
  now: number,
  lifespanMs: number,
  segmentCount = 6,
): TrailSegment[] {
  if (points.length < 2) return [];

  const segments: TrailSegment[] = [];
  const n = points.length;

  for (let i = 0; i < segmentCount; i++) {
    const start = Math.max(0, Math.floor((i / segmentCount) * (n - 1)) - 1);
    const end = Math.min(n, Math.ceil(((i + 1) / segmentCount) * (n - 1)) + 2);
    const slice = points.slice(start, end);
    if (slice.length < 2) continue;

    const tailAge = ageOpacity(slice[0].timestamp, now, lifespanMs);
    const headAge = ageOpacity(slice[slice.length - 1].timestamp, now, lifespanMs);
    const opacity = Math.min(tailAge, headAge * 0.85 + tailAge * 0.15);

    if (opacity <= 0.02) continue;

    segments.push({
      d: catmullRomToPath(slice),
      opacity,
    });
  }

  return segments;
}
