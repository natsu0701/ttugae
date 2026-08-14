import { useMemo } from "react";
import type { StoredPattern } from "../../Dashboard.tsx";
import { softShadow } from "../ui/tabButtonStyles.ts";
import KnitAchievementDashboard from "./KnitAchievementDashboard.tsx";
import { loadMyFinishedWorks } from "../../utils/myFinishedWorksStore.ts";
import { loadSharedCommunityPatterns } from "../../utils/communityShare.ts";
import { loadGaugeProfile } from "../../utils/personalizationStorage.ts";

const MONTH_LABELS = ["1월", "2월", "3월", "4월", "5월", "6월"];

const DEMO_COLOR_USAGE = [
  { name: "코랄", hex: "#FC5F53", percent: 32 },
  { name: "베이지", hex: "#E8DCC8", percent: 24 },
  { name: "네이비", hex: "#1E3A5F", percent: 18 },
  { name: "그레이", hex: "#E5E7EB", percent: 14 },
  { name: "기타", hex: "#9CA3AF", percent: 12 },
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
            <span className="font-sans text-xs font-bold text-coral">{item.value}</span>
            <div className="flex w-full justify-center">
              <div
                className="w-full max-w-[2.5rem] rounded-t-xl bg-coral transition-all duration-500"
                style={{ height: `${Math.max(height, 8)}%` }}
              />
            </div>
            <span className="font-rounded text-[10px] font-normal text-gray-500">
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
  const monthlyData = useMemo(() => {
    const now = new Date();
    return MONTH_LABELS.map((label, i) => {
      const monthIndex = now.getMonth() - (MONTH_LABELS.length - 1 - i);
      const adjusted = new Date(now.getFullYear(), monthIndex, 1);
      const count = patterns.filter((p) => {
        const d = new Date(p.updatedAt);
        return d.getMonth() === adjusted.getMonth() && d.getFullYear() === adjusted.getFullYear();
      }).length;
      const demo = [2, 4, 1, 6, 3, patterns.length || 5][i] ?? 1;
      return { label, value: count > 0 ? count : demo };
    });
  }, [patterns]);

  const maxMonthly = Math.max(...monthlyData.map((d) => d.value), 1);

  const achievementStats = useMemo(() => {
    const computedStitches = patterns.reduce((sum, p) => {
      const rows = p.grid?.length ?? 0;
      const cols = p.grid?.[0]?.length ?? p.gridSize ?? 0;
      return sum + rows * cols;
    }, 0);
    const finishedWorks = loadMyFinishedWorks();
    const sharedMine = loadSharedCommunityPatterns().filter((p) => p.author === "나");
    const gauge = loadGaugeProfile();
    const gaugeFilled = Boolean(
      gauge && (gauge.beforeSts || gauge.afterSts || gauge.beforeRows || gauge.afterRows),
    );

    return {
      totalStitches: computedStitches > 0 ? computedStitches : 12450,
      completedProjects: finishedWorks.length > 0 ? finishedWorks.length : 8,
      activeStreak: 12,
      hasPackagedPattern: patterns.length > 0,
      gaugeConversions: gaugeFilled ? 3 : 0,
      colorPaletteUses: Math.min(3, Math.max(0, patterns.length)),
      hasSharedLoungePost: sharedMine.length > 0,
      tteuniChats: Math.min(10, patterns.length * 2),
    };
  }, [patterns]);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-sans text-2xl font-bold text-gray-900">통계</h2>
        <p className="mt-1 font-sans text-sm font-normal text-gray-600">
          나의 뜨개 활동을 그래프로 확인해요.
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
        <h3 className="font-sans text-base font-bold text-gray-900">월별 도안 생성 추이</h3>
        <p className="mt-1 font-rounded text-xs font-normal text-gray-500">
          최근 6개월 기준
        </p>
        <BarChart data={monthlyData} maxValue={maxMonthly} />
      </div>

      <div className={`rounded-2xl bg-white p-6 ${softShadow}`}>
        <h3 className="font-sans text-base font-bold text-gray-900">가장 많이 사용한 색상</h3>
        <p className="mt-1 font-rounded text-xs font-normal text-gray-500">
          전체 도안 기준 비율
        </p>
        <ul className="mt-6 space-y-4">
          {DEMO_COLOR_USAGE.map((color) => (
            <li key={color.name}>
              <div className="mb-1.5 flex items-center justify-between">
                <span className="flex items-center gap-2 font-sans text-sm font-normal text-gray-800">
                  <span
                    className="h-4 w-4 rounded-full shadow-sm shadow-gray-200/50"
                    style={{ backgroundColor: color.hex }}
                  />
                  {color.name}
                </span>
                <span className="font-sans text-sm font-bold text-coral">{color.percent}%</span>
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
          { label: "작성 도안", value: patterns.length },
          { label: "좋아요", value: likedCount },
          { label: "저장", value: savedCount },
          { label: "완성작", value: 3 },
        ].map((s) => (
          <div key={s.label} className={`rounded-2xl bg-gray-50 p-4 text-center ${softShadow}`}>
            <p className="font-sans text-xs font-normal text-gray-500">{s.label}</p>
            <p className="mt-1 font-sans text-2xl font-bold text-gray-900">{s.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
