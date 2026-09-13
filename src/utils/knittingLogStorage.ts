import type { StoredPattern } from "../types/storedPattern.ts";
import { loadMyFinishedWorks } from "./myFinishedWorksStore.ts";
import { loadJoinedMeetups } from "./offlineActivityStorage.ts";
import { ACHIEVEMENT_BADGES } from "../data/achievementBadges.ts";

const TIME_KEY = "ttugae.knit.minutes.v1";
const BADGE_DATES_KEY = "ttugae.badge.dates.v1";

export type KnitCalendarKind = "finished" | "badge" | "meetup";

export type KnitCalendarEvent = {
  date: string;
  kind: KnitCalendarKind;
  title: string;
};

function isoDate(value: string | number | Date): string {
  if (typeof value === "string" && /^\d{4}\.\d{2}\.\d{2}$/.test(value)) {
    return value.replace(/\./g, "-");
  }
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  }
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function loadKnitMinutes(patterns: StoredPattern[] = []): number {
  try {
    const raw = localStorage.getItem(TIME_KEY);
    if (raw) {
      const n = Number(raw);
      if (Number.isFinite(n) && n > 0) return n;
    }
  } catch {
    // ignore
  }
  const stitches = patterns.reduce((sum, pattern) => {
    const rows = pattern.grid?.length ?? 0;
    const cols = pattern.grid?.[0]?.length ?? pattern.gridSize ?? 0;
    return sum + rows * cols;
  }, 0);
  return Math.max(180, Math.round(stitches / 8) + loadJoinedMeetups().length * 90);
}

export function saveKnitMinutes(minutes: number) {
  localStorage.setItem(TIME_KEY, String(Math.max(0, Math.round(minutes))));
}

export function formatKnitDuration(minutes: number): { hours: number; mins: number } {
  return { hours: Math.floor(minutes / 60), mins: minutes % 60 };
}

export function loadKnitCalendarEvents(patterns: StoredPattern[] = []): KnitCalendarEvent[] {
  const events: KnitCalendarEvent[] = [];
  for (const work of loadMyFinishedWorks()) {
    events.push({ date: isoDate(work.completedAt), kind: "finished", title: work.title });
  }
  for (const meetup of loadJoinedMeetups()) {
    if (meetup.datetime) {
      events.push({ date: isoDate(meetup.datetime), kind: "meetup", title: meetup.title });
    }
  }
  try {
    const raw = localStorage.getItem(BADGE_DATES_KEY);
    const dates = raw ? (JSON.parse(raw) as Record<string, string>) : {};
    for (const badge of ACHIEVEMENT_BADGES) {
      if (dates[badge.id]) {
        events.push({ date: dates[badge.id], kind: "badge", title: badge.name });
      }
    }
  } catch {
    // ignore
  }
  if (events.length === 0 && patterns[0]) {
    events.push({
      date: isoDate(patterns[0].updatedAt),
      kind: "finished",
      title: patterns[0].title,
    });
  }
  return events;
}

export function stampBadgeDate(badgeId: string) {
  try {
    const raw = localStorage.getItem(BADGE_DATES_KEY);
    const dates = raw ? (JSON.parse(raw) as Record<string, string>) : {};
    if (dates[badgeId]) return;
    dates[badgeId] = isoDate(Date.now());
    localStorage.setItem(BADGE_DATES_KEY, JSON.stringify(dates));
  } catch {
    // ignore
  }
}
