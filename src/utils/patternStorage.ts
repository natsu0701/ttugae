import type { StoredPattern } from "../types/storedPattern.ts";

const STORAGE_KEY = "ttugae.patterns.v1";

export function loadStoredPatterns(): StoredPattern[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as StoredPattern[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveStoredPatterns(patterns: StoredPattern[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(patterns));
}
