export const YARN_TRAIL_KEY = "yarn_trail_enabled";
export const YARN_TRAIL_EVENT = "yarnTrailChanged";

export function loadYarnTrailEnabled(): boolean {
  try {
    return localStorage.getItem(YARN_TRAIL_KEY) !== "false";
  } catch {
    return true;
  }
}

export function saveYarnTrailEnabled(enabled: boolean): void {
  localStorage.setItem(YARN_TRAIL_KEY, String(enabled));
  window.dispatchEvent(new Event(YARN_TRAIL_EVENT));
}

export function subscribeYarnTrail(onChange: (enabled: boolean) => void): () => void {
  const handleChange = () => onChange(loadYarnTrailEnabled());
  const handleStorage = (e: StorageEvent) => {
    if (e.key === YARN_TRAIL_KEY || e.key === null) handleChange();
  };
  window.addEventListener(YARN_TRAIL_EVENT, handleChange);
  window.addEventListener("storage", handleStorage);
  return () => {
    window.removeEventListener(YARN_TRAIL_EVENT, handleChange);
    window.removeEventListener("storage", handleStorage);
  };
}
