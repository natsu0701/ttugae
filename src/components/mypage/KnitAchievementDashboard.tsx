import { memo, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { ACHIEVEMENT_BADGES } from "../../data/achievementBadges.ts";
import {
  buildBadgeUnlocks,
  type KnitAchievementStats,
} from "./achievementStats.ts";
import { badgeDesc, badgeName } from "../../utils/i18nContent.ts";
import {
  BookmarkFillIcon,
  HeartFillIcon,
  ImageFillIcon,
  PatternsFillIcon,
} from "../icons/FillIcons.tsx";
import { formatKnitDuration } from "../../utils/knittingLogStorage.ts";
import { resolveKnitLevel } from "../../utils/knitLevel.ts";

type FilterTab = "owned" | "unowned";

export type KnitAchievementDashboardProps = KnitAchievementStats & {
  knitMinutes?: number;
  likedCount?: number;
  savedCount?: number;
  patternCount?: number;
};

const FILTER_TABS: { id: FilterTab; labelKey: string }[] = [
  { id: "owned", labelKey: "mypage.badgesOwned" },
  { id: "unowned", labelKey: "mypage.badgesUnowned" },
];

function KnitAchievementDashboard({
  totalStitches,
  completedProjects,
  activeStreak = 12,
  hasPackagedPattern = false,
  gaugeConversions = 0,
  colorPaletteUses = 0,
  hasSharedLoungePost = false,
  tteuniChats = 0,
  activeProjectCount = 0,
  yarnInventoryCount = 0,
  marketplaceDownloads = 0,
  finishedCount,
  hasOfflineCheckin = false,
  offlineCheckins = 0,
  currentProgressRow = 0,
  knitMinutes = 0,
  likedCount = 0,
  savedCount = 0,
  patternCount = 0,
}: KnitAchievementDashboardProps) {
  const { t, i18n } = useTranslation();
  const [activeTab, setActiveTab] = useState<FilterTab>("owned");
  const level = resolveKnitLevel(totalStitches);
  const duration = formatKnitDuration(knitMinutes);

  const unlocks = useMemo(
    () =>
      buildBadgeUnlocks({
        totalStitches,
        completedProjects,
        hasPackagedPattern,
        gaugeConversions,
        colorPaletteUses,
        hasSharedLoungePost,
        tteuniChats,
        activeProjectCount,
        yarnInventoryCount,
        marketplaceDownloads,
        finishedCount,
        hasOfflineCheckin,
        offlineCheckins,
        currentProgressRow,
      }),
    [
      totalStitches,
      completedProjects,
      hasPackagedPattern,
      gaugeConversions,
      colorPaletteUses,
      hasSharedLoungePost,
      tteuniChats,
      activeProjectCount,
      yarnInventoryCount,
      marketplaceDownloads,
      finishedCount,
      hasOfflineCheckin,
      offlineCheckins,
      currentProgressRow,
      i18n.language,
    ],
  );

  const filteredBadges = ACHIEVEMENT_BADGES.filter((badge) => {
    const owned = Boolean(unlocks[badge.id]?.unlocked);
    return activeTab === "owned" ? owned : !owned;
  });

  const summaryItems = [
    { icon: PatternsFillIcon, label: t("mypage.profile.statPatterns"), value: patternCount || activeProjectCount },
    { icon: HeartFillIcon, label: t("mypage.profile.statHearts"), value: likedCount },
    { icon: ImageFillIcon, label: t("mypage.profile.statFinished"), value: finishedCount ?? completedProjects },
    { icon: BookmarkFillIcon, label: t("mypage.profile.statSaved"), value: savedCount },
  ];

  return (
    <div className="w-full space-y-6">
      <div className="rounded-xl border border-stone-200 bg-white p-6">
        <h3 className="text-title text-stone-900">{t("mypage.achTitle")}</h3>
        <p className="mt-1 text-body text-stone-500">{t("mypage.achSubtitle")}</p>
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {summaryItems.map((item) => (
            <div key={item.label} className="rounded-xl bg-stone-50 p-4">
              <item.icon className="h-5 w-5 text-coral" />
              <p className="mt-2 font-sans text-xs text-stone-500">{item.label}</p>
              <p className="mt-1 font-sans text-xl font-bold text-stone-900">{item.value}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-stone-100 p-4">
            <p className="text-xs text-stone-400">{t("mypage.achStitches")}</p>
            <p className="mt-1 text-xl font-black">{totalStitches.toLocaleString()}</p>
          </div>
          <div className="rounded-xl border border-stone-100 p-4">
            <p className="text-xs text-stone-400">{t("mypage.achStreak")}</p>
            <p className="mt-1 text-xl font-black">{activeStreak}</p>
          </div>
          <div className="rounded-xl border border-stone-100 p-4">
            <p className="text-xs text-stone-400">{t("mypage.timeTitle")}</p>
            <p className="mt-1 text-xl font-black">
              {t("mypage.timeValue", { hours: duration.hours, mins: duration.mins })}
            </p>
          </div>
        </div>
        <div className="mt-5">
          <div className="mb-2 flex justify-between text-xs">
            <span>{t("mypage.level.next", { remaining: level.remaining.toLocaleString() })}</span>
            <span className="text-coral">{level.progress}%</span>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-stone-100">
            <div className="h-full rounded-full bg-coral" style={{ width: `${level.progress}%` }} />
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-stone-200 bg-white p-6">
        <h4 className="mb-4 font-sans text-xs font-black uppercase tracking-wider text-stone-400">
          {t("mypage.achBadgeStatus")}
        </h4>
        <div className="mb-4 flex flex-wrap gap-2">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`rounded-lg px-4 py-2 font-sans text-xs font-bold ${
                activeTab === tab.id ? "bg-stone-900 text-white" : "bg-stone-100 text-stone-500"
              }`}
            >
              {t(tab.labelKey)}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {filteredBadges.length === 0 ? (
            <p className="col-span-full py-8 text-center text-sm text-stone-400">{t("mypage.achEmpty")}</p>
          ) : (
            filteredBadges.map((badge) => {
              const unlock = unlocks[badge.id];
              const isUnlocked = Boolean(unlock?.unlocked);
              return (
                <div
                  key={badge.id}
                  className={`flex items-center gap-4 rounded-xl border p-4 ${
                    isUnlocked ? "border-stone-100 bg-white" : "border-stone-200 bg-stone-50 opacity-70"
                  }`}
                >
                  <img src={badge.imageSrc} alt="" className={`h-16 w-16 object-contain ${isUnlocked ? "" : "grayscale"}`} />
                  <div className="min-w-0">
                    <h5 className="truncate text-sm font-bold">{badgeName(t, badge.id, badge.name)}</h5>
                    <p className="mt-1 text-xs text-stone-400">{badgeDesc(t, badge.id, badge.description)}</p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

export default memo(KnitAchievementDashboard);
