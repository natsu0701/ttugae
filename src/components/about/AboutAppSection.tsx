import { useTranslation } from "react-i18next";
import ArIpadLink from "../ar/ArIpadLink.tsx";
import { ABOUT_APP_IMAGES } from "../../constants/aboutMedia.ts";

export default function AboutAppSection() {
  const { t } = useTranslation();

  return (
    <section className="pt-20 md:pt-28">
      <div className="page-shell">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-title break-keep font-sans font-bold text-gray-900">
            {t("about.appTitle")}
          </h2>
          <p className="mt-3 break-keep font-seoyun text-lg font-normal leading-relaxed text-stone-500">
            {t("about.appBody")}
          </p>
        </div>
      </div>

      <div className="mt-20 space-y-8 md:mt-28">
        <figure className="overflow-hidden bg-white">
          <img
            src={ABOUT_APP_IMAGES.screens}
            alt={t("about.appScreensAlt")}
            className="block h-auto w-full"
          />
        </figure>

        <figure className="overflow-hidden bg-white">
          <img
            src={ABOUT_APP_IMAGES.webNavi}
            alt={t("about.appWebNaviAlt")}
            className="block h-auto w-full"
          />
        </figure>
        <div className="page-shell">
          <p className="text-center font-seoyun text-base font-normal text-stone-500">
            {t("ar.ipadHint")}
          </p>
          <div className="mt-4">
            <ArIpadLink showQr={false} />
          </div>
        </div>

        <figure className="overflow-hidden bg-white">
          <img
            src={ABOUT_APP_IMAGES.brand}
            alt={t("about.brandAlt")}
            className="block h-auto w-full"
          />
        </figure>
      </div>
    </section>
  );
}
