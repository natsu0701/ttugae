import { memo } from "react";
import BrandTextLogo from "../ui/BrandTextLogo.tsx";
import FeatureBadge from "./FeatureBadge.tsx";
import FeatureInteractiveTabs from "./FeatureInteractiveTabs.tsx";
import { landingHeading, landingSection } from "./landingStyles.ts";
import Reveal from "./Reveal.tsx";

function FeatureTwoSection() {
  return (
    <section className={landingSection.gray}>
      <Reveal className="mx-auto mb-12 max-w-3xl text-center">
        <FeatureBadge>Feature 02</FeatureBadge>
        <h2 className={`${landingHeading.h2Center} flex flex-col items-center justify-center gap-3 leading-tight md:gap-4`}>
          웹에서 만나는
          <BrandTextLogo className="h-8 w-auto object-contain md:h-9" />
        </h2>
        <p className={landingHeading.bodyCenter}>
          에디터부터 AI 챗봇, 커뮤니티까지 — 뜨개질의 모든 순간을 한곳에서.
        </p>
      </Reveal>

      <Reveal delay={0.1} className="mx-auto max-w-6xl">
        <FeatureInteractiveTabs />
      </Reveal>
    </section>
  );
}

export default memo(FeatureTwoSection);
