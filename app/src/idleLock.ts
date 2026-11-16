/** 마지막 터치·조작 이후 로그인으로 돌아가는 시간 */
export const IDLE_LOCK_MS = 20 * 60 * 1000;

export type PhoneSignals = {
  ua: string;
  platform: string;
  maxTouchPoints: number;
  screenShortSide: number;
  coarsePointer: boolean;
};

/** 휴대폰만 해당한다. 아이패드와 데스크톱 미리보기는 제외한다. */
export function isPhoneSignals({
  ua,
  platform,
  maxTouchPoints,
  screenShortSide,
  coarsePointer,
}: PhoneSignals) {
  const ipad = /iPad/i.test(ua) || (platform === "MacIntel" && maxTouchPoints > 1);
  if (ipad) return false;
  if (/iPhone|iPod/i.test(ua)) return true;
  if (/Android/i.test(ua) && /Mobile/i.test(ua)) return true;
  if (/Windows Phone|IEMobile/i.test(ua)) return true;
  return coarsePointer && screenShortSide > 0 && screenShortSide < 768;
}

export function isPhoneDevice() {
  return isPhoneSignals({
    ua: navigator.userAgent || "",
    platform: navigator.platform || "",
    maxTouchPoints: navigator.maxTouchPoints || 0,
    screenShortSide: Math.min(window.screen.width, window.screen.height),
    coarsePointer: window.matchMedia("(pointer: coarse)").matches,
  });
}

/**
 * 휴대폰에서 앱 화면을 보고 있을 때만 로그인으로 보낸다.
 * 로그인·스플래시, 그리고 카메라 오버레이(뜨개 내비)는 그대로 둔다.
 */
export function shouldReturnToLogin(name: string | undefined, phone = isPhoneDevice()) {
  if (!phone || !name) return false;
  if (name === "camera" || name === "login" || name === "splash") return false;
  return true;
}
