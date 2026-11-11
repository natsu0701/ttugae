import { useEffect, useRef } from "react";

/** 클릭·터치가 없으면 홈으로 돌아가는 대기 시간 */
export const IDLE_HOME_MS = 20 * 60 * 1000;

const IDLE_EVENTS = ["pointerdown", "touchstart"] as const;

export function useIdleHome(onIdle: () => void, ms: number = IDLE_HOME_MS) {
  const onIdleRef = useRef(onIdle);
  onIdleRef.current = onIdle;

  useEffect(() => {
    let timer = window.setTimeout(() => onIdleRef.current(), ms);
    const bump = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => onIdleRef.current(), ms);
    };
    const opts: AddEventListenerOptions = { capture: true, passive: true };
    for (const event of IDLE_EVENTS) {
      window.addEventListener(event, bump, opts);
    }
    return () => {
      window.clearTimeout(timer);
      for (const event of IDLE_EVENTS) {
        window.removeEventListener(event, bump, opts);
      }
    };
  }, [ms]);
}
