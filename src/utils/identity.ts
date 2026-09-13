import { DEFAULT_HANDLE, DEFAULT_NICKNAME, loadProfile } from "./profileStorage.ts";
import { loadActiveAccount } from "./accountStorage.ts";

export function currentUserHandle(): string {
  const account = loadActiveAccount();
  const profile = loadProfile();
  const handle = account?.handle || profile.handle || DEFAULT_HANDLE;
  return handle.replace(/^@/, "").trim() || DEFAULT_HANDLE;
}

export function currentUserNickname(): string {
  const account = loadActiveAccount();
  const profile = loadProfile();
  return account?.nickname?.trim() || profile.nickname?.trim() || DEFAULT_NICKNAME;
}

export function currentUserAvatar(): string | undefined {
  const account = loadActiveAccount();
  const profile = loadProfile();
  return account?.avatarUrl || profile.avatarUrl;
}

export function isOwnAuthor(author: string): boolean {
  const handle = currentUserHandle().toLowerCase();
  const nickname = currentUserNickname();
  const value = author.replace(/^@/, "").trim();
  return (
    value === "나" ||
    value === nickname ||
    value.toLowerCase() === handle ||
    value === DEFAULT_NICKNAME
  );
}
