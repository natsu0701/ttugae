const META_KEY = "ttugae.pattern.meta.v1";
export const PATTERN_META_CHANGED_EVENT = "ttugae:pattern-meta-changed";

export type PatternWorkStatus = "in-progress" | "completed";

export type PatternWorkMeta = {
  status: PatternWorkStatus;
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

export function loadPatternMetaMap(): Record<string, PatternWorkMeta> {
  const data = readJson<Record<string, PatternWorkMeta>>(META_KEY, {});
  return data && typeof data === "object" ? data : {};
}

export function getPatternStatus(patternId: string): PatternWorkStatus {
  return loadPatternMetaMap()[patternId]?.status ?? "in-progress";
}

export function setPatternStatus(patternId: string, status: PatternWorkStatus): void {
  const next = { ...loadPatternMetaMap(), [patternId]: { status } };
  localStorage.setItem(META_KEY, JSON.stringify(next));
  window.dispatchEvent(new Event(PATTERN_META_CHANGED_EVENT));
}
