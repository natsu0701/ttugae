import { useTranslation } from "react-i18next";
import AboutAppSection from "./components/about/AboutAppSection.tsx";
import AboutIntroVideo from "./components/about/AboutIntroVideo.tsx";
import {
  ChatFillIcon,
  CommunityFillIcon,
  FileTextFillIcon,
  PatternsFillIcon,
} from "./components/icons/FillIcons.tsx";
import Button from "./components/ui/Button.tsx";
import WelcomeBanner from "./components/ui/WelcomeBanner.tsx";
import { ABOUT_APP_IMAGES } from "./constants/aboutMedia.ts";
import { TTEUNI_IMAGES } from "./constants/tteuniImages.ts";

type AboutPageProps = {
  onOpenEditor: () => void;
  onOpenAr: () => void;
};

const PILLARS = [
  { id: "editor", titleKey: "landing.tabEditorTitle", subKey: "landing.tabEditorSub", icon: PatternsFillIcon },
  { id: "chatbot", titleKey: "landing.tabChatTitle", subKey: "landing.tabChatSub", icon: ChatFillIcon },
  { id: "converter", titleKey: "landing.tabConvertTitle", subKey: "landing.tabConvertSub", icon: FileTextFillIcon },
  { id: "community", titleKey: "landing.tabCommunityTitle", subKey: "landing.tabCommunitySub", icon: CommunityFillIcon },
] as const;

function AboutFigure({ src, alt }: { src: string; alt: string }) {
  return (
    <figure className="overflow-hidden rounded-xl bg-white shadow-sm">
      <img src={src} alt={alt} className="h-auto w-full object-cover" />
    </figure>
  );
}

export default function AboutPage({ onOpenEditor, onOpenAr }: AboutPageProps) {
  const { t } = useTranslation();

  return (
    <div className="relative pb-24">
      <section className="pt-8">
        <div className="page-shell">
          <WelcomeBanner
            chip={t("about.chip")}
            title={t("about.heroTitle")}
            subtitle={t("about.heroSubtitle")}
            image={TTEUNI_IMAGES.feature}
          />
        </div>
      </section>

      <section className="pt-10 md:pt-14">
        <div className="page-shell space-y-6">
          <AboutFigure src={ABOUT_APP_IMAGES.overview} alt={t("about.overviewAlt")} />
          <AboutFigure src={ABOUT_APP_IMAGES.background} alt={t("about.backgroundAlt")} />
          <AboutFigure src={ABOUT_APP_IMAGES.research} alt={t("about.researchAlt")} />
        </div>
      </section>

      <section className="pt-10 md:pt-14">
        <div className="page-shell">
          <AboutIntroVideo />
        </div>
      </section>

      <section className="pt-12 md:pt-16">
        <div className="page-shell">
          <div className="max-w-3xl">
            <h2 className="text-title font-sans font-bold text-gray-900">{t("about.bodyTitle")}</h2>
            <p className="mt-3 break-keep font-seoyun text-lg font-normal leading-relaxed text-stone-500">
              {t("about.body")}
            </p>
          </div>
        </div>
      </section>

      <section className="pt-12 md:pt-16">
        <div className="page-shell">
          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {PILLARS.map((item) => {
              const Icon = item.icon;
              return (
                <li
                  key={item.id}
                  className="rounded-xl border border-stone-100 bg-white p-5 shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#FC5F53]/10 text-coral">
                      <Icon className="h-5 w-5" />
                    </span>
                    <div className="min-w-0">
                      <p className="font-sans text-base font-bold text-stone-900">{t(item.titleKey)}</p>
                      <p className="mt-0.5 font-sans text-sm font-normal text-stone-400">{t(item.subKey)}</p>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
          <div className="mt-10 flex justify-center">
            <Button
              type="button"
              variant="primary"
              onClick={onOpenEditor}
              className="px-6 py-3 font-extrabold !shadow-[0_3px_8px_rgba(0,0,0,0.07)] transition-all duration-300 hover:!shadow-[0_4px_10px_rgba(252,95,83,0.14)]"
            >
              {t("landing.startDrawing")}
            </Button>
          </div>
        </div>
      </section>

      <AboutAppSection onOpenAr={onOpenAr} />
    </div>
  );
}
