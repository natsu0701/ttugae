import { memo, useRef } from "react";
import { useTranslation } from "react-i18next";
import Button from "../ui/Button.tsx";
import { landingSection } from "./landingStyles.ts";
import HeroDecorations from "./HeroDecorations.tsx";
import Reveal from "./Reveal.tsx";
import TteuniHeroPeek from "./TteuniHeroPeek.tsx";
import { assetUrl } from "../../utils/appPath.ts";
import { useHeroParallax } from "../../hooks/useHeroParallax.ts";

type HeroSectionProps = {
  onOpenEditor: () => void;
};

const HERO_SLOGAN_KEYS = ["landing.heroLine1", "landing.heroLine2"] as const;

function HeroSection({ onOpenEditor }: HeroSectionProps) {
  const { t } = useTranslation();
  const heroRef = useRef<HTMLElement>(null);
  useHeroParallax(heroRef);

  return (
    <section ref={heroRef} className={`${landingSection.hero} relative isolate overflow-hidden`}>
      <video
        src={assetUrl("/web_back.mp4")}
        className="pointer-events-none absolute inset-0 z-0 h-full w-full object-cover"
        autoPlay
        loop
        muted
        playsInline
        aria-hidden
      />

      {/* 웰컴 그라데이션 오버레이 필터 (따스한 분위기 연출 및 6px 최적화 블러 적용) */}
      <div className="hero-overlay pointer-events-none absolute inset-0 z-0" aria-hidden />

      <HeroDecorations />

      {/* 텍스트 컨테이너 여백 (레이스 아래 안전지대 확보) */}
      <div className="relative z-10 mx-auto w-full shrink-0 text-center pt-32 sm:pt-40 md:pt-52">
        <div className="page-shell py-4">
          <Reveal delay={0.4}>
            <h1 className="break-keep">
              {/* 1줄 리드 카피 — 기능 설명 본문과 같은 이숙윤체 */}
              <span className="block font-seoyun text-xl font-normal leading-relaxed text-white/80 [text-shadow:0_1px_3px_rgba(0,0,0,0.12),0_6px_24px_rgba(0,0,0,0.18)] sm:text-2xl md:text-3xl">
                {t("landing.heroLead")}
              </span>

              <span
                className="mt-3 flex flex-col items-center gap-0.5 overflow-visible break-keep font-gamhong text-4xl font-normal leading-none tracking-[-0.02em] text-white sm:text-5xl md:mt-4 md:gap-1 md:text-6xl lg:text-7xl xl:text-7xl 2xl:text-[clamp(3rem,4vw,4.5rem)]"
                style={{ fontFamily: "Mungyeong-Gamhong-Apple, sans-serif" }}
              >
                {HERO_SLOGAN_KEYS.map((key) => (
                  <span key={key} className="block overflow-visible py-0.5">
                    {t(key)}
                  </span>
                ))}
              </span>
            </h1>
          </Reveal>
        </div>

        {/* 시작 버튼 그룹 */}
        <Reveal delay={0.9} className="relative z-10 mt-8 md:mt-10">
          <Button
            variant="primary"
            onClick={onOpenEditor}
            className="relative z-10 px-8 py-4 text-base font-extrabold shadow-sm sm:px-10 sm:text-lg"
          >
            {t("landing.startDrawing")}
          </Button>
        </Reveal>
      </div>

      {/* 마스코트 뜨니 배치 */}
      <TteuniHeroPeek />
    </section>
  );
}

export default memo(HeroSection);
