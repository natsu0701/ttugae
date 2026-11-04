import { useTranslation } from "react-i18next";
import AboutAppSection from "./components/about/AboutAppSection.tsx";
import AboutIntroVideo from "./components/about/AboutIntroVideo.tsx";
import Button from "./components/ui/Button.tsx";
import WelcomeBanner from "./components/ui/WelcomeBanner.tsx";
import { ABOUT_APP_IMAGES } from "./constants/aboutMedia.ts";
import { TTEUNI_IMAGES } from "./constants/tteuniImages.ts";

type AboutPageProps = {
  onOpenEditor: () => void;
  onOpenAr: () => void;
};

const STORY_IMAGES = [
  { src: ABOUT_APP_IMAGES.overview, altKey: "about.overviewAlt" },
  { src: ABOUT_APP_IMAGES.background, altKey: "about.backgroundAlt" },
  { src: ABOUT_APP_IMAGES.research, altKey: "about.researchAlt" },
] as const;

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
        <div className="page-shell">
          <div className="overflow-hidden rounded-xl bg-white shadow-sm">
            {STORY_IMAGES.map((item) => (
              <img
                key={item.src}
                src={item.src}
                alt={t(item.altKey)}
                className="block h-auto w-full"
              />
            ))}
          </div>
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
