import { memo } from "react";
import { useTranslation } from "react-i18next";
import BrandTextLogo from "../ui/BrandTextLogo.tsx";
import { landingSection } from "./landingStyles.ts";
import Reveal from "./Reveal.tsx";
import { PUBLIC_AR_URL } from "../../utils/appPath.ts";

function LandingFooter() {
  const { t } = useTranslation();
  return (
    <footer className={landingSection.footer}>
      <Reveal>
        <p className="font-seoyun text-lg font-bold text-gray-900 md:text-xl">
          {t("landing.footerTag")}
        </p>
        <a
          href={PUBLIC_AR_URL}
          className="mt-3 inline-block break-all font-sans text-sm font-semibold text-gray-700 underline-offset-2 hover:text-coral hover:underline"
        >
          {PUBLIC_AR_URL}
        </a>
        <p className="mt-2 inline-flex items-center gap-1.5 font-seoyun text-base font-normal text-gray-500">
          ©
          <BrandTextLogo className="h-4 w-auto object-contain opacity-80" />
        </p>
      </Reveal>
    </footer>
  );
}

export default memo(LandingFooter);
