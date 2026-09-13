import { currentUserHandle } from "./identity.ts";

const ATTEND_KEY = "ttugae.meetup.attendance.v1";
const DIARY_KEY = "ttugae.meetup.diary.v1";
export const MEETUP_EXTRA_EVENT = "ttugae:meetup-extra";

export type MeetupDiaryEntry = {
  id: string;
  meetupId: string;
  author: string;
  body: string;
  photoUrl?: string;
  createdAt: number;
};

function emit() {
  window.dispatchEvent(new Event(MEETUP_EXTRA_EVENT));
}

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function attendancePayload(meetupId: string): string {
  const origin = window.location.origin;
  const base = import.meta.env.BASE_URL.replace(/\/$/, "");
  return `${origin}${base}/community/attend/${encodeURIComponent(meetupId)}`;
}

export function qrImageUrl(data: string): string {
  return `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(data)}`;
}

export function loadAttendance(meetupId: string): string[] {
  const map = readJson<Record<string, string[]>>(ATTEND_KEY, {});
  return Array.isArray(map[meetupId]) ? map[meetupId] : [];
}

export function isCheckedIn(meetupId: string, handle = currentUserHandle()): boolean {
  return loadAttendance(meetupId).includes(handle);
}

export function checkInMeetup(meetupId: string, handle = currentUserHandle()): boolean {
  const map = readJson<Record<string, string[]>>(ATTEND_KEY, {});
  const list = Array.isArray(map[meetupId]) ? map[meetupId] : [];
  if (list.includes(handle)) return false;
  map[meetupId] = [...list, handle];
  localStorage.setItem(ATTEND_KEY, JSON.stringify(map));
  emit();
  return true;
}

export function loadMeetupDiaries(meetupId: string): MeetupDiaryEntry[] {
  const list = readJson<MeetupDiaryEntry[]>(DIARY_KEY, []);
  return list
    .filter((item) => item.meetupId === meetupId)
    .sort((a, b) => b.createdAt - a.createdAt);
}

export function saveMeetupDiary(entry: Omit<MeetupDiaryEntry, "id" | "createdAt" | "author">) {
  const list = readJson<MeetupDiaryEntry[]>(DIARY_KEY, []);
  const next: MeetupDiaryEntry = {
    ...entry,
    id: `dy-${Date.now()}`,
    author: currentUserHandle(),
    createdAt: Date.now(),
  };
  localStorage.setItem(DIARY_KEY, JSON.stringify([next, ...list]));
  emit();
  return next;
}

export function isMeetupHost(meetup: { custom?: boolean; memberIds?: string[] }, handle = currentUserHandle()) {
  if (meetup.custom && meetup.memberIds?.[0] === handle) return true;
  return meetup.custom === true && (meetup.memberIds?.includes(handle) ?? false) && meetup.memberIds?.[0] === handle;
}
