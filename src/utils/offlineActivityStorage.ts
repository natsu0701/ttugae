import type {
  AttachedPatternData,
  EventReview,
  KnittingMeetup,
} from "../data/offlineCommunity.ts";
import {
  AREA_REGION_PREFIX,
  DEFAULT_ACTIVITY_AREA,
  DEFAULT_ACTIVITY_REGION,
  KNITTING_MEETUPS,
  SEED_EVENT_REVIEWS,
  meetupRegionScore,
  parseActivityRegion,
} from "../data/offlineCommunity.ts";
import { loadProfile, saveProfileRegion } from "./profileStorage.ts";
import { backupProgressRowOnCheckin } from "./editorProgressStorage.ts";

const MEETUP_STORE_KEY = "meetup_store";
const RESERVED_KEY = "reserved_meetups";
const MY_RESERVED_KEY = "my_reserved_meetups";
const TICKETS_KEY = "ttugae.offline.tickets.v1";
const REVIEWS_KEY = "ttugae.offline.reviews.v1";
const REGION_KEY = "ttugae.offline.activityRegion.v1";
const AREA_KEY = "ttugae.offline.activityArea.v1";
const LEGACY_JOINED_KEY = "ttugae.offline.meetups.joined.v1";
const LEGACY_CUSTOM_KEY = "ttugae.offline.meetups.custom.v1";
const PARTICIPANTS_KEY = "ttugae.offline.participants.v1";
const PORTFOLIO_KEY = "ttugae.offline.goodsPortfolio.v1";

export const OFFLINE_UPDATED_EVENT = "ttugae-offline-updated";
export const MEETUP_RESERVATION_EVENT = "meetupReservationChanged";

export type OfflineTicket = {
  eventId: string;
  ticketCode: string;
  payload: string;
  issuedAt: number;
  participantIndex: number;
  goods: string[];
  progressRow: number;
};

export type OfflineParticipant = {
  eventId: string;
  userId: string;
  index: number;
  ticketCode: string;
  checkedInAt: number;
};

export type GoodsPortfolioEntry = {
  eventId: string;
  ticketCode: string;
  goods: string[];
  collectedAt: number;
};

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown) {
  localStorage.setItem(key, JSON.stringify(value));
  window.dispatchEvent(new Event(OFFLINE_UPDATED_EVENT));
}

export function currentUserId() {
  const profile = loadProfile();
  return profile.handle?.trim() || profile.nickname?.trim() || "ttugae-user";
}

function encodeTicketPayload(eventId: string, userId: string) {
  const query = `e=${encodeURIComponent(eventId)}&u=${encodeURIComponent(userId)}&t=${Date.now()}`;
  const token = btoa(unescape(encodeURIComponent(query))).replace(/=+$/, "");
  return `ttg://checkin?q=${token}`;
}

type LooseMeetup = KnittingMeetup & {
  id?: string;
  area?: string;
  needleNote?: string;
  yarnNote?: string;
  capacity?: number;
  seededJoined?: number;
};

export function normalizeMeetup(raw: LooseMeetup): KnittingMeetup {
  const meetupId = raw.meetupId || raw.id || `mt-${Date.now()}`;
  const region =
    raw.region ||
    (raw.area ? `${AREA_REGION_PREFIX[raw.area] ?? `서울시 ${raw.area}`}` : DEFAULT_ACTIVITY_REGION);
  return {
    meetupId,
    title: raw.title,
    region,
    requiredNeedle: raw.requiredNeedle || raw.needleNote || "바늘 자유",
    requiredYarn: raw.requiredYarn || raw.yarnNote || "실 자유",
    maxCapacity: raw.maxCapacity ?? raw.capacity ?? 4,
    currentMembers: raw.currentMembers ?? raw.seededJoined ?? 0,
    memberIds: Array.isArray(raw.memberIds) ? raw.memberIds : [],
    place: raw.place,
    datetime: raw.datetime,
    prep: raw.prep,
    custom: raw.custom,
  };
}

function seedMeetups(): KnittingMeetup[] {
  const legacyCustom = readJson<LooseMeetup[]>(LEGACY_CUSTOM_KEY, []);
  const extras = Array.isArray(legacyCustom) ? legacyCustom.map(normalizeMeetup) : [];
  return [...extras, ...KNITTING_MEETUPS.map(normalizeMeetup)];
}

