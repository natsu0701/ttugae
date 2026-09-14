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
  BrushFillIcon,
  CalendarFillIcon,
  HeartFillIcon,
  ImageFillIcon,
  PatternsFillIcon,
  StatsFillIcon,
} from "../icons/FillIcons.tsx";
import { formatKnitDuration } from "../../utils/knittingLogStorage.ts";
import { resolveKnitLevel } from "../../utils/knitLevel.ts";
import type { StoredPattern } from "../../types/storedPattern.ts";

type FilterTab = "owned" | "unowned";

export type KnitAchievementDashboardProps = KnitAchievementStats & {
  knitMinutes?: number;
  likedCount?: number;
  savedCount?: number;
  patternCount?: number;
  patterns?: StoredPattern[];
};

const FILTER_TABS: { id: FilterTab; labelKey: string }[] = [
  { id: "owned", labelKey: "mypage.badgesOwned" },
  { id: "unowned", labelKey: "mypage.badgesUnowned" },
];

const MONTH_KEYS = [
  "mypage.month1",
  "mypage.month2",
  "mypage.month3",
  "mypage.month4",
  "mypage.month5",
  "mypage.month6",
] as const;

const DEMO_COLOR_USAGE = [
  { nameKey: "mypage.colorCoral", hex: "#FC5F53", percent: 32 },
  { nameKey: "mypage.colorBeige", hex: "#E8DCC8", percent: 24 },
  { nameKey: "mypage.colorNavy", hex: "#1E3A5F", percent: 18 },
  { nameKey: "mypage.colorGray", hex: "#E5E7EB", percent: 14 },
  { nameKey: "mypage.colorOther", hex: "#9CA3AF", percent: 12 },
];

const DEMO_MONTHLY = [2, 4, 1, 6, 3, 5];

function KnitAchievementDashboard({
  totalStitches,
  completedProjects,
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
  patterns = [],
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

  const monthlyData = useMemo(() => {
    const now = new Date();
    return MONTH_KEYS.map((key, i) => {
      const monthIndex = now.getMonth() - (MONTH_KEYS.length - 1 - i);
      const adjusted = new Date(now.getFullYear(), monthIndex, 1);
      const count = patterns.filter((p) => {
        const d = new Date(p.updatedAt);
        return d.getMonth() === adjusted.getMonth() && d.getFullYear() === adjusted.getFullYear();
      }).length;
      return { label: t(key), value: count > 0 ? count : DEMO_MONTHLY[i] ?? 1 };
    });
  }, [patterns, t]);

  const maxMonthly = Math.max(...monthlyData.map((d) => d.value), 1);

  const summaryItems = [
    { icon: PatternsFillIcon, label: t("mypage.profile.statPatterns"), value: patternCount || activeProjectCount },
    { icon: HeartFillIcon, label: t("mypage.profile.statHearts"), value: likedCount },
    { icon: ImageFillIcon, label: t("mypage.profile.statFinished"), value: finishedCount ?? completedProjects },
    { icon: BookmarkFillIcon, label: t("mypage.profile.statSaved"), value: savedCount },
    { icon: StatsFillIcon, label: t("mypage.achStitches"), value: totalStitches.toLocaleString() },
    { icon: CalendarFillIcon, label: t("mypage.timeTitle"), value: t("mypage.timeValue", { hours: duration.hours, mins: duration.mins }) },
  ];

  return (
    <div className="w-full space-y-6">
      <div className="rounded-xl border border-stone-200 bg-white p-6">
        <h3 className="text-title text-stone-900">{t("mypage.achTitle")}</h3>
        <p className="mt-2 text-body leading-6 text-stone-500">{t("mypage.achSubtitle")}</p>
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {summaryItems.map((item) => (
            <div key={item.label} className="rounded-xl bg-stone-50 px-4 py-4">
              <item.icon className="h-5 w-5 text-coral" />
              <p className="mt-3 font-sans text-sm leading-5 text-stone-500">{item.label}</p>
              <p className="mt-1.5 font-sans text-xl font-bold leading-7 text-stone-900">{item.value}</p>
            </div>
          ))}
        </div>
        <div className="mt-5">
          <div className="mb-2 flex justify-between gap-3 text-sm leading-5">
            <span>{t("mypage.level.next", { remaining: level.remaining.toLocaleString() })}</span>
            <span className="shrink-0 text-coral">{level.progress}%</span>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-stone-100">
            <div className="h-full rounded-full bg-coral" style={{ width: `${level.progress}%` }} />
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-stone-200 bg-white p-6">
        <div className="flex items-center gap-2">
          <StatsFillIcon className="h-5 w-5 text-coral" />
          <h4 className="font-sans text-base font-bold text-stone-900">{t("mypage.statsMonthly")}</h4>
        </div>
        <p className="mt-2 font-sans text-sm leading-5 text-stone-400">{t("mypage.statsMonthlyHint")}</p>
        <div className="mt-4 flex h-40 items-end justify-between gap-2">
          {monthlyData.map((item) => {
            const height = maxMonthly > 0 ? (item.value / maxMonthly) * 100 : 0;
            return (
              <div key={item.label} className="flex min-w-0 flex-1 flex-col items-center gap-2">
                <span className="font-sans text-sm font-bold text-coral">{item.value}</span>
                <div className="flex h-24 w-full items-end justify-center">
                  <div
                    className="w-full max-w-[2.5rem] rounded-t-xl bg-coral"
                    style={{ height: `${Math.max(height, 8)}%` }}
                  />
                </div>
                <span className="font-seoyun text-sm leading-4 text-gray-500">{item.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="rounded-xl border border-stone-200 bg-white p-6">
        <div className="flex items-center gap-2">
          <BrushFillIcon className="h-5 w-5 text-coral" />
          <h4 className="font-sans text-base font-bold text-stone-900">{t("mypage.statsColors")}</h4>
        </div>
        <p className="mt-2 font-sans text-sm leading-5 text-stone-400">{t("mypage.statsColorsHint")}</p>
        <ul className="mt-5 space-y-4">
          {DEMO_COLOR_USAGE.map((color) => (
            <li key={color.nameKey}>
              <div className="mb-1.5 flex items-center justify-between gap-3">
                <span className="flex items-center gap-2 font-sans text-base leading-5 text-gray-800">
                  <span
                    className="h-4 w-4 shrink-0 rounded-full"
                    style={{ backgroundColor: color.hex }}
                  />
                  {t(color.nameKey)}
                </span>
                <span className="font-sans text-base font-bold text-coral">{color.percent}%</span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-gray-100">
                <div className="h-full rounded-full bg-coral" style={{ width: `${color.percent}%` }} />
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-xl border border-stone-200 bg-white p-6">
        <h4 className="mb-4 font-sans text-sm font-black uppercase tracking-wider text-stone-400">
          {t("mypage.achBadgeStatus")}
        </h4>
        <div className="mb-4 flex flex-wrap gap-2">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`rounded-lg px-4 py-2 font-sans text-sm font-bold ${
                activeTab === tab.id ? "bg-stone-900 text-white" : "bg-stone-100 text-stone-500"
              }`}
            >
              {t(tab.labelKey)}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {filteredBadges.length === 0 ? (
            <p className="col-span-full py-8 text-center text-base text-stone-400">{t("mypage.achEmpty")}</p>
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
                    <h5 className="truncate text-base font-bold leading-5">{badgeName(t, badge.id, badge.name)}</h5>
                    <p className="mt-1.5 text-sm leading-5 text-stone-400">{badgeDesc(t, badge.id, badge.description)}</p>
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
