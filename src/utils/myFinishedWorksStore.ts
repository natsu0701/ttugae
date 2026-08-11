import {
  MY_FINISHED_WORKS,
  type MyFinishedWork,
} from "../data/myFinishedWorks.ts";

const STORAGE_KEY = "ttugae.finished.v1";
const UPDATED_EVENT = "ttugae:finished-updated";

export { UPDATED_EVENT as MY_FINISHED_UPDATED_EVENT };

function readRaw(): MyFinishedWork[] | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as MyFinishedWork[];
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function loadMyFinishedWorks(): MyFinishedWork[] {
  const stored = readRaw();
  if (stored) return stored;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(MY_FINISHED_WORKS));
  return [...MY_FINISHED_WORKS];
}

function persist(works: MyFinishedWork[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(works));
  window.dispatchEvent(new Event(UPDATED_EVENT));
}

export function saveMyFinishedWorks(works: MyFinishedWork[]): void {
  persist(works);
}

export function deleteMyFinishedWork(id: string): void {
  persist(loadMyFinishedWorks().filter((w) => w.id !== id));
}

export function upsertMyFinishedWork(work: MyFinishedWork): void {
  const list = loadMyFinishedWorks();
  const idx = list.findIndex((w) => w.id === work.id);
  if (idx >= 0) list[idx] = work;
  else list.unshift(work);
  persist(list);
}
