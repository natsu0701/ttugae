import {
  DEFAULT_HANDLE,
  DEFAULT_NICKNAME,
  loadProfile,
  saveProfileAccount,
  saveProfileAvatar,
  type ProfileData,
} from "./profileStorage.ts";

const ACCOUNTS_KEY = "ttugae.accounts.v1";
export const ACCOUNTS_CHANGED_EVENT = "ttugae:accounts-changed";

export type UserAccount = {
  id: string;
  handle: string;
  nickname: string;
  avatarUrl?: string;
  email?: string;
};

type AccountStore = {
  accounts: UserAccount[];
  activeId: string | null;
};

function emit() {
  window.dispatchEvent(new Event(ACCOUNTS_CHANGED_EVENT));
}

function readStore(): AccountStore {
  try {
    const raw = localStorage.getItem(ACCOUNTS_KEY);
    if (!raw) return { accounts: [], activeId: null };
    const parsed = JSON.parse(raw) as AccountStore;
    return {
      accounts: Array.isArray(parsed.accounts) ? parsed.accounts : [],
      activeId: parsed.activeId ?? null,
    };
  } catch {
    return { accounts: [], activeId: null };
  }
}

function writeStore(store: AccountStore) {
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(store));
  emit();
}

export function isValidHandle(value: string): boolean {
  return /^[A-Za-z]+$/.test(value.trim());
}

export function loadAccounts(): UserAccount[] {
  return readStore().accounts;
}

export function loadActiveAccount(): UserAccount | null {
  const store = readStore();
  if (!store.activeId) return null;
  return store.accounts.find((item) => item.id === store.activeId) ?? null;
}

function syncProfile(account: UserAccount) {
  const patch: Pick<ProfileData, "nickname" | "handle" | "email"> = {
    nickname: account.nickname,
    handle: account.handle,
    email: account.email,
  };
  saveProfileAccount(patch);
  if (account.avatarUrl) saveProfileAvatar(account.avatarUrl);
}

export function ensureActiveAccount(): UserAccount {
  const existing = loadActiveAccount();
  if (existing) return existing;
  const profile = loadProfile();
  const handle = isValidHandle(profile.handle ?? "")
    ? (profile.handle as string)
    : DEFAULT_HANDLE;
  const account: UserAccount = {
    id: `acc-${Date.now()}`,
    handle,
    nickname: profile.nickname?.trim() || DEFAULT_NICKNAME,
    avatarUrl: profile.avatarUrl,
    email: profile.email,
  };
  writeStore({ accounts: [account], activeId: account.id });
  syncProfile(account);
  return account;
}

export function addAccount(input: {
  handle?: string;
  nickname?: string;
  email?: string;
  avatarUrl?: string;
}): UserAccount {
  const store = readStore();
  const handleRaw = (input.handle ?? "").trim();
  const handle = isValidHandle(handleRaw)
    ? handleRaw
    : `knitter${store.accounts.length + 1}`;
  const account: UserAccount = {
    id: `acc-${Date.now()}`,
    handle,
    nickname: input.nickname?.trim() || DEFAULT_NICKNAME,
    email: input.email,
    avatarUrl: input.avatarUrl,
  };
  writeStore({
    accounts: [...store.accounts, account],
    activeId: account.id,
  });
  syncProfile(account);
  return account;
}

export function switchAccount(id: string): UserAccount | null {
  const store = readStore();
  const next = store.accounts.find((item) => item.id === id);
  if (!next) return null;
  writeStore({ ...store, activeId: id });
  syncProfile(next);
  return next;
}

export function updateActiveAccount(patch: Partial<Omit<UserAccount, "id">>): UserAccount | null {
  const store = readStore();
  if (!store.activeId) return null;
  const accounts = store.accounts.map((item) =>
    item.id === store.activeId ? { ...item, ...patch } : item,
  );
  writeStore({ ...store, accounts });
  const active = accounts.find((item) => item.id === store.activeId) ?? null;
  if (active) syncProfile(active);
  return active;
}

export function clearActiveAccount() {
  writeStore({ ...readStore(), activeId: null });
}
