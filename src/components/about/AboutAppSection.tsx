import { useTranslation } from "react-i18next";
import ArIpadLink from "../ar/ArIpadLink.tsx";
import Button from "../ui/Button.tsx";
import { ABOUT_APP_IMAGES } from "../../constants/aboutMedia.ts";

type AboutAppSectionProps = {
  onOpenAr: () => void;
};

const SCREENS = [
  { src: ABOUT_APP_IMAGES.home, titleKey: "about.appScreenHome", hintKey: "about.appScreenHomeHint" },
  { src: ABOUT_APP_IMAGES.bag, titleKey: "about.appScreenBag", hintKey: "about.appScreenBagHint" },
  { src: ABOUT_APP_IMAGES.gauge, titleKey: "about.appScreenGauge", hintKey: "about.appScreenGaugeHint" },
] as const;

export default function AboutAppSection({ onOpenAr }: AboutAppSectionProps) {
  const { t } = useTranslation();

  return (
    <section className="pt-12 md:pt-16">
      <div className="page-shell space-y-8">
        <div className="overflow-hidden rounded-xl bg-[#FFFBF7] shadow-sm">
          <img
            src={ABOUT_APP_IMAGES.hero}
            alt={t("about.appHeroAlt")}
            className="h-auto w-full object-cover"
          />
          <div className="px-8 py-8 sm:px-10 sm:py-10">
            <span className="mb-3 block w-fit rounded-full bg-[#FC5F53]/10 px-3 py-1 font-sans text-sm font-bold uppercase tracking-widest text-[#FC5F53]">
              {t("about.appChip")}
            </span>
            <h2 className="text-title break-keep font-sans font-bold text-gray-900">
              {t("about.appTitle")}
            </h2>
            <p className="mt-3 max-w-3xl break-keep font-seoyun text-lg font-normal leading-relaxed text-stone-500">
              {t("about.appBody")}
            </p>
          </div>
        </div>

        <ul className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {SCREENS.map((screen) => (
            <li key={screen.titleKey} className="overflow-hidden rounded-xl bg-white shadow-sm">
              <img
                src={screen.src}
                alt={t(screen.titleKey)}
                className="h-auto w-full object-contain"
              />
              <div className="border-t border-stone-100 px-5 py-4">
                <p className="font-sans text-base font-bold text-stone-900">{t(screen.titleKey)}</p>
                <p className="mt-1 break-keep font-seoyun text-base font-normal leading-relaxed text-stone-500">
                  {t(screen.hintKey)}
                </p>
              </div>
            </li>
          ))}
        </ul>

        <div className="grid items-center gap-8 overflow-hidden rounded-xl bg-[#FFFBF7] p-6 shadow-sm sm:p-8 lg:grid-cols-2 lg:gap-12">
          <img
            src={ABOUT_APP_IMAGES.ar}
            alt={t("about.appArAlt")}
            className="h-auto w-full rounded-xl object-cover"
          />
          <div className="min-w-0">
            <h3 className="text-title break-keep font-sans font-bold text-gray-900">
              {t("about.appNaviTitle")}
            </h3>
            <p className="mt-3 break-keep font-seoyun text-lg font-normal leading-relaxed text-stone-500">
              {t("about.appNaviBody")}
            </p>
            <div className="mt-6">
              <Button
                type="button"
                onClick={onOpenAr}
                className="px-6 py-3 font-extrabold !shadow-[0_3px_8px_rgba(0,0,0,0.07)] transition-all duration-300 hover:!shadow-[0_4px_10px_rgba(252,95,83,0.14)]"
              >
                {t("about.appCta")}
              </Button>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl bg-white p-6 shadow-sm sm:p-8">
          <img
            src={ABOUT_APP_IMAGES.webNavi}
            alt={t("about.appWebNaviAlt")}
            className="mx-auto h-auto w-full max-w-4xl object-contain"
          />
          <p className="mt-6 text-center font-seoyun text-base font-normal text-stone-500">
            {t("ar.ipadHint")}
          </p>
          <div className="mt-4">
            <ArIpadLink showQr={false} />
          </div>
        </div>

        <figure className="overflow-hidden rounded-xl bg-white shadow-sm">
          <img
            src={ABOUT_APP_IMAGES.brand}
            alt={t("about.brandAlt")}
            className="h-auto w-full object-cover"
          />
        </figure>
      </div>
    </section>
  );
}
