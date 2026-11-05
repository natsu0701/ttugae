import { useTranslation } from "react-i18next";
import ArIpadLink from "../ar/ArIpadLink.tsx";
import { ABOUT_APP_IMAGES } from "../../constants/aboutMedia.ts";

const SCREENS = [
  { src: ABOUT_APP_IMAGES.home, titleKey: "about.appScreenHome", hintKey: "about.appScreenHomeHint" },
  { src: ABOUT_APP_IMAGES.bag, titleKey: "about.appScreenBag", hintKey: "about.appScreenBagHint" },
  { src: ABOUT_APP_IMAGES.gauge, titleKey: "about.appScreenGauge", hintKey: "about.appScreenGaugeHint" },
] as const;

export default function AboutAppSection() {
  const { t } = useTranslation();

  return (
    <section className="pt-20 md:pt-28">
      <div className="page-shell">
        <div className="max-w-3xl">
          <h2 className="text-title break-keep font-sans font-bold text-gray-900">
            {t("about.appTitle")}
          </h2>
          <p className="mt-3 break-keep font-seoyun text-lg font-normal leading-relaxed text-stone-500">
            {t("about.appBody")}
          </p>
        </div>

        <div className="mt-20 space-y-8 md:mt-28">
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

          <figure className="overflow-hidden rounded-xl bg-white shadow-sm">
            <img
              src={ABOUT_APP_IMAGES.webNavi}
              alt={t("about.appWebNaviAlt")}
              className="block h-auto w-full"
            />
          </figure>
          <div>
            <p className="text-center font-seoyun text-base font-normal text-stone-500">
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
              className="block h-auto w-full"
            />
          </figure>
        </div>
      </div>
    </section>
  );
}
