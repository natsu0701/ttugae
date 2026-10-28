import { memo } from "react";
import { useTranslation } from "react-i18next";
import BrandTextLogo from "../ui/BrandTextLogo.tsx";
import { landingSection } from "./landingStyles.ts";
import Reveal from "./Reveal.tsx";
import ArIpadLink from "../ar/ArIpadLink.tsx";

function LandingFooter() {
  const { t } = useTranslation();
  return (
    <footer className={landingSection.footer}>
      <Reveal>
        <p className="mb-8 font-sans text-lg font-bold text-gray-900 md:text-xl">
          {t("landing.footerArTitle")}
        </p>
        <ArIpadLink />
        <p className="mt-10 font-seoyun text-lg font-bold text-gray-900 md:text-xl">
          {t("landing.footerTag")}
        </p>
        <p className="mt-2 inline-flex items-center gap-1.5 font-seoyun text-base font-normal text-gray-500">
          ©
          <BrandTextLogo className="h-4 w-auto object-contain opacity-80" />
        </p>
      </Reveal>
    </footer>
  );
}

export default memo(LandingFooter);
