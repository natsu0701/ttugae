import { useEffect, useRef } from "react";
import { routePath } from "../utils/appPath.ts";

/** 클릭·터치가 없으면 홈으로 돌아가는 대기 시간 */
export const IDLE_HOME_MS = 20 * 60 * 1000;

const IDLE_EVENTS = ["pointerdown", "touchstart"] as const;

export function isArOverlayRoute(pathname = window.location.pathname) {
  return routePath(pathname).startsWith("/ar");
}

function shouldStayOnIdle() {
  return (
    isArOverlayRoute() || Boolean(document.querySelector('[data-ar-fullscreen="true"]'))
  );
}

export function useIdleHome(onIdle: () => void, ms: number = IDLE_HOME_MS) {
  const onIdleRef = useRef(onIdle);
  onIdleRef.current = onIdle;

  useEffect(() => {
    let timer = 0;
    const schedule = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        if (shouldStayOnIdle()) {
          schedule();
          return;
        }
        onIdleRef.current();
      }, ms);
    };
    schedule();
    const bump = () => schedule();
    const opts: AddEventListenerOptions = { capture: true, passive: true };
    for (const event of IDLE_EVENTS) {
      window.addEventListener(event, bump, opts);
    }
    window.addEventListener("popstate", bump);
    document.addEventListener("fullscreenchange", bump);
    document.addEventListener("webkitfullscreenchange", bump);
    const observer = new MutationObserver(bump);
    observer.observe(document.documentElement, {
      subtree: true,
      attributes: true,
      attributeFilter: ["data-ar-fullscreen"],
    });
    return () => {
      window.clearTimeout(timer);
      for (const event of IDLE_EVENTS) {
        window.removeEventListener(event, bump, opts);
      }
      window.removeEventListener("popstate", bump);
      document.removeEventListener("fullscreenchange", bump);
      document.removeEventListener("webkitfullscreenchange", bump);
      observer.disconnect();
    };
  }, [ms]);
}
