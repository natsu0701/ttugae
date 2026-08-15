const PROFILE_KEY = "ttugae.profile.v1";

export type ProfileData = {
  avatarUrl?: string;
  nickname?: string;
  handle?: string;
  email?: string;
};

export const DEFAULT_NICKNAME = "뜨개러";
export const DEFAULT_HANDLE = "뜨개러";
export const DEFAULT_EMAIL = "knitter@example.com";

export function loadProfile(): ProfileData {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as ProfileData;
  } catch {
    return {};
  }
}

function writeProfile(next: ProfileData): void {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(next));
}

export function saveProfileAvatar(avatarUrl: string): void {
  writeProfile({ ...loadProfile(), avatarUrl });
}

export function clearProfileAvatar(): void {
  const { avatarUrl: _removed, ...rest } = loadProfile();
  writeProfile(rest);
}

export function saveProfileAccount(patch: Pick<ProfileData, "nickname" | "handle" | "email">): void {
  writeProfile({ ...loadProfile(), ...patch });
}

export function clearProfile(): void {
  localStorage.removeItem(PROFILE_KEY);
}
