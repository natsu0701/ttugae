/** 탭·필터: 기본 white → hover black → active coral + 에어브러시 섀도우 */
export const softShadow = "shadow-sm";

/** 에디터 라이트 크롬 — 버튼·패널 공통 중간 톤 */
export const editorChromeTone =
  "border border-stone-200 bg-white text-stone-700 transition-colors hover:border-stone-300 hover:bg-stone-50 hover:text-stone-900";

export const editorPanel =
  "rounded-2xl border border-stone-200 bg-white";

export const editorChromeBtn = `rounded-xl ${editorChromeTone}`;

export const editorChromeBtnActive = "rounded-xl border border-coral bg-coral text-white";

export function tabButtonClass(active: boolean, variant: "fill" | "outline" = "fill") {
  if (active) {
    return `bg-coral text-white ${softShadow}`;
  }
  if (variant === "outline") {
    return `border border-gray-300 bg-white text-gray-700 hover:bg-black hover:text-white hover:border-black ${softShadow}`;
  }
  return `bg-white text-gray-700 hover:bg-black hover:text-white ${softShadow}`;
}

export const tabButtonBase =
  `rounded-full px-5 py-2.5 font-sans text-base font-normal leading-5 transition-colors duration-200 md:text-lg ${softShadow}`;

export const tabButtonCompactBase =
  `rounded-xl px-3 py-2 font-sans text-base font-normal leading-5 transition-colors duration-200 md:text-lg ${softShadow}`;
