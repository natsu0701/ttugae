import { memo, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { getAchievementBadge } from "../../data/achievementBadges.ts";
import {
  loadEquippedBadgeId,
  subscribeEquippedBadge,
} from "../../utils/equippedBadgeStorage.ts";
import { badgeName } from "../../utils/i18nContent.ts";

const OWN_AUTHORS = new Set(["나", "뜨개러"]);

type EquippedAuthorChipProps = {
  author: string;
};

function EquippedAuthorChip({ author }: EquippedAuthorChipProps) {
  const { t } = useTranslation();
  const [badgeId, setBadgeId] = useState<string | null>(() => loadEquippedBadgeId());

  useEffect(() => subscribeEquippedBadge(setBadgeId), []);

  if (!OWN_AUTHORS.has(author)) return null;

  const badge = getAchievementBadge(badgeId);
  if (!badge) return null;

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border border-coral/10 px-2 py-0.5 font-sans text-2xs font-bold leading-none ${badge.bgColor} ${badge.color}`}
    >
      <img src={badge.imageSrc} alt="" className="h-[18px] w-[18px] object-contain" />
      <span>{badgeName(t, badge.id, badge.name)}</span>
    </span>
  );
}

export default memo(EquippedAuthorChip);
