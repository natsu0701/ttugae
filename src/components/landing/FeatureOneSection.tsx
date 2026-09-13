import { memo } from "react";
import { useTranslation } from "react-i18next";
import Button from "../ui/Button.tsx";
import EditorMockup from "./EditorMockup.tsx";
import FeatureBadge from "./FeatureBadge.tsx";
import { landingHeading, landingSection } from "./landingStyles.ts";
import Reveal from "./Reveal.tsx";

type FeatureOneSectionProps = {
  onOpenEditor: () => void;
};

function FeatureOneSection({ onOpenEditor }: FeatureOneSectionProps) {
  const { t } = useTranslation();
  return (
    <section id="features" className={landingSection.white}>
      <div className="page-shell grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
        <Reveal>
          <FeatureBadge>Feature 01</FeatureBadge>
          <h2 className={landingHeading.h2}>
            <span>{t("landing.feature1Line1")}</span>
            <span>{t("landing.feature1Line2")}</span>
          </h2>
          <p className={`${landingHeading.body} font-seoyun`}>
            {t("landing.feature1Body")}
          </p>
          <Button
            variant="primary"
            onClick={onOpenEditor}
            className="mt-8 px-6 py-3 font-extrabold !shadow-[0_3px_8px_rgba(0,0,0,0.07)] transition-all duration-300 hover:!shadow-[0_4px_10px_rgba(252,95,83,0.14)]"
          >
            {t("landing.startDrawing")}
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
