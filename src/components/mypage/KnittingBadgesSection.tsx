import { memo, useMemo } from "react";
import type { StoredPattern } from "../../Dashboard.tsx";
import { softShadow } from "../ui/tabButtonStyles.ts";

type BadgeDef = {
  id: string;
  label: string;
  description: string;
  icon: string;
};

const BADGES: BadgeDef[] = [
  {
    id: "first-pattern",
    label: "첫 도안 완성",
    description: "도안 1개 이상 저장",
    icon: "🧶",
  },
  {
    id: "stitches-100",
    label: "100코 달성",
    description: "누적 100코 이상",
    icon: "🏅",
  },
  {
    id: "popular",
    label: "인기 뜨개러",
    description: "좋아요 3개 이상",
    icon: "⭐",
  },
];

function countTotalStitches(patterns: StoredPattern[]): number {
  return patterns.reduce((sum, p) => {
    const rows = p.grid?.length ?? 0;
    const cols = p.grid?.[0]?.length ?? p.gridSize ?? 0;
    return sum + rows * cols;
  }, 0);
}

type KnittingBadgesSectionProps = {
  patterns: StoredPattern[];
  likedCount: number;
};

function KnittingBadgesSection({ patterns, likedCount }: KnittingBadgesSectionProps) {
  const totalStitches = useMemo(() => countTotalStitches(patterns), [patterns]);

  const unlocked = useMemo(
    () => ({
      "first-pattern": patterns.length >= 1,
      "stitches-100": totalStitches >= 100,
      popular: likedCount >= 3,
    }),
    [patterns.length, totalStitches, likedCount],
  );

  return (
    <section className={`rounded-2xl bg-white p-6 ${softShadow}`}>
      <h3 className="font-sans text-base font-bold text-gray-900">나의 뜨개 칭호</h3>
      <p className="mt-1 font-seoyun text-xs font-normal text-gray-500">
        활동에 따라 뱃지가 잠금 해제돼요
      </p>

      <ul className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {BADGES.map((badge) => {
          const isOn = unlocked[badge.id as keyof typeof unlocked];
          return (
            <li
              key={badge.id}
              className={`flex flex-col items-center rounded-2xl px-4 py-5 text-center transition-colors ${
                isOn ? "bg-coral text-white" : "bg-gray-200 text-gray-400"
              }`}
            >
              <span
                className={`flex h-14 w-14 items-center justify-center rounded-full text-2xl ${
                  isOn ? "bg-white/20" : "bg-gray-100"
                }`}
                aria-hidden
              >
                {badge.icon}
              </span>
              <p className="mt-3 font-sans text-sm font-bold">{badge.label}</p>
              <p
                className={`mt-1 font-seoyun text-[11px] font-normal ${
                  isOn ? "text-white/85" : "text-gray-400"
                }`}
              >
                {isOn ? "달성!" : badge.description}
              </p>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export default memo(KnittingBadgesSection);