export function loadMeetupStore(): KnittingMeetup[] {
  const stored = readJson<LooseMeetup[]>(MEETUP_STORE_KEY, []);
  if (!Array.isArray(stored) || stored.length === 0) {
    const seeded = seedMeetups();
    localStorage.setItem(MEETUP_STORE_KEY, JSON.stringify(seeded));
    return seeded;
  }
  const normalized = stored.map(normalizeMeetup);
  const ids = new Set(normalized.map((item) => item.meetupId));
  const missing = KNITTING_MEETUPS.filter((item) => !ids.has(item.meetupId));
  if (missing.length === 0) return normalized;
  const next = [...normalized, ...missing];
  localStorage.setItem(MEETUP_STORE_KEY, JSON.stringify(next));
  return next;
}

function saveMeetupStore(list: KnittingMeetup[]) {
  writeJson(MEETUP_STORE_KEY, list);
}

export function allMeetups(): KnittingMeetup[] {
  return loadMeetupStore();
}

export function meetupsNearRegion(region: string): KnittingMeetup[] {
  return [...loadMeetupStore()].sort(
    (a, b) => meetupRegionScore(a, region) - meetupRegionScore(b, region),
  );
}

export function loadReservedMeetupIds(): string[] {
  const reserved = readJson<string[]>(RESERVED_KEY, []);
  const mine = readJson<string[]>(MY_RESERVED_KEY, []);
  const legacy = readJson<string[]>(LEGACY_JOINED_KEY, []);
  const merged = Array.from(
    new Set([
      ...(Array.isArray(reserved) ? reserved : []),
      ...(Array.isArray(mine) ? mine : []),
      ...(Array.isArray(legacy) ? legacy : []),
    ]),
  );
  return merged;
}

function persistReservedIds(ids: string[]) {
  writeJson(RESERVED_KEY, ids);
  writeJson(MY_RESERVED_KEY, ids);
  window.dispatchEvent(new Event(MEETUP_RESERVATION_EVENT));
}

export function toggleReservedMeetup(meetupId: string, join: boolean): string[] {
  const next = join
    ? Array.from(new Set([...loadReservedMeetupIds(), meetupId]))
    : loadReservedMeetupIds().filter((id) => id !== meetupId);
  persistReservedIds(next);
  return next;
}

export function isMeetupJoined(meetupId: string): boolean {
  const userId = currentUserId();
  const meetup = loadMeetupStore().find((item) => item.meetupId === meetupId);
  if (meetup?.memberIds.includes(userId)) return true;
  return loadReservedMeetupIds().includes(meetupId);
}

export function joinMeetup(meetupId: string): boolean {
  const userId = currentUserId();
  const store = loadMeetupStore();
  const index = store.findIndex((item) => item.meetupId === meetupId);
  if (index < 0) return false;
  const meetup = store[index];
  if (meetup.memberIds.includes(userId) || loadReservedMeetupIds().includes(meetupId)) {
    persistReservedIds(Array.from(new Set([...loadReservedMeetupIds(), meetupId])));
    return true;
  }
  if (meetup.currentMembers >= meetup.maxCapacity) return false;
  store[index] = {
    ...meetup,
    memberIds: [...meetup.memberIds, userId],
    currentMembers: meetup.currentMembers + 1,
  };
  saveMeetupStore(store);
  persistReservedIds(Array.from(new Set([...loadReservedMeetupIds(), meetupId])));
  return true;
}

export function saveCustomMeetup(meetup: KnittingMeetup): KnittingMeetup[] {
  const next = [normalizeMeetup(meetup), ...loadMeetupStore()];
  saveMeetupStore(next);
  persistReservedIds(Array.from(new Set([...loadReservedMeetupIds(), meetup.meetupId])));
  return next;
}

export function meetupJoinedCount(meetup: KnittingMeetup): number {
  return Math.min(meetup.maxCapacity, meetup.currentMembers);
}

export function loadTickets(): OfflineTicket[] {
  const list = readJson<OfflineTicket[]>(TICKETS_KEY, []);
  if (!Array.isArray(list)) return [];
  return list.map((ticket) => ({
    ...ticket,
    payload: ticket.payload || ticket.ticketCode,
    goods: Array.isArray(ticket.goods) ? ticket.goods : [],
    participantIndex: ticket.participantIndex ?? 1,
    progressRow: typeof ticket.progressRow === "number" ? ticket.progressRow : 0,
  }));
}

export function getTicket(eventId: string): OfflineTicket | undefined {
  return loadTickets().find((ticket) => ticket.eventId === eventId);
}

export function loadParticipants(): OfflineParticipant[] {
  const list = readJson<OfflineParticipant[]>(PARTICIPANTS_KEY, []);
  return Array.isArray(list) ? list : [];
}

export function loadGoodsPortfolio(): GoodsPortfolioEntry[] {
  const list = readJson<GoodsPortfolioEntry[]>(PORTFOLIO_KEY, []);
  return Array.isArray(list) ? list : [];
}

