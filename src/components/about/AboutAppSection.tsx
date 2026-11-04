import { useTranslation } from "react-i18next";
import { CameraFillIcon, OpenLinkFillIcon, PlayFillIcon } from "../icons/FillIcons.tsx";
import ArIpadLink from "../ar/ArIpadLink.tsx";
import Button from "../ui/Button.tsx";
import { assetUrl } from "../../utils/appPath.ts";

type AboutAppSectionProps = {
  onOpenAr: () => void;
};

const POINTS = [
  { titleKey: "about.appPoint1Title", bodyKey: "about.appPoint1Body", icon: CameraFillIcon },
  { titleKey: "about.appPoint2Title", bodyKey: "about.appPoint2Body", icon: PlayFillIcon },
  { titleKey: "about.appPoint3Title", bodyKey: "about.appPoint3Body", icon: OpenLinkFillIcon },
] as const;

export default function AboutAppSection({ onOpenAr }: AboutAppSectionProps) {
  const { t } = useTranslation();

  return (
    <section className="pt-12 md:pt-16">
      <div className="page-shell">
        <div className="overflow-hidden rounded-xl bg-[#FFFBF7] p-8 shadow-sm sm:p-10">
          <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
            <div className="min-w-0">
              <span className="mb-3 block w-fit rounded-full bg-[#FC5F53]/10 px-3 py-1 font-sans text-sm font-bold uppercase tracking-widest text-[#FC5F53]">
                {t("about.appChip")}
              </span>
              <h2 className="text-title break-keep font-sans font-bold text-gray-900">
                {t("about.appTitle")}
              </h2>
              <p className="mt-3 break-keep font-seoyun text-lg font-normal leading-relaxed text-stone-500">
                {t("about.appBody")}
              </p>
              <ul className="mt-6 space-y-4">
                {POINTS.map((point) => {
                  const Icon = point.icon;
                  return (
                  <li key={point.titleKey} className="flex gap-3">
                    <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#FC5F53]/10 text-coral">
                      <Icon className="h-4 w-4" />
                    </span>
                    <div className="min-w-0">
                      <p className="font-sans text-base font-bold text-stone-900">{t(point.titleKey)}</p>
                      <p className="mt-0.5 break-keep font-seoyun text-base font-normal leading-relaxed text-stone-500">
                        {t(point.bodyKey)}
                      </p>
                    </div>
                  </li>
                  );
                })}
              </ul>
              <div className="mt-8">
                <Button
                  type="button"
                  onClick={onOpenAr}
                  className="px-6 py-3 font-extrabold !shadow-[0_3px_8px_rgba(0,0,0,0.07)] transition-all duration-300 hover:!shadow-[0_4px_10px_rgba(252,95,83,0.14)]"
                >
                  {t("about.appCta")}
                </Button>
              </div>
            </div>
            <div className="flex justify-center">
              <img
                src={assetUrl("/images/App_mockup_1.png")}
                alt={t("about.appMockAlt")}
                className="h-auto w-full max-w-sm select-none object-contain"
              />
            </div>
          </div>
          <div className="mt-8 border-t border-stone-200/70 pt-6">
            <p className="mb-4 text-center font-seoyun text-base font-normal text-stone-500">
              {t("ar.ipadHint")}
            </p>
            <ArIpadLink />
          </div>
        </div>
      </div>
    </section>
  );
}
