import { memo } from "react";
import { useTranslation } from "react-i18next";
import FeatureBadge from "./FeatureBadge.tsx";
import FeatureInteractiveTabs from "./FeatureInteractiveTabs.tsx";
import { landingHeading } from "./landingStyles.ts";
import Reveal from "./Reveal.tsx";

function FeatureTwoSection() {
  const { t } = useTranslation();
  return (
    <section className="relative z-10 w-full border-t border-stone-200/40 bg-stone-50 px-6 py-24 md:px-12 lg:px-20">
      <div className="mx-auto max-w-6xl">
        <Reveal className="mb-16 text-center md:text-left">
          <FeatureBadge>Feature 02</FeatureBadge>
          <h2 className="mt-3 break-keep font-sans text-2xl font-black leading-tight tracking-tight text-stone-900 sm:text-3xl md:text-4xl">
            {t("landing.feature2Title")}
          </h2>
          <p className={`${landingHeading.body} font-seoyun`}>
            {t("landing.feature2Body")}
          </p>
        </Reveal>

        <Reveal delay={0.1}>
          <FeatureInteractiveTabs />
        </Reveal>
      </div>
    </section>
  );
}

export default memo(FeatureTwoSection);
