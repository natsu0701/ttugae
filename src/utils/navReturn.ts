import { appPath, routePath } from "./appPath.ts";

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
    path.startsWith("/community/post/") ||
    path.startsWith("/community/author/") ||
    path.startsWith("/community/attend/")
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

export function goBack(fallbackPath = "/"): void {
  consumeNavReturn();
  if (window.history.length > 1) {
    window.history.back();
    return;
  }
  const target = resolvePathFallback(window.location.pathname);
  window.history.replaceState({}, "", appPath(target.path ?? fallbackPath));
  window.dispatchEvent(new PopStateEvent("popstate"));
}

const LOUNGE_NESTED = { loungeNested: true };

export function pushLoungePath(path: string): void {
  window.history.pushState(LOUNGE_NESTED, "", appPath(path));
}

/** 뜨개라운지 상세에서 이전 화면으로. 직접 URL로 들어온 경우에는 피드로 되돌린다. */
export function leaveLoungeChild(fallbackPath = "/community"): void {
  const state = window.history.state as { loungeNested?: boolean } | null;
  if (state?.loungeNested) {
    window.history.back();
    return;
  }
  window.history.replaceState({}, "", appPath(fallbackPath));
  window.dispatchEvent(new PopStateEvent("popstate"));
}
