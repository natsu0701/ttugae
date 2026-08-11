import { memo } from "react";
import Button from "../ui/Button.tsx";
import { softShadow } from "../ui/tabButtonStyles.ts";
import { landingHeading, landingSection } from "./landingStyles.ts";
import Reveal from "./Reveal.tsx";
import TteuniHeroPeek from "./TteuniHeroPeek.tsx";

type HeroSectionProps = {
  onOpenEditor: () => void;
};

function HeroSection({ onOpenEditor }: HeroSectionProps) {
  return (
    <section className={landingSection.hero}>
      <div className="relative z-10 mx-auto max-w-4xl pb-6 text-center">
        <Reveal>
          <span
            className={`inline-block rounded-full bg-white px-4 py-1.5 font-rounded text-sm font-normal text-gray-600 ${softShadow}`}
          >
            뜨개러투게더
          </span>
        </Reveal>

        <Reveal delay={0.08}>
          <h1 className={landingHeading.h1}>
            복잡한 도안은 뜨니에게 맡기고,
            <br />
            <span className="text-coral">뜨개질에만 집중</span>하세요!
          </h1>
        </Reveal>

        <Reveal delay={0.14}>
          <p className="mx-auto mt-6 max-w-xl font-rounded text-base font-normal leading-relaxed text-gray-600 md:text-lg">
            나만의 도안을 그리는 스마트 에디터부터 AR 내비게이션까지.
          </p>
        </Reveal>

        <Reveal delay={0.2} className="relative z-10 mt-10">
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
