import { assetUrl } from "../utils/appPath.ts";

export type AchievementBadgeId =
  | "badge1"
  | "badge2"
  | "badge3"
  | "badge4"
  | "badge5"
  | "badge6"
  | "badge7"
  | "badge8"
  | "badge9"
  | "badge10"
  | "badge11";

export type AchievementBadge = {
  id: AchievementBadgeId;
  name: string;
  level: "beginner" | "intermediate" | "advanced";
  levelLabel: string;
  description: string;
  imageSrc: string;
  color: string;
  bgColor: string;
};

const LEGACY_BADGE_IDS: Record<string, AchievementBadgeId> = {
  first_stitch: "badge1",
  frogger_conqueror: "badge2",
  bind_off: "badge3",
  gauge_genius: "badge4",
  color_collector: "badge5",
  multi_project: "badge6",
  yarn_keeper: "badge7",
  lounge_pioneer: "badge8",
  tteuni_soulmate: "badge9",
  market_leader: "badge10",
  stitch_artist: "badge11",
};

export const ACHIEVEMENT_BADGES: AchievementBadge[] = [
  {
    id: "badge1",
    name: "첫 바늘의 설렘",
    level: "beginner",
    levelLabel: "초급",
    description: "뜨개 에디터에서 첫 번째 도안 패키징을 완료하여 수고한 뜨개 여행을 시작했습니다.",
    imageSrc: assetUrl("/images/badge1.png"),
    color: "text-amber-600",
    bgColor: "bg-amber-500/10",
  },
  {
    id: "badge2",
    name: "푸르시오 극복가",
    level: "beginner",
    levelLabel: "초급",
    description: "실수를 두려워하지 않고 5,000코 이상의 편물을 풀어내 이겨냈습니다.",
    imageSrc: assetUrl("/images/badge2.png"),
    color: "text-sky-600",
    bgColor: "bg-sky-500/10",
  },
  {
    id: "badge3",
    name: "꼬막음 완성",
    level: "beginner",
    levelLabel: "초급",
    description: "작품의 마지막 코를 단정하게 오므려 마감하는 꼬막음을 무사히 마쳤습니다.",
    imageSrc: assetUrl("/images/badge3.png"),
    color: "text-rose-500",
    bgColor: "bg-rose-500/10",
  },
  {
    id: "badge4",
    name: "게이지(Gauge) 계산요정",
    level: "intermediate",
    levelLabel: "중급",
    description: "게이지(Gauge) 계산기 수식에 내 손땀을 대입해 콧수를 3회 이상 똑똑하게 변환했습니다.",
    imageSrc: assetUrl("/images/badge4.png"),
    color: "text-emerald-600",
    bgColor: "bg-emerald-500/10",
  },
  {
    id: "badge5",
    name: "배색 가디건 컬렉터",
    level: "intermediate",
    levelLabel: "중급",
    description: "추천 컬러 조합 팔레트를 3회 이상 작품에 연동해 도안을 그렸습니다.",
    imageSrc: assetUrl("/images/badge5.png"),
    color: "text-indigo-600",
    bgColor: "bg-indigo-500/10",
  },
  {
    id: "badge6",
    name: "문어발 뜨개질러",
    level: "intermediate",
    levelLabel: "중급",
    description: "동시에 3개 이상의 다중 프로젝트 가방을 등록해 진행하는 열정을 뽐냈습니다.",
    imageSrc: assetUrl("/images/badge6.png"),
    color: "text-orange-500",
    bgColor: "bg-orange-500/10",
  },
  {
    id: "badge7",
    name: "실 보관 마스터",
    level: "intermediate",
    levelLabel: "중급",
    description: "소장 중인 실의 잔량과 바늘을 실 장고 보관함에 5회 이상 성실히 기록했습니다.",
    imageSrc: assetUrl("/images/badge7.png"),
    color: "text-teal-600",
    bgColor: "bg-teal-500/10",
  },
  {
    id: "badge8",
    name: "따뜻한 라운지 리더",
    level: "advanced",
    levelLabel: "고급",
    description: "커뮤니티 자랑 피드에 정성 어린 제작 수기와 도안을 공유해 많은 이들에게 영감을 주었습니다.",
    imageSrc: assetUrl("/images/badge8.png"),
    color: "text-rose-500",
    bgColor: "bg-rose-500/10",
  },
  {
    id: "badge9",
    name: "뜨니의 소울메이트",
    level: "advanced",
    levelLabel: "고급",
    description: "대화형 프롬프트를 활용해 AI 뜨니 챗과 대화하며 도안을 10회 이상 정밀 수정했습니다.",
    imageSrc: assetUrl("/images/badge9.png"),
    color: "text-orange-500",
    bgColor: "bg-orange-500/10",
  },
  {
    id: "badge10",
    name: "공방 골목대장",
    level: "advanced",
    levelLabel: "고급",
    description: "직접 창작하고 패키징한 도안을 도안 장터에 배포하여 1회 이상 내려받기를 획득했습니다.",
    imageSrc: assetUrl("/images/badge10.png"),
    color: "text-stone-700",
    bgColor: "bg-stone-500/10",
  },
  {
    id: "badge11",
    name: "한 땀의 예술가",
    level: "advanced",
    levelLabel: "고급",
    description: "에디터 플랫폼에서 기호와 배색을 완벽히 소화하여 누적 30,000코 이상을 떴습니다.",
    imageSrc: assetUrl("/images/badge11.png"),
    color: "text-violet-600",
    bgColor: "bg-violet-500/10",
  },
];

export function resolveAchievementBadgeId(
  id: string | null | undefined,
): AchievementBadgeId | null {
  if (!id) return null;
  if (id in LEGACY_BADGE_IDS) return LEGACY_BADGE_IDS[id];
  return ACHIEVEMENT_BADGES.some((badge) => badge.id === id)
    ? (id as AchievementBadgeId)
    : null;
}

export function getAchievementBadge(id: string | null | undefined): AchievementBadge | null {
  const resolved = resolveAchievementBadgeId(id);
  if (!resolved) return null;
  return ACHIEVEMENT_BADGES.find((badge) => badge.id === resolved) ?? null;
}
