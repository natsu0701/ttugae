import { memo } from "react";
import BrandTextLogo from "../ui/BrandTextLogo.tsx";
import { landingSection } from "./landingStyles.ts";
import Reveal from "./Reveal.tsx";

function LandingFooter() {
  return (
    <footer className={landingSection.footer}>
      <Reveal>
        <p className="font-sans text-lg font-bold text-gray-900 md:text-xl">
          오늘도 한 땀, 함께해요
        </p>
        <p className="mt-2 inline-flex items-center gap-1.5 font-rounded text-sm font-normal text-gray-500">
          ©
          <BrandTextLogo className="h-4 w-auto object-contain opacity-80" />
        </p>
      </Reveal>
    </footer>
  );
}

export default memo(LandingFooter);
