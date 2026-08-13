import { memo } from "react";
import BrandTextLogo from "../ui/BrandTextLogo.tsx";
import Button from "../ui/Button.tsx";
import { softShadow } from "../ui/tabButtonStyles.ts";
import { landingSection } from "./landingStyles.ts";
import HeroDecorations from "./HeroDecorations.tsx";
import Reveal from "./Reveal.tsx";
import TteuniHeroPeek from "./TteuniHeroPeek.tsx";

type HeroSectionProps = {
  onOpenEditor: () => void;
};

function HeroSection({ onOpenEditor }: HeroSectionProps) {
  return (
    <section className={`${landingSection.hero} relative isolate overflow-hidden`}>
      <video
        src="/web_back.mp4"
        className="pointer-events-none absolute inset-0 z-0 h-full w-full object-cover"
        autoPlay
        loop
        muted
        playsInline
        aria-hidden
      />
      <div
        className="absolute inset-0 z-0 bg-beige-cream/20 backdrop-blur-[10px]"
        aria-hidden
      />
      <HeroDecorations />
      <div className="relative z-10 mx-auto w-full max-w-4xl text-center">
        <Reveal>
          <span
            className={`inline-block rounded-full bg-white px-4 py-1.5 font-rounded text-sm font-normal text-gray-600 ${softShadow}`}
          >
            <BrandTextLogo className="h-5 w-auto object-contain" />
          </span>
        </Reveal>

        <Reveal delay={0.08}>
          <h1
            className="mt-4 font-gamhong text-3xl font-normal leading-snug text-gray-900 sm:text-4xl md:mt-5 md:text-5xl"
            style={{
              fontFamily: "Mungyeong-Gamhong-Apple, sans-serif",
              
              textShadow:
                "2px 2px 0 #fff, -2px 2px 0 #fff, 2px -2px 0 #fff, -2px -2px 0 #fff",
            }}
          >
            복잡한 도안은 뜨니에게 맡기고,
            <br />
            <span className="text-coral">뜨개질에만 집중하세요!</span>
          </h1>
        </Reveal>

        <Reveal delay={0.14}>
          <p className="mx-auto mt-2 max-w-xl font-rounded text-base font-normal leading-relaxed text-gray-600 md:mt-4 md:text-lg">
            나만의 도안을 그리는 스마트 에디터부터 AR 내비게이션까지.
          </p>
        </Reveal>

        <Reveal delay={0.2} className="relative z-10 mt-6 md:mt-8">
          <Button
            variant="primary"
            onClick={onOpenEditor}
            className="relative z-10 px-10 py-4 text-lg"
          >
            도안 그리기
          </Button>
        </Reveal>
      </div>
      <TteuniHeroPeek />
    </section>
  );
}

export default memo(HeroSection);
