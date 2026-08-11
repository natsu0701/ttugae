/** 탭·필터: 기본 white(대비) → hover black → active coral + 소프트 섀도우 */
export const softShadow = "shadow-[0_8px_30px_rgb(0,0,0,0.04)]";

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
  `rounded-full px-5 py-2.5 font-sans text-sm font-normal transition-colors duration-200 ${softShadow}`;

export const tabButtonCompactBase =
  `rounded-xl px-3 py-2 font-sans text-sm font-normal transition-colors duration-200 ${softShadow}`;
