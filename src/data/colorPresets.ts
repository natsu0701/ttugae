export type ColorPreset = {
  id: string;
  name: string;
  colors: [string, string, string, string];
};

/** 추천 색 조합 전체 풀 — 새로고침 시 3~4개 무작위 노출 */
export const COLOR_PRESET_POOL: ColorPreset[] = [
  {
    id: "cherry-blossom",
    name: "봄날의 벚꽃",
    colors: ["#FFE4EC", "#FFB7C5", "#FC5F53", "#FFF8FA"],
  },
  {
    id: "vintage-wood",
    name: "빈티지 우드",
    colors: ["#8B6914", "#C4A574", "#E8DCC8", "#5C4033"],
  },
  {
    id: "cozy-cream",
    name: "포근한 크림",
    colors: ["#FFF8F0", "#F5E6D3", "#E8D4B8", "#D4B896"],
  },
  {
    id: "ocean-breeze",
    name: "오션 브리즈",
    colors: ["#BAE1FF", "#7EC8E3", "#1E3A5F", "#E8F4FC"],
  },
  {
    id: "sunset-glow",
    name: "선셋 글로우",
    colors: ["#FFECD2", "#FCBC8A", "#FC5F53", "#8B3A2E"],
  },
  {
    id: "forest-moss",
    name: "포레스트 모스",
    colors: ["#E8F0E4", "#A8C99B", "#4A7C59", "#2D4A3E"],
  },
  {
    id: "lavender-dream",
    name: "라벤더 드림",
    colors: ["#F3E8FF", "#C4B5FD", "#7C3AED", "#EDE9FE"],
  },
  {
    id: "nordic-snow",
    name: "노르딕 스노우",
    colors: ["#F8FAFC", "#CBD5E1", "#64748B", "#1E293B"],
  },
  {
    id: "terracotta",
    name: "테라코타",
    colors: ["#FDE8D8", "#E07A5F", "#C45C3E", "#F4F1DE"],
  },
  {
    id: "midnight-sky",
    name: "미드나잇 스카이",
    colors: ["#1E1B4B", "#4338CA", "#818CF8", "#E0E7FF"],
  },
  {
    id: "peach-sorbet",
    name: "피치 소르베",
    colors: ["#FFF1E6", "#FFCDB2", "#FF9A76", "#FF6B4A"],
  },
  {
    id: "sage-garden",
    name: "세이지 가든",
    colors: ["#F0FDF4", "#BBF7D0", "#86EFAC", "#166534"],
  },
];

/** @deprecated — 초기 표시용; UI는 `pickRandomPresets` 사용 */
export const COLOR_PRESETS = COLOR_PRESET_POOL.slice(0, 4);

function shufflePresets<T>(items: T[]): T[] {
  const copy = items.slice();
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/** 풀에서 3~4개의 조합을 무작위로 선택 */
export function pickRandomPresets(): ColorPreset[] {
  const count = 3 + Math.floor(Math.random() * 2);
  return shufflePresets(COLOR_PRESET_POOL).slice(
    0,
    Math.min(count, COLOR_PRESET_POOL.length),
  );
}
