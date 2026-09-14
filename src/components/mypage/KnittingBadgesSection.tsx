import { memo, useMemo } from "react";
import { useTranslation } from "react-i18next";
import type { StoredPattern } from "../../types/storedPattern.ts";
import { softShadow } from "../ui/tabButtonStyles.ts";

type BadgeDef = {
  id: string;
  labelKey: string;
  descKey: string;
  icon: string;
};

const BADGES: BadgeDef[] = [
  {
    id: "first-pattern",
    labelKey: "mypage.titleFirst",
    descKey: "mypage.titleFirstDesc",
    icon: "Y",
  },
  {
    id: "stitches-100",
    labelKey: "mypage.title100",
    descKey: "mypage.title100Desc",
    icon: "B",
  },
  {
    id: "popular",
    labelKey: "mypage.titlePopular",
    descKey: "mypage.titlePopularDesc",
    icon: "S",
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
  const { t } = useTranslation();
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
      <h3 className="font-sans text-base font-bold text-gray-900">{t("mypage.titlesTitle")}</h3>
      <p className="mt-1 font-seoyun text-sm font-normal text-gray-500">
        {t("mypage.titlesHint")}
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
              <p className="mt-3 font-sans text-base font-bold">{t(badge.labelKey)}</p>
              <p
                className={`mt-1 font-seoyun text-sm font-normal ${
                  isOn ? "text-white/85" : "text-gray-400"
                }`}
              >
                {isOn ? t("common.achieved") : t(badge.descKey)}
              </p>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export default memo(KnittingBadgesSection);
