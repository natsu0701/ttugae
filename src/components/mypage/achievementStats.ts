import type { StoredPattern } from "../../Dashboard.tsx";
import type { AchievementBadgeId } from "../../data/achievementBadges.ts";
import { loadMyFinishedWorks } from "../../utils/myFinishedWorksStore.ts";
import { loadSharedCommunityPatterns } from "../../utils/communityShare.ts";
import { loadGaugeProfile, loadYarnInventory } from "../../utils/personalizationStorage.ts";

export type BadgeUnlockEntry = {
  unlocked: boolean;
  progressText?: string;
};

export type BadgeUnlockMap = Partial<Record<AchievementBadgeId, BadgeUnlockEntry>>;

export type KnitAchievementStats = {
  totalStitches: number;
  completedProjects: number;
  activeStreak?: number;
  hasPackagedPattern?: boolean;
  gaugeConversions?: number;
  colorPaletteUses?: number;
  hasSharedLoungePost?: boolean;
  tteuniChats?: number;
  activeProjectCount?: number;
  yarnInventoryCount?: number;
  marketplaceDownloads?: number;
  finishedCount?: number;
};

export function computeAchievementStats(patterns: StoredPattern[]): KnitAchievementStats {
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
  const yarnCount = loadYarnInventory().length;
  const totalStitches = computedStitches > 0 ? computedStitches : 12450;
  const completedProjects = finishedWorks.length > 0 ? finishedWorks.length : 8;

  return {
    totalStitches,
    completedProjects,
    activeStreak: 12,
    hasPackagedPattern: patterns.length > 0,
    gaugeConversions: gaugeFilled ? 3 : 0,
    colorPaletteUses: Math.min(3, Math.max(0, patterns.length)),
    hasSharedLoungePost: sharedMine.length > 0,
    tteuniChats: Math.min(10, patterns.length * 2),
    activeProjectCount: patterns.length,
    yarnInventoryCount: yarnCount,
    marketplaceDownloads: sharedMine.length,
    finishedCount: finishedWorks.length > 0 ? finishedWorks.length : completedProjects,
  };
}

export function buildBadgeUnlocks(stats: KnitAchievementStats): BadgeUnlockMap {
  const stitches = stats.totalStitches;
  const gauge = stats.gaugeConversions ?? 0;
  const palettes = stats.colorPaletteUses ?? 0;
  const chats = stats.tteuniChats ?? 0;
  const projects = stats.activeProjectCount ?? 0;
  const yarns = stats.yarnInventoryCount ?? 0;
  const downloads = stats.marketplaceDownloads ?? 0;
  const finished = stats.finishedCount ?? stats.completedProjects;

  return {
    badge1: { unlocked: Boolean(stats.hasPackagedPattern) },
    badge2: {
      unlocked: stitches >= 5000,
      progressText: stitches >= 5000 ? undefined : `${stitches.toLocaleString()} / 5,000 코`,
    },
    badge3: {
      unlocked: finished >= 1,
      progressText: finished >= 1 ? undefined : `${finished} / 1 완료`,
    },
    badge4: {
      unlocked: gauge >= 3,
      progressText: gauge >= 3 ? undefined : `${gauge} / 3 완료`,
    },
    badge5: {
      unlocked: palettes >= 3,
      progressText: palettes >= 3 ? undefined : `${palettes} / 3 완료`,
    },
    badge6: {
      unlocked: projects >= 3,
      progressText: projects >= 3 ? undefined : `${projects} / 3 완료`,
    },
    badge7: {
      unlocked: yarns >= 5,
      progressText: yarns >= 5 ? undefined : `${yarns} / 5 완료`,
    },
    badge8: { unlocked: Boolean(stats.hasSharedLoungePost) },
    badge9: {
      unlocked: chats >= 10,
      progressText: chats >= 10 ? undefined : `${chats} / 10 완료`,
    },
    badge10: {
      unlocked: downloads >= 1,
      progressText: downloads >= 1 ? undefined : `${downloads} / 1 완료`,
    },
    badge11: {
      unlocked: stitches >= 30000,
      progressText: stitches >= 30000 ? undefined : `${stitches.toLocaleString()} / 30,000코`,
    },
  };
}
