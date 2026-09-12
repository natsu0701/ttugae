import { routePath } from "./appPath.ts";

const RETURN_KEY = "ttugae.nav.return.v1";

export type NavReturnView =
  | "landing"
  | "mypage"
  | "community"
  | "editor"
  | "create-post";

export type NavReturn = {
  view: NavReturnView;
  path?: string;
};

export function setNavReturn(target: NavReturn): void {
  try {
    sessionStorage.setItem(RETURN_KEY, JSON.stringify(target));
  } catch {
    // private mode
  }
}

export function peekNavReturn(): NavReturn | null {
  try {
    const raw = sessionStorage.getItem(RETURN_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as NavReturn;
    if (!parsed?.view) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function consumeNavReturn(): NavReturn | null {
  const value = peekNavReturn();
  if (value) {
    try {
      sessionStorage.removeItem(RETURN_KEY);
    } catch {
      // ignore
    }
  }
  return value;
}

/** 브라우저 히스토리 없이도 안전하게 돌아갈 기본 목적지 */
export function resolvePathFallback(pathname: string): NavReturn {
  const path = routePath(pathname);
  if (
    path.startsWith("/community/qa/") ||
    path.startsWith("/community/work/") ||
    path.startsWith("/community/post/")
  ) {
    return { view: "community", path: "/community" };
  }
  if (path.startsWith("/create-post")) {
    return { view: "community", path: "/community" };
  }
  if (path.startsWith("/editor")) {
    return { view: "landing", path: "/" };
  }
  if (path.startsWith("/community")) {
    return { view: "community", path: "/community" };
  }
  if (path.startsWith("/mypage") || path.startsWith("/dashboard")) {
    return { view: "mypage", path: "/mypage" };
  }
  return { view: "landing", path: "/" };
}
