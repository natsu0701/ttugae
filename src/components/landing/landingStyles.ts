/** 랜딩 페이지 공통 섹션·타이포 클래스 */
export const landingSection = {
  hero:
    "relative isolate flex h-screen w-full flex-col overflow-hidden [clip-path:inset(0)] px-5 pb-0 md:px-8",
  white: "bg-white px-5 py-20 md:px-8 md:py-28",
  gray: "bg-gray-50 px-5 py-20 md:px-8 md:py-28",
  promo: "bg-white px-5 py-16 md:px-8 md:py-24",
  footer: "bg-white px-5 py-12 text-center md:px-8",
} as const;

export const landingHeading = {
  h1: "mt-6 font-sans text-3xl font-bold leading-snug text-gray-900 sm:text-4xl md:text-5xl",
  h2: "mt-4 font-sans text-2xl font-bold leading-tight text-gray-900 sm:text-3xl md:text-4xl",
  h2Center: "mt-4 font-sans text-2xl font-bold text-gray-900 sm:text-3xl md:text-4xl",
  body: "mt-5 font-rounded text-base font-normal leading-relaxed text-gray-600",
  bodyCenter: "mt-4 font-rounded text-base font-normal text-gray-600",
} as const;
