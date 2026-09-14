import { routePath } from "./appPath.ts";

export const MYPAGE_TABS = [
  "profile",
  "summary",
  "meetups",
  "bag",
  "gauge",
  "projects",
  "patterns",
  "finished",
  "liked",
  "saved",
  "settings",
] as const;

export type MyPageRouteTab = (typeof MYPAGE_TABS)[number];

export function mypageTabFromPath(pathname: string): MyPageRouteTab {
  const match = routePath(pathname).match(/^\/mypage\/([^/]+)/);
  const tab = match?.[1];
  if (tab && (MYPAGE_TABS as readonly string[]).includes(tab)) {
    return tab as MyPageRouteTab;
  }
  return "profile";
}

export function mypagePathForTab(tab: MyPageRouteTab): string {
  return tab === "profile" ? "/mypage" : `/mypage/${tab}`;
}
