import { routePath } from "./appPath.ts";

export const MYPAGE_TABS = [
  "profile",
  "summary",
  "meetups",
  "bag",
  "gauge",
  "projects",
  "patterns",
  "liked",
  "saved",
  "settings",
] as const;

export type MyPageRouteTab = (typeof MYPAGE_TABS)[number];

export type MyPageLocation = {
  tab: MyPageRouteTab;
  diaryWorkId: string | null;
};

const LEGACY_FINISHED = new Set(["finished", "diary"]);

export function mypageViewFromPath(pathname: string): MyPageLocation {
  const path = routePath(pathname);
  const diary = path.match(/^\/mypage\/diary\/([^/]+)/);
  if (diary?.[1]) {
    return { tab: "projects", diaryWorkId: decodeURIComponent(diary[1]) };
  }
  const match = path.match(/^\/mypage\/([^/]+)/);
  const tab = match?.[1];
  if (tab && LEGACY_FINISHED.has(tab)) {
    return { tab: "projects", diaryWorkId: null };
  }
  if (tab && (MYPAGE_TABS as readonly string[]).includes(tab)) {
    return { tab: tab as MyPageRouteTab, diaryWorkId: null };
  }
  return { tab: "profile", diaryWorkId: null };
}

export function mypageTabFromPath(pathname: string): MyPageRouteTab {
  return mypageViewFromPath(pathname).tab;
}

export function mypagePathForTab(tab: MyPageRouteTab): string {
  return tab === "profile" ? "/mypage" : `/mypage/${tab}`;
}

export function mypageDiaryPath(workId: string): string {
  return `/mypage/diary/${encodeURIComponent(workId)}`;
}
