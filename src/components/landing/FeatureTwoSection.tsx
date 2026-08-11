import { memo } from "react";
import FeatureBadge from "./FeatureBadge.tsx";
import FeatureInteractiveTabs from "./FeatureInteractiveTabs.tsx";
import { landingHeading, landingSection } from "./landingStyles.ts";
import Reveal from "./Reveal.tsx";

function FeatureTwoSection() {
  return (
    <section className={landingSection.gray}>
      <Reveal className="mx-auto mb-12 max-w-3xl text-center">
        <FeatureBadge>Feature 02</FeatureBadge>
        <h2 className={landingHeading.h2Center}>
          웹에서 만나는 뜨개러투게더
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
