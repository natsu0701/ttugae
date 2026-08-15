import {
  getAchievementBadge,
  resolveAchievementBadgeId,
  type AchievementBadge,
} from "../data/achievementBadges.ts";

export const EQUIPPED_BADGE_KEY = "equipped_badge_id";
export const EQUIPPED_BADGE_EVENT = "ttugae:equipped-badge-changed";

export function loadEquippedBadgeId(): string | null {
  try {
    const raw = localStorage.getItem(EQUIPPED_BADGE_KEY);
    if (!raw || raw === "none") return null;
    return resolveAchievementBadgeId(raw);
  } catch {
    return null;
  }
}

export function saveEquippedBadgeId(id: string | null): void {
  const value = id ?? "none";
  localStorage.setItem(EQUIPPED_BADGE_KEY, value);
  window.dispatchEvent(new CustomEvent(EQUIPPED_BADGE_EVENT, { detail: { id } }));
}

export function loadEquippedBadge(): AchievementBadge | null {
  return getAchievementBadge(loadEquippedBadgeId());
}

export function subscribeEquippedBadge(onChange: (id: string | null) => void): () => void {
  const handleCustom = (e: Event) => {
    const detail = (e as CustomEvent<{ id: string | null }>).detail;
    onChange(detail?.id ?? loadEquippedBadgeId());
  };
  const handleStorage = (e: StorageEvent) => {
    if (e.key === EQUIPPED_BADGE_KEY) onChange(loadEquippedBadgeId());
  };
  window.addEventListener(EQUIPPED_BADGE_EVENT, handleCustom);
  window.addEventListener("storage", handleStorage);
  return () => {
    window.removeEventListener(EQUIPPED_BADGE_EVENT, handleCustom);
    window.removeEventListener("storage", handleStorage);
  };
}
