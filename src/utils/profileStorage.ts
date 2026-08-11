const PROFILE_KEY = "ttugae.profile.v1";

export type ProfileData = {
  avatarUrl?: string;
};

export function loadProfile(): ProfileData {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as ProfileData;
  } catch {
    return {};
  }
}

export function saveProfileAvatar(avatarUrl: string): void {
  const prev = loadProfile();
  localStorage.setItem(PROFILE_KEY, JSON.stringify({ ...prev, avatarUrl }));
}
