import { memo } from "react";
import Button from "../ui/Button.tsx";
import EditorMockup from "./EditorMockup.tsx";
import FeatureBadge from "./FeatureBadge.tsx";
import { landingHeading, landingSection } from "./landingStyles.ts";
import Reveal from "./Reveal.tsx";

type FeatureOneSectionProps = {
  onOpenEditor: () => void;
};

function FeatureOneSection({ onOpenEditor }: FeatureOneSectionProps) {
  return (
    <section id="features" className={landingSection.white}>
      <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2 lg:gap-16">
        <Reveal>
          <FeatureBadge>Feature 01</FeatureBadge>
          <h2 className={landingHeading.h2}>
            <span>클릭 몇 번으로</span>
            <span>완성되는 나만의 도안</span>
          </h2>
          <p className={`${landingHeading.body} font-seoyun`}>
            격자 위에 기호와 색을 놓고, 실수는 뜨니가 체크해 줘요.
          </p>
          <Button variant="primary" onClick={onOpenEditor} className="mt-8 px-6 py-3 font-extrabold">
            도안 그리기
          </Button>
        </Reveal>
        <Reveal delay={0.12}>
          <EditorMockup />
        </Reveal>
      </div>
    </section>
  );
}

export default memo(FeatureOneSection);
