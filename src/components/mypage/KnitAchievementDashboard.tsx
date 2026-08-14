import { memo, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Award,
  Compass,
  Flame,
  Sparkles,
  Target,
  Trophy,
  type LucideIcon,
} from "lucide-react";

type BadgeLevel = "beginner" | "intermediate" | "advanced";
type FilterTab = "all" | BadgeLevel;

type BadgeItem = {
  id: string;
  name: string;
  level: BadgeLevel;
  levelLabel: string;
  description: string;
  isUnlocked: boolean;
  progressText?: string;
  icon: LucideIcon;
};

export type KnitAchievementDashboardProps = {
  totalStitches: number;
  completedProjects: number;
  activeStreak?: number;
  hasPackagedPattern?: boolean;
  gaugeConversions?: number;
  colorPaletteUses?: number;
  hasSharedLoungePost?: boolean;
  tteuniChats?: number;
};

const NEXT_LEVEL_STITCHES = 20000;
const FILTER_TABS: { id: FilterTab; label: string }[] = [
  { id: "all", label: "전체 배지" },
  { id: "beginner", label: "초급 업적" },
  { id: "intermediate", label: "중급 업적" },
  { id: "advanced", label: "고급 업적" },
];

const LIST_EASE = { type: "spring" as const, stiffness: 320, damping: 28 };

function buildBadges(stats: {
  totalStitches: number;
  hasPackagedPattern: boolean;
  gaugeConversions: number;
  colorPaletteUses: number;
  hasSharedLoungePost: boolean;
  tteuniChats: number;
}): BadgeItem[] {
  return [
    {
      id: "first_stitch",
      name: "첫 바늘의 설렘",
      level: "beginner",
      levelLabel: "초급",
      description: "뜨개 에디터에서 첫 번째 도안 패키징을 완료하여 뜨개 여행을 시작했습니다.",
      isUnlocked: stats.hasPackagedPattern,
      icon: Sparkles,
    },
    {
      id: "frogger_conqueror",
      name: "푸르시오 극복가",
      level: "beginner",
      levelLabel: "초급",
      description: "실수를 딛고 일어나 5,000코 이상 완성하며 푸르시오의 공포를 이겨냈습니다.",
      isUnlocked: stats.totalStitches >= 5000,
      progressText: stats.totalStitches >= 5000 ? undefined : `${stats.totalStitches.toLocaleString()} / 5,000 코`,
      icon: Compass,
    },
    {
      id: "gauge_genius",
      name: "수학적 게이지 요정",
      level: "intermediate",
      levelLabel: "중급",
      description: "게이지 계산기에 손땀과 목표 길이를 대입해 콧수를 3회 이상 변환했습니다.",
      isUnlocked: stats.gaugeConversions >= 3,
      progressText: stats.gaugeConversions >= 3 ? undefined : `${stats.gaugeConversions} / 3 완료`,
      icon: Target,
    },
    {
      id: "color_collector",
      name: "빛깔 담는 컬렉터",
      level: "intermediate",
      levelLabel: "중급",
      description: "추천 컬러 조합 팔레트를 3회 이상 연동하여 조화로운 배색 도안을 그렸습니다.",
      isUnlocked: stats.colorPaletteUses >= 3,
      progressText: stats.colorPaletteUses >= 3 ? undefined : `${stats.colorPaletteUses} / 3 완료`,
      icon: Award,
    },
    {
      id: "lounge_pioneer",
      name: "라운지 크리에이터",
      level: "advanced",
      levelLabel: "고급",
      description: "커뮤니티 피드에 완성한 옷의 이야기와 도안을 공유했습니다.",
      isUnlocked: stats.hasSharedLoungePost,
      icon: Trophy,
    },
    {
      id: "tteuni_soulmate",
      name: "뜨니의 영혼의 단짝",
      level: "advanced",
      levelLabel: "고급",
      description: "대화형 프롬프트로 뜨니와 상호작용하며 도안을 10회 수정했습니다.",
      isUnlocked: stats.tteuniChats >= 10,
      progressText: stats.tteuniChats >= 10 ? undefined : `${stats.tteuniChats} / 10 완료`,
      icon: Flame,
    },
  ];
}

function KnitAchievementDashboard({
  totalStitches,
  completedProjects,
  activeStreak = 12,
  hasPackagedPattern = false,
  gaugeConversions = 0,
  colorPaletteUses = 0,
  hasSharedLoungePost = false,
  tteuniChats = 0,
}: KnitAchievementDashboardProps) {
  const [activeTab, setActiveTab] = useState<FilterTab>("all");
  const growthPercentage = Math.min(100, Math.round((totalStitches / NEXT_LEVEL_STITCHES) * 100));
  const remaining = Math.max(0, NEXT_LEVEL_STITCHES - totalStitches);

  const badges = useMemo(
    () =>
      buildBadges({
        totalStitches,
        hasPackagedPattern,
        gaugeConversions,
        colorPaletteUses,
        hasSharedLoungePost,
        tteuniChats,
      }),
    [
      totalStitches,
      hasPackagedPattern,
      gaugeConversions,
      colorPaletteUses,
      hasSharedLoungePost,
      tteuniChats,
    ],
  );

  const filteredBadges = badges.filter((badge) =>
    activeTab === "all" ? true : badge.level === activeTab,
  );

  return (
    <div className="w-full select-none rounded-[32px] border border-stone-200/50 bg-[#FFFBF7] p-6 shadow-[0_12px_40px_rgba(0,0,0,0.015)] md:p-8">
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
          숙련도별 맞춤 뜨개 배지 현황
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
                    ? tab.id === "all"
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
          {filteredBadges.map((badge) => {
            const IconComponent = badge.icon;
            return (
              <motion.div
                key={badge.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={LIST_EASE}
                className={`relative flex gap-4 overflow-hidden rounded-2xl border p-4 transition-all duration-300 ${
                  badge.isUnlocked
                    ? "border-stone-100 bg-white shadow-sm hover:shadow-md"
                    : "border-stone-200/40 bg-stone-50/50 opacity-70"
                }`}
              >
                <span
                  className={`absolute right-3 top-2 rounded-md px-1.5 py-0.5 font-sans text-[9px] font-bold ${
                    badge.level === "beginner"
                      ? "bg-blue-50 text-blue-500"
                      : badge.level === "intermediate"
                        ? "bg-orange-50 text-orange-500"
                        : "bg-purple-50 text-purple-500"
                  }`}
                >
                  {badge.levelLabel}
                </span>
                <div
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border transition-colors ${
                    badge.isUnlocked
                      ? "border-coral/20 bg-coral/10 text-coral shadow-sm shadow-coral/5"
                      : "border-stone-300/40 bg-stone-200/50 text-stone-400"
                  }`}
                >
                  <IconComponent size={22} strokeWidth={1.8} />
                </div>
                <div className="flex min-w-0 flex-1 flex-col justify-center pt-1">
                  <h5
                    className={`truncate font-sans text-sm font-bold ${
                      badge.isUnlocked ? "text-stone-900" : "text-stone-500"
                    }`}
                  >
                    {badge.name}
                  </h5>
                  <p className="mt-1 max-w-[90%] break-keep font-sans text-xs font-light leading-relaxed text-stone-400/90">
                    {badge.description}
                  </p>
                  {!badge.isUnlocked && badge.progressText ? (
                    <span className="mt-2 block font-sans text-[10px] font-bold text-stone-400">
                      진행 요건: {badge.progressText}
                    </span>
                  ) : null}
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
