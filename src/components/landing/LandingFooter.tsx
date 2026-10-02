import { memo } from "react";
import { useTranslation } from "react-i18next";
import BrandTextLogo from "../ui/BrandTextLogo.tsx";
import Reveal from "./Reveal.tsx";

type LandingFooterProps = {
  variant?: "home" | "compact";
  isLoggedIn?: boolean;
  onGoHome?: () => void;
  onGoEditor?: () => void;
  onGoCommunity?: () => void;
  onGoMypage?: () => void;
  onLogin?: () => void;
};

function FooterLink({
  label,
  onClick,
}: {
  label: string;
  onClick?: () => void;
}) {
  return (
    <li>
      <button
        type="button"
        onClick={onClick}
        className="font-sans text-sm text-stone-600 transition-colors hover:text-coral md:text-base"
      >
        {label}
      </button>
    </li>
  );
}

function LandingFooter({
  variant = "compact",
  isLoggedIn = false,
  onGoHome,
  onGoEditor,
  onGoCommunity,
  onGoMypage,
  onLogin,
}: LandingFooterProps) {
  const { t } = useTranslation();

  if (variant !== "home") {
    return (
      <footer className="bg-white px-5 py-12 text-center md:px-8">
        <Reveal>
          <p className="font-seoyun text-lg font-bold text-gray-900 md:text-xl">
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

  return (
    <footer className="border-t border-stone-200 bg-[#FFFBF7] px-5 py-16 md:px-8 md:py-20">
      <Reveal>
        <div className="page-shell">
          <div className="grid grid-cols-2 gap-10 md:grid-cols-4 md:gap-12">
            <div className="col-span-2 md:col-span-1">
              <BrandTextLogo className="h-7 w-auto object-contain md:h-8" />
              <p className="mt-3 max-w-xs break-keep font-seoyun text-base leading-relaxed text-stone-500 md:text-lg">
                {t("landing.footerTag")}
              </p>
            </div>

            <div>
              <p className="mb-3 font-sans text-sm font-bold tracking-wide text-stone-900 md:text-base">
                {t("landing.footerExplore")}
              </p>
              <ul className="flex flex-col gap-2">
                <FooterLink label={t("nav.home")} onClick={onGoHome} />
                <FooterLink label={t("nav.startEditor")} onClick={onGoEditor} />
              </ul>
            </div>

            <div>
              <p className="mb-3 font-sans text-sm font-bold tracking-wide text-stone-900 md:text-base">
                {t("landing.footerCommunity")}
              </p>
              <ul className="flex flex-col gap-2">
                <FooterLink label={t("nav.community")} onClick={onGoCommunity} />
              </ul>
            </div>

            <div>
              <p className="mb-3 font-sans text-sm font-bold tracking-wide text-stone-900 md:text-base">
                {t("landing.footerAccount")}
              </p>
              <ul className="flex flex-col gap-2">
                <FooterLink
                  label={t("nav.mypage")}
                  onClick={isLoggedIn ? onGoMypage : onLogin}
                />
                {!isLoggedIn ? (
                  <FooterLink label={t("nav.login")} onClick={onLogin} />
                ) : null}
              </ul>
            </div>
          </div>

          <p className="mt-12 inline-flex items-center gap-1.5 border-t border-stone-200 pt-6 font-seoyun text-sm font-normal text-gray-500 md:text-base">
            ©
            <BrandTextLogo className="h-4 w-auto object-contain opacity-80" />
          </p>
        </div>
      </Reveal>
    </footer>
  );
}

export default memo(LandingFooter);
