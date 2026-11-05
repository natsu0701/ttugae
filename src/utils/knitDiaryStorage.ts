import type { MyFinishedWork } from "../data/myFinishedWorks.ts";
import { loadMyFinishedWorks } from "./myFinishedWorksStore.ts";

const STORAGE_KEY = "ttugae.knit.diary.v1";
export const KNIT_DIARY_UPDATED_EVENT = "ttugae:knit-diary-updated";

export type KnitDiaryMaterial = {
  id: string;
  label: string;
};

export type KnitDiary = {
  workId: string;
  rowsToday: number;
  minutesToday: number;
  materials: KnitDiaryMaterial[];
  memo: string;
  photos: string[];
  startedAt: string;
  totalRows: number;
};

type DiaryMap = Record<string, KnitDiary>;

function shiftDate(dotDate: string, days: number): string {
  const match = dotDate.match(/^(\d{4})\.(\d{2})\.(\d{2})$/);
  const date = match
    ? new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]))
    : new Date();
  date.setDate(date.getDate() + days);
  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, "0")}.${String(date.getDate()).padStart(2, "0")}`;
}

function seedFor(work: MyFinishedWork): KnitDiary {
  const seeds: Record<string, Partial<KnitDiary>> = {
    "fw-1": {
      rowsToday: 12,
      minutesToday: 45,
      materials: [
        { id: "m-yarn", label: "메리노 울 100%" },
        { id: "m-needle", label: "4.5mm" },
      ],
      totalRows: 80,
    },
    "fw-2": {
      rowsToday: 18,
      minutesToday: 60,
      materials: [
        { id: "m-yarn", label: "알파카 실 2합" },
        { id: "m-needle", label: "5mm 바늘" },
      ],
      totalRows: 40,
    },
    "fw-3": {
      rowsToday: 6,
      minutesToday: 25,
      materials: [{ id: "m-yarn", label: "남은 실뭉치" }],
      totalRows: 20,
    },
  };
  const extra = seeds[work.id] ?? {};
  return {
    workId: work.id,
    rowsToday: extra.rowsToday ?? 8,
    minutesToday: extra.minutesToday ?? 30,
    materials: extra.materials ?? [],
    memo: extra.memo ?? work.caption,
    photos: extra.photos ?? (work.image ? [work.image] : []),
    startedAt: extra.startedAt ?? shiftDate(work.completedAt, -14),
    totalRows: extra.totalRows ?? 80,
  };
}

function readMap(): DiaryMap {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as DiaryMap;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function persist(map: DiaryMap) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  window.dispatchEvent(new Event(KNIT_DIARY_UPDATED_EVENT));
}

export function defaultDiaryForWork(work: MyFinishedWork): KnitDiary {
  return seedFor(work);
}

export function loadKnitDiary(workId: string): KnitDiary | null {
  const stored = readMap()[workId];
  if (stored) return stored;
  const work = loadMyFinishedWorks().find((item) => item.id === workId);
  return work ? seedFor(work) : null;
}

export function saveKnitDiary(diary: KnitDiary): void {
  const map = readMap();
  map[diary.workId] = diary;
  persist(map);
}
