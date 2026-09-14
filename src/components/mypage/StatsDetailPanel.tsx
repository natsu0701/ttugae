import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import type { StoredPattern } from "../../types/storedPattern.ts";
import { softShadow } from "../ui/tabButtonStyles.ts";
import KnitAchievementDashboard from "./KnitAchievementDashboard.tsx";
import { computeAchievementStats } from "./achievementStats.ts";

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

type StatsDetailPanelProps = {
  patterns: StoredPattern[];
  likedCount: number;
  savedCount: number;
};

function BarChart({
  data,
  maxValue,
}: {
  data: { label: string; value: number }[];
  maxValue: number;
}) {
  return (
    <div className="flex h-40 items-end justify-between gap-2 pt-4">
      {data.map((item) => {
        const height = maxValue > 0 ? (item.value / maxValue) * 100 : 0;
        return (
          <div key={item.label} className="flex min-w-0 flex-1 flex-col items-center gap-2">
            <span className="font-sans text-sm font-bold text-coral">{item.value}</span>
            <div className="flex w-full justify-center">
              <div
                className="w-full max-w-[2.5rem] rounded-t-xl bg-coral transition-all duration-500"
                style={{ height: `${Math.max(height, 8)}%` }}
              />
            </div>
            <span className="font-seoyun text-sm font-normal text-gray-500">
              {item.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export default function StatsDetailPanel({
  patterns,
  likedCount,
  savedCount,
}: StatsDetailPanelProps) {
  const { t } = useTranslation();
  const monthlyData = useMemo(() => {
    const now = new Date();
    return MONTH_KEYS.map((key, i) => {
      const monthIndex = now.getMonth() - (MONTH_KEYS.length - 1 - i);
      const adjusted = new Date(now.getFullYear(), monthIndex, 1);
      const count = patterns.filter((p) => {
        const d = new Date(p.updatedAt);
        return d.getMonth() === adjusted.getMonth() && d.getFullYear() === adjusted.getFullYear();
      }).length;
      const demo = [2, 4, 1, 6, 3, patterns.length || 5][i] ?? 1;
      return { label: t(key), value: count > 0 ? count : demo };
    });
  }, [patterns, t]);

  const maxMonthly = Math.max(...monthlyData.map((d) => d.value), 1);

  const achievementStats = useMemo(() => computeAchievementStats(patterns), [patterns]);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-sans text-2xl font-bold text-gray-900">{t("mypage.statsPageTitle")}</h2>
        <p className="mt-1 font-sans text-base font-normal text-gray-600">
          {t("mypage.statsPageHint")}
        </p>
      </div>

      <KnitAchievementDashboard
        totalStitches={achievementStats.totalStitches}
        completedProjects={achievementStats.completedProjects}
        activeStreak={achievementStats.activeStreak}
        hasPackagedPattern={achievementStats.hasPackagedPattern}
        gaugeConversions={achievementStats.gaugeConversions}
        colorPaletteUses={achievementStats.colorPaletteUses}
        hasSharedLoungePost={achievementStats.hasSharedLoungePost}
        tteuniChats={achievementStats.tteuniChats}
      />

      <div className={`rounded-2xl bg-white p-6 ${softShadow}`}>
        <h3 className="font-sans text-base font-bold text-gray-900">{t("mypage.statsMonthly")}</h3>
        <p className="mt-1 font-seoyun text-sm font-normal text-gray-500">
          {t("mypage.statsMonthlyHint")}
        </p>
        <BarChart data={monthlyData} maxValue={maxMonthly} />
      </div>

      <div className={`rounded-2xl bg-white p-6 ${softShadow}`}>
        <h3 className="font-sans text-base font-bold text-gray-900">{t("mypage.statsColors")}</h3>
        <p className="mt-1 font-seoyun text-sm font-normal text-gray-500">
          {t("mypage.statsColorsHint")}
        </p>
        <ul className="mt-6 space-y-4">
          {DEMO_COLOR_USAGE.map((color) => (
            <li key={color.nameKey}>
              <div className="mb-1.5 flex items-center justify-between">
                <span className="flex items-center gap-2 font-sans text-base font-normal text-gray-800">
                  <span
                    className="h-4 w-4 rounded-full shadow-sm shadow-gray-200/50"
                    style={{ backgroundColor: color.hex }}
                  />
                  {t(color.nameKey)}
                </span>
                <span className="font-sans text-base font-bold text-coral">{color.percent}%</span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-gray-100">
                <div
                  className="h-full rounded-full bg-coral transition-all duration-500"
                  style={{ width: `${color.percent}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: t("mypage.statsMade"), value: patterns.length },
          { label: t("mypage.statsLikes"), value: likedCount },
          { label: t("mypage.statsSaves"), value: savedCount },
          { label: t("mypage.statsFinished"), value: 3 },
        ].map((s) => (
          <div key={s.label} className={`rounded-2xl bg-gray-50 p-4 text-center ${softShadow}`}>
            <p className="font-sans text-sm font-normal text-gray-500">{s.label}</p>
            <p className="mt-1 font-sans text-2xl font-bold text-gray-900">{s.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
