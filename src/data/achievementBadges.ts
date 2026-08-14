import {
  Award,
  Compass,
  Flame,
  Sparkles,
  Target,
  Trophy,
  type LucideIcon,
} from "lucide-react";

export type AchievementBadgeId =
  | "first_stitch"
  | "frogger_conqueror"
  | "gauge_genius"
  | "color_collector"
  | "lounge_pioneer"
  | "tteuni_soulmate";

export type AchievementBadge = {
  id: AchievementBadgeId;
  name: string;
  level: "beginner" | "intermediate" | "advanced";
  levelLabel: string;
  description: string;
  icon: LucideIcon;
  color: string;
  bgColor: string;
};

export const ACHIEVEMENT_BADGES: AchievementBadge[] = [
  {
    id: "first_stitch",
    name: "첫 바늘의 설렘",
    level: "beginner",
    levelLabel: "초급",
    description: "뜨개 에디터에서 첫 번째 도안 패키징을 완료하여 뜨개 여행을 시작했습니다.",
    icon: Sparkles,
    color: "text-amber-600",
    bgColor: "bg-amber-500/10",
  },
  {
    id: "frogger_conqueror",
    name: "푸르시오 극복가",
    level: "beginner",
    levelLabel: "초급",
    description: "실수를 딛고 일어나 5,000코 이상 완성하며 푸르시오의 공포를 이겨냈습니다.",
    icon: Compass,
    color: "text-sky-600",
    bgColor: "bg-sky-500/10",
  },
  {
    id: "gauge_genius",
    name: "수학적 게이지 요정",
    level: "intermediate",
    levelLabel: "중급",
    description: "게이지 계산기에 손땀과 목표 길이를 대입해 콧수를 3회 이상 변환했습니다.",
    icon: Target,
    color: "text-emerald-600",
    bgColor: "bg-emerald-500/10",
  },
  {
    id: "color_collector",
    name: "빛깔 담는 컬렉터",
    level: "intermediate",
    levelLabel: "중급",
    description: "추천 컬러 조합 팔레트를 3회 이상 연동하여 조화로운 배색 도안을 그렸습니다.",
    icon: Award,
    color: "text-indigo-600",
    bgColor: "bg-indigo-500/10",
  },
  {
    id: "lounge_pioneer",
    name: "라운지 크리에이터",
    level: "advanced",
    levelLabel: "고급",
    description: "커뮤니티 피드에 완성한 옷의 이야기와 도안을 공유했습니다.",
    icon: Trophy,
    color: "text-rose-500",
    bgColor: "bg-rose-500/10",
  },
  {
    id: "tteuni_soulmate",
    name: "뜨니의 영혼의 단짝",
    level: "advanced",
    levelLabel: "고급",
    description: "대화형 프롬프트로 뜨니와 상호작용하며 도안을 10회 수정했습니다.",
    icon: Flame,
    color: "text-orange-500",
    bgColor: "bg-orange-500/10",
  },
];

export function getAchievementBadge(id: string | null | undefined): AchievementBadge | null {
  if (!id) return null;
  return ACHIEVEMENT_BADGES.find((badge) => badge.id === id) ?? null;
}
