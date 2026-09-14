export type KnitLevel = {
  level: number;
  title: string;
  score: number;
  nextScore: number | null;
  remaining: number;
  progress: number;
};

const LEVELS: { min: number; title: string }[] = [
  { min: 0, title: "실뭉치 입문" },
  { min: 3000, title: "포근한 초보 뜨개러" },
  { min: 8000, title: "포근한 솜털 뜨개러" },
  { min: 20000, title: "성실한 코 장인" },
  { min: 40000, title: "마스터 니터" },
];

export const LEVEL_PERIOD_DAYS = 90;

export function resolveKnitLevel(score: number): KnitLevel {
  let current = LEVELS[0];
  let next = LEVELS[1] ?? null;
  for (let i = 0; i < LEVELS.length; i += 1) {
    if (score >= LEVELS[i].min) {
      current = LEVELS[i];
      next = LEVELS[i + 1] ?? null;
    }
  }
  const remaining = next ? Math.max(0, next.min - score) : 0;
  const span = next ? next.min - current.min : 1;
  const progress = next ? Math.min(100, Math.round(((score - current.min) / span) * 100)) : 100;
  return {
    level: LEVELS.indexOf(current) + 1,
    title: current.title,
    score,
    nextScore: next?.min ?? null,
    remaining,
    progress,
  };
}
