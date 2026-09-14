import { memo, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ACHIEVEMENT_BADGES,
  type AchievementBadgeId,
} from "../../data/achievementBadges.ts";
import { CheckFillIcon, LockFillIcon } from "../icons/FillIcons.tsx";
import type { BadgeUnlockMap } from "../mypage/achievementStats.ts";
import { badgeDesc, badgeName } from "../../utils/i18nContent.ts";

export type ProfileBadgeCustomizerProps = {
  unlocks: BadgeUnlockMap;
  equippedBadgeId: string | null;
  onEquip: (id: string | null) => void;
};

type FilterTab = "owned" | "unowned";

const FILTER_TABS: { id: FilterTab; labelKey: string }[] = [
  { id: "owned", labelKey: "mypage.badgesOwned" },
  { id: "unowned", labelKey: "mypage.badgesUnowned" },
];

function isUnlocked(unlocks: BadgeUnlockMap, id: AchievementBadgeId): boolean {
  return Boolean(unlocks[id]?.unlocked);
}

function ProfileBadgeCustomizer({
  unlocks,
  equippedBadgeId,
  onEquip,
}: ProfileBadgeCustomizerProps) {
  const { t } = useTranslation();
  const [filter, setFilter] = useState<FilterTab>("owned");

  const filteredBadges = useMemo(
    () =>
      ACHIEVEMENT_BADGES.filter((item) => {
        const owned = isUnlocked(unlocks, item.id);
        return filter === "owned" ? owned : !owned;
      }),
    [filter, unlocks],
  );

  const handleEquip = (id: AchievementBadgeId) => {
    if (!isUnlocked(unlocks, id)) return;
    onEquip(equippedBadgeId === id ? null : id);
  };

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-2">
        {FILTER_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setFilter(tab.id)}
            className={`rounded-lg px-4 py-2 font-sans text-sm font-bold ${
              filter === tab.id ? "bg-stone-900 text-white" : "bg-stone-100 text-stone-500"
            }`}
          >
            {t(tab.labelKey)}
          </button>
        ))}
      </div>

      {filteredBadges.length === 0 ? (
        <p className="py-10 text-center font-sans text-base text-stone-400">{t("mypage.achEmpty")}</p>
      ) : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {filteredBadges.map((item) => {
            const unlocked = isUnlocked(unlocks, item.id);
            const isEquipped = equippedBadgeId === item.id && unlocked;
            const progressText = unlocks[item.id]?.progressText;
            const name = badgeName(t, item.id, item.name);
            const desc = badgeDesc(t, item.id, item.description);

            return (
              <button
                key={item.id}
                type="button"
                disabled={!unlocked}
                onClick={() => handleEquip(item.id)}
                className={`relative flex w-full items-center gap-4 rounded-xl border p-4 text-left ${
                  unlocked
                    ? isEquipped
                      ? "border-coral/50 bg-stone-50"
                      : "border-stone-100 bg-white hover:border-stone-200"
                    : "cursor-not-allowed border-stone-100 bg-stone-50/50 opacity-50"
                }`}
              >
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-stone-100 p-1.5">
                  {unlocked ? (
                    <img src={item.imageSrc} alt="" className="h-full w-full object-contain" />
                  ) : (
                    <LockFillIcon className="h-5 w-5 text-stone-400" />
                  )}
                </div>
                <div className="min-w-0 flex-1 pr-8">
                  <span className="block truncate font-sans text-sm font-bold leading-5 text-stone-900">
                    {name}
                  </span>
                  <p className="mt-1 line-clamp-2 font-sans text-sm leading-4 text-stone-400">
                    {unlocked ? desc : progressText ?? t("common.locked")}
                  </p>
                </div>
                {unlocked && isEquipped ? (
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-coral">
                    <CheckFillIcon className="h-4 w-4" />
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default memo(ProfileBadgeCustomizer);