export function issueTicket(eventId: string, goods: string[] = []): OfflineTicket {
  const existing = getTicket(eventId);
  if (existing) return existing;
  const userId = currentUserId();
  const progressRow = backupProgressRowOnCheckin();
  const participantIndex = loadParticipants().length + 1;
  const payload = encodeTicketPayload(eventId, userId);
  const ticket: OfflineTicket = {
    eventId,
    ticketCode: `TTG-${eventId.replace(/[^a-z0-9]/gi, "").slice(0, 6).toUpperCase()}-${Date.now().toString(36).toUpperCase()}`,
    payload,
    issuedAt: Date.now(),
    participantIndex,
    goods,
    progressRow,
  };
  writeJson(TICKETS_KEY, [ticket, ...loadTickets()]);
  writeJson(PARTICIPANTS_KEY, [
    {
      eventId,
      userId,
      index: participantIndex,
      ticketCode: ticket.ticketCode,
      checkedInAt: ticket.issuedAt,
    },
    ...loadParticipants(),
  ]);
  if (goods.length > 0) {
    writeJson(PORTFOLIO_KEY, [
      {
        eventId,
        ticketCode: ticket.ticketCode,
        goods,
        collectedAt: ticket.issuedAt,
      },
      ...loadGoodsPortfolio(),
    ]);
  }
  return ticket;
}

function normalizeReview(raw: EventReview & { attachedPattern?: AttachedPatternData & { grid?: AttachedPatternData["gridCells"] } }): EventReview {
  const attached =
    raw.attachedPatternData ??
    (raw.attachedPattern
      ? {
          id: raw.attachedPattern.id,
          title: raw.attachedPattern.title,
          gridCols: raw.attachedPattern.gridCols ?? raw.attachedPattern.gridCells?.[0]?.length ?? 1,
          gridRows: raw.attachedPattern.gridRows ?? raw.attachedPattern.gridCells?.length ?? 1,
          gridCells: raw.attachedPattern.gridCells ?? raw.attachedPattern.grid ?? [],
          colorMap: raw.attachedPattern.colorMap,
          needle: raw.attachedPattern.needle,
        }
      : undefined);
  return {
    id: raw.id,
    eventId: raw.eventId,
    author: raw.author,
    body: raw.body,
    photoUrl: raw.photoUrl,
    createdAt: raw.createdAt,
    attachedPatternData: attached?.gridCells?.length ? attached : undefined,
  };
}

export function loadUserReviews(): EventReview[] {
  const list = readJson<EventReview[]>(REVIEWS_KEY, []);
  return Array.isArray(list) ? list.map((item) => normalizeReview(item)) : [];
}

export function allEventReviews(): EventReview[] {
  return [...loadUserReviews(), ...SEED_EVENT_REVIEWS].sort((a, b) => b.createdAt - a.createdAt);
}

export function saveEventReview(review: EventReview): EventReview[] {
  const next = [normalizeReview(review), ...loadUserReviews()];
  writeJson(REVIEWS_KEY, next);
  return next;
}

export function loadJoinedMeetups(): KnittingMeetup[] {
  const ids = new Set(loadReservedMeetupIds());
  const userId = currentUserId();
  return loadMeetupStore().filter(
    (meetup) => ids.has(meetup.meetupId) || meetup.memberIds.includes(userId),
  );
}

export function loadActivityRegion(): string {
  const region = readJson<string>(REGION_KEY, "");
  if (typeof region === "string" && region.trim()) return region;
  const area = readJson<string>(AREA_KEY, "");
  if (typeof area === "string" && area.trim()) {
    return AREA_REGION_PREFIX[area] ?? `${area}`;
  }
  const profileRegion = loadProfile().region;
  if (profileRegion?.trim()) return profileRegion.trim();
  return DEFAULT_ACTIVITY_REGION;
}

export function loadActivityArea(): string {
  return parseActivityRegion(loadActivityRegion()).area || DEFAULT_ACTIVITY_AREA;
}

export function saveActivityRegion(region: string) {
  const parsed = parseActivityRegion(region);
  writeJson(REGION_KEY, parsed.raw);
  writeJson(AREA_KEY, parsed.area);
  saveProfileRegion(parsed.raw);
}

export function saveActivityArea(area: string) {
  const current = parseActivityRegion(loadActivityRegion());
  const prefix = AREA_REGION_PREFIX[area] ?? `서울시 ${area}`;
  const next = current.dong ? `${prefix} ${current.dong}` : prefix;
  saveActivityRegion(next);
}
