import { memo, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ACHIEVEMENT_BADGES } from "../../data/achievementBadges.ts";
import {
  buildBadgeUnlocks,
  type KnitAchievementStats,
} from "./achievementStats.ts";

type FilterTab = "mine" | "all" | "beginner" | "intermediate" | "advanced";

export type KnitAchievementDashboardProps = KnitAchievementStats;

const NEXT_LEVEL_STITCHES = 20000;
const FILTER_TABS: { id: FilterTab; label: string }[] = [
  { id: "mine", label: "내 배지" },
  { id: "all", label: "전체 배지" },
  { id: "beginner", label: "초급 업적" },
  { id: "intermediate", label: "중급 업적" },
  { id: "advanced", label: "고급 업적" },
];

const LIST_EASE = { type: "spring" as const, stiffness: 320, damping: 28 };

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
}: KnitAchievementDashboardProps) {
  const [activeTab, setActiveTab] = useState<FilterTab>("mine");
  const growthPercentage = Math.min(100, Math.round((totalStitches / NEXT_LEVEL_STITCHES) * 100));
  const remaining = Math.max(0, NEXT_LEVEL_STITCHES - totalStitches);

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
    ],
  );

  const filteredBadges = ACHIEVEMENT_BADGES.filter((badge) => {
    const owned = Boolean(unlocks[badge.id]?.unlocked);
    if (activeTab === "mine") return owned;
    if (activeTab === "all") return true;
    return badge.level === activeTab;
  });

  return (
    <div className="w-full select-none rounded-[32px] border border-stone-200/40 bg-[#FFFBF7] p-6 shadow-[0_8px_30px_rgb(252,95,83,0.02)] md:p-8">
      <div className="mb-8 flex flex-col justify-between gap-4 border-b border-stone-200/40 pb-6 md:flex-row md:items-center">
        <div>
          <span className="rounded-full bg-coral/10 px-3.5 py-1 font-sans text-[10px] font-bold uppercase tracking-widest text-coral">
            Knitting Accomplishments
          </span>
          <h3 className="mt-2 font-sans text-xl font-black tracking-tight text-stone-900">
            개인형 뜨개 업적 대시보드
          </h3>
          <p className="mt-1 break-keep font-sans text-xs font-light text-stone-500">
            지금까지 수놓은 실과 기호 데이터를 바탕으로 성장 상태를 시각화합니다.
          </p>
        </div>
        <div className="flex flex-col justify-center rounded-2xl border border-stone-800 bg-stone-900 px-5 py-3.5 text-left text-stone-100 shadow-sm">
          <span className="font-sans text-[10px] font-medium uppercase tracking-wider text-stone-400">
            Current Tier
          </span>
          <span className="mt-0.5 font-sans text-sm font-bold text-stone-100">
            Level 3. 포근한 솜털 뜨개러
          </span>
        </div>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-stone-100 bg-white p-5 shadow-sm transition-shadow duration-300 hover:shadow-md">
          <span className="font-sans text-[11px] font-bold uppercase tracking-wider text-stone-400">
            총 완성 콧수
          </span>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="font-sans text-2xl font-black tracking-tight text-stone-900">
              {totalStitches.toLocaleString()}
            </span>
            <span className="font-sans text-xs font-medium text-stone-500">코</span>
          </div>
        </div>
        <div className="rounded-2xl border border-stone-100 bg-white p-5 shadow-sm transition-shadow duration-300 hover:shadow-md">
          <span className="font-sans text-[11px] font-bold uppercase tracking-wider text-stone-400">
            작품 완성 개수
          </span>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="font-sans text-2xl font-black tracking-tight text-stone-900">
              {completedProjects}
            </span>
            <span className="font-sans text-xs font-medium text-stone-500">개 작품</span>
          </div>
        </div>
        <div className="rounded-2xl border border-stone-100 bg-white p-5 shadow-sm transition-shadow duration-300 hover:shadow-md">
          <span className="font-sans text-[11px] font-bold uppercase tracking-wider text-stone-400">
            연속 뜨개 기록 일수
          </span>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="font-sans text-2xl font-black tracking-tight text-stone-900">
              {activeStreak}
            </span>
            <span className="font-sans text-xs font-medium text-stone-500">일 연속</span>
          </div>
        </div>
      </div>

      <div className="mb-8 rounded-2xl bg-[#FBF9F6] p-5">
        <p className="font-sans text-[11px] font-bold uppercase tracking-wider text-stone-400">
          오프라인 참여 증적
        </p>
        <p className="mt-2 font-sans text-sm font-bold text-stone-900">
          QR 입장 {offlineCheckins}회 · 진행 단 {currentProgressRow}단 보존
        </p>
        <p className="mt-1 font-seoyun text-xs text-stone-500">
          행사 신청 시 참여자 인덱스가 기록되고, 에디터 진행 단은 체크인 후에도 유지됩니다.
        </p>
      </div>

      <div className="mb-8 rounded-2xl border border-stone-100 bg-white p-6 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <span className="font-sans text-xs font-bold text-stone-700">
            다음 등급 (구름매듭 뜨개 장인) 달성 진척율
          </span>
          <span className="font-sans text-sm font-black tracking-tight text-coral">
            {growthPercentage}%
          </span>
        </div>
        <div className="relative h-4 w-full overflow-hidden rounded-full border border-stone-200/20 bg-stone-100">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${growthPercentage}%` }}
            transition={{ type: "spring", stiffness: 60, damping: 20, delay: 0.2 }}
            className="h-full rounded-full bg-coral"
          />
        </div>
        <div className="mt-3 flex items-center justify-between font-sans text-[11px] font-medium text-stone-400">
          <span>현재 {totalStitches.toLocaleString()}코 축적</span>
          <span>다음 등급 승급까지 {remaining.toLocaleString()}코 남음</span>
        </div>
      </div>

      <div className="mb-6">
        <h4 className="mb-4 font-sans text-xs font-black uppercase tracking-wider text-stone-400">
          뜨개 배지 현황
        </h4>
        <div className="flex flex-wrap gap-2 border-b border-stone-200/30 pb-4">
          {FILTER_TABS.map((tab) => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`rounded-xl px-4 py-2 font-sans text-xs font-bold transition-all ${
                  active
                    ? tab.id === "mine" || tab.id === "all"
                      ? "bg-stone-900 text-stone-100 shadow-sm"
                      : "bg-coral text-white shadow-sm"
                    : "bg-transparent text-stone-500 hover:bg-stone-100/60"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <AnimatePresence mode="popLayout">
          {filteredBadges.length === 0 ? (
            <p className="col-span-full py-8 text-center font-sans text-sm font-light text-stone-400">
              아직 획득한 배지가 없습니다.
            </p>
          ) : null}
          {filteredBadges.map((badge) => {
            const unlock = unlocks[badge.id];
            const isUnlocked = Boolean(unlock?.unlocked);
            return (
              <motion.div
                key={badge.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={LIST_EASE}
                className={`flex items-center gap-4 overflow-hidden rounded-2xl border p-4 transition-all duration-300 ${
                  isUnlocked
                    ? "border-stone-100 bg-white shadow-sm hover:shadow-md"
                    : "border-stone-200/40 bg-stone-50/50 opacity-70"
                }`}
              >
                <div
                  className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-xl border p-1.5 transition-colors ${
                    isUnlocked
                      ? "border-coral/20 bg-white shadow-sm shadow-coral/5"
                      : "border-stone-300/40 bg-stone-200/50"
                  }`}
                >
                  {isUnlocked ? (
                    <img
                      src={badge.imageSrc}
                      alt={badge.name}
                      className="h-full w-full object-contain"
                    />
                  ) : (
                    <img
                      src={badge.imageSrc}
                      alt=""
                      className="h-full w-full object-contain opacity-30 grayscale"
                    />
                  )}
                </div>
                <div className="flex min-w-0 flex-1 items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h5
                      className={`truncate font-sans text-sm font-bold ${
                        isUnlocked ? "text-stone-900" : "text-stone-500"
                      }`}
                    >
                      {badge.name}
                    </h5>
                    <p className="mt-1 break-keep font-sans text-xs font-light leading-relaxed text-stone-400/90">
                      {badge.description}
                    </p>
                    {!isUnlocked && unlock?.progressText ? (
                      <span className="mt-2 block font-sans text-[10px] font-bold text-stone-400">
                        진행 요건: {unlock.progressText}
                      </span>
                    ) : null}
                  </div>
                  <span
                    className={`shrink-0 rounded-md px-1.5 py-0.5 font-sans text-[9px] font-bold ${
                      badge.level === "beginner"
                        ? "bg-blue-50 text-blue-500"
                        : badge.level === "intermediate"
                          ? "bg-orange-50 text-orange-500"
                          : "bg-purple-50 text-purple-500"
                    }`}
                  >
                    {badge.levelLabel}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default memo(KnitAchievementDashboard);
