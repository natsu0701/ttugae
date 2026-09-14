const COLLECTION_KEY = "ttugae.pattern.collections.v1";
const ASSIGN_KEY = "ttugae.pattern.collectionAssign.v1";
export const COLLECTIONS_CHANGED_EVENT = "ttugae:collections-changed";

export const UNFILED_COLLECTION_ID = "unfiled";

export type PatternCollection = {
  id: string;
  name: string;
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

function emit() {
  window.dispatchEvent(new Event(COLLECTIONS_CHANGED_EVENT));
}

export function loadCollections(): PatternCollection[] {
  const list = readJson<PatternCollection[]>(COLLECTION_KEY, []);
  return Array.isArray(list) ? list : [];
}

export function saveCollections(list: PatternCollection[]): void {
  localStorage.setItem(COLLECTION_KEY, JSON.stringify(list));
  emit();
}

export function addCollection(name: string): PatternCollection {
  const trimmed = name.trim() || "새 컬렉션";
  const next: PatternCollection = {
    id: `col-${Date.now()}`,
    name: trimmed,
  };
  saveCollections([...loadCollections(), next]);
  return next;
}

export function renameCollection(id: string, name: string): void {
  const trimmed = name.trim();
  if (!trimmed) return;
  saveCollections(
    loadCollections().map((item) => (item.id === id ? { ...item, name: trimmed } : item)),
  );
}

export function deleteCollection(id: string): void {
  saveCollections(loadCollections().filter((item) => item.id !== id));
  const assign = loadCollectionAssignments();
  const next = { ...assign };
  for (const [patternId, collectionId] of Object.entries(next)) {
    if (collectionId === id) delete next[patternId];
  }
  saveCollectionAssignments(next);
}

export function loadCollectionAssignments(): Record<string, string> {
  const data = readJson<Record<string, string>>(ASSIGN_KEY, {});
  return data && typeof data === "object" ? data : {};
}

export function saveCollectionAssignments(map: Record<string, string>): void {
  localStorage.setItem(ASSIGN_KEY, JSON.stringify(map));
  emit();
}

export function assignPatternCollection(patternId: string, collectionId: string | null): void {
  const next = { ...loadCollectionAssignments() };
  if (!collectionId || collectionId === UNFILED_COLLECTION_ID) {
    delete next[patternId];
  } else {
    next[patternId] = collectionId;
  }
  saveCollectionAssignments(next);
}

export function collectionIdForPattern(patternId: string): string {
  return loadCollectionAssignments()[patternId] ?? UNFILED_COLLECTION_ID;
}
