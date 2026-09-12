/** Vite `base`, always with a trailing slash (`/` or `/ttugae/`). */
export const BASE_URL = import.meta.env.BASE_URL;

function stripTrailingSlash(value: string): string {
  return value.endsWith("/") ? value.slice(0, -1) : value;
}

const BASE_PREFIX = stripTrailingSlash(BASE_URL === "/" ? "" : BASE_URL);

/** Prefix a public asset path with the Vite base (`/images/x` → `/ttugae/images/x`). */
export function assetUrl(path: string): string {
  const clean = path.replace(/^\/+/, "");
  return `${BASE_URL}${clean}`;
}

/**
 * Convert an in-app route (`/community`) into the browser URL (`/ttugae/community`).
 * Already-prefixed paths and query strings are left intact.
 */
export function appPath(path: string): string {
  const queryIndex = path.indexOf("?");
  const rawPath = queryIndex >= 0 ? path.slice(0, queryIndex) : path;
  const search = queryIndex >= 0 ? path.slice(queryIndex) : "";
  let pathname = rawPath.startsWith("/") ? rawPath : `/${rawPath}`;

  if (BASE_PREFIX) {
    if (pathname === BASE_PREFIX || pathname.startsWith(`${BASE_PREFIX}/`)) {
      return `${pathname}${search}`;
    }
    pathname = pathname === "/" ? `${BASE_PREFIX}/` : `${BASE_PREFIX}${pathname}`;
  }

  return `${pathname}${search}`;
}

/** Strip the Vite base so `/ttugae/community` becomes `/community`. */
export function routePath(pathname: string): string {
  if (!pathname) return "/";
  if (!BASE_PREFIX) return pathname.startsWith("/") ? pathname : `/${pathname}`;
  if (pathname === BASE_PREFIX || pathname === `${BASE_PREFIX}/`) return "/";
  if (pathname.startsWith(`${BASE_PREFIX}/`)) {
    const rest = pathname.slice(BASE_PREFIX.length);
    return rest.startsWith("/") ? rest : `/${rest}`;
  }
  return pathname.startsWith("/") ? pathname : `/${pathname}`;
}

export function currentRoutePath(): string {
  return routePath(window.location.pathname);
}

export function currentRouteHref(): string {
  return `${currentRoutePath()}${window.location.search}`;
}
