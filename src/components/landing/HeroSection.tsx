import { memo, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import Button from "../ui/Button.tsx";
import { landingSection } from "./landingStyles.ts";
import HeroDecorations from "./HeroDecorations.tsx";
import Reveal from "./Reveal.tsx";
import TteuniHeroPeek from "./TteuniHeroPeek.tsx";
import { assetUrl } from "../../utils/appPath.ts";

type HeroSectionProps = {
  onOpenEditor: () => void;
};

function HeroSection({ onOpenEditor }: HeroSectionProps) {
  const { t } = useTranslation();
  const sectionRef = useRef<HTMLElement>(null);
  const frameRef = useRef(0);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = (mx: number, my: number) => {
      section.style.setProperty("--hero-mx", mx.toFixed(4));
      section.style.setProperty("--hero-my", my.toFixed(4));
    };

    const onMove = (event: MouseEvent) => {
      if (reduced.matches) return;
      const rect = section.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;
      const mx = (event.clientX - rect.left) / rect.width - 0.5;
      const my = (event.clientY - rect.top) / rect.height - 0.5;
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
      frameRef.current = requestAnimationFrame(() => apply(mx * 2, my * 2));
    };

    const onLeave = () => apply(0, 0);

    section.addEventListener("mousemove", onMove);
    section.addEventListener("mouseleave", onLeave);
    return () => {
      section.removeEventListener("mousemove", onMove);
      section.removeEventListener("mouseleave", onLeave);
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className={`${landingSection.hero} relative isolate overflow-hidden`}
    >
      <video
        src={assetUrl("/web_back.mp4")}
        className="pointer-events-none absolute inset-0 z-0 h-full w-full object-cover"
        autoPlay
        loop
        muted
        playsInline
        aria-hidden
      />

      <div className="hero-overlay pointer-events-none absolute inset-0 z-0" aria-hidden />

      <HeroDecorations />

      <div className="relative z-10 mx-auto w-full shrink-0 text-center pt-28 sm:pt-36 md:pt-44">
        <div className="page-shell py-4">
          <Reveal delay={0.4}>
            <h1 className="break-keep">
              <span className="block font-sans text-xl font-semibold leading-relaxed tracking-[0.04em] text-white/80 [text-shadow:0_1px_3px_rgba(0,0,0,0.12),0_6px_24px_rgba(0,0,0,0.18)] sm:text-2xl md:text-3xl">
                {t("landing.heroLead")}
              </span>

              <span
                className="hero-slogan-group hero-parallax-layer mt-3 flex cursor-pointer flex-col items-center gap-0.5 overflow-visible break-keep font-gamhong text-4xl font-normal leading-none tracking-[-0.02em] sm:text-5xl md:mt-4 md:gap-1 md:text-6xl lg:text-7xl xl:text-7xl 2xl:text-[clamp(3rem,4vw,4.5rem)]"
                style={{
                  fontFamily: "Mungyeong-Gamhong-Apple, sans-serif",
                  ["--depth-x" as string]: "10",
                  ["--depth-y" as string]: "6",
                }}
                tabIndex={0}
              >
                <span className="block overflow-visible py-0.5">{t("landing.heroLine1")}</span>
                <span className="block overflow-visible py-0.5">{t("landing.heroLine2")}</span>
              </span>
            </h1>
          </Reveal>
        </div>

        <Reveal delay={1.1} className="relative z-10 mt-8 md:mt-10">
          <Button
            variant="primary"
            onClick={onOpenEditor}
            className="relative z-10 px-8 py-4 text-base font-extrabold shadow-sm sm:px-10 sm:text-lg"
          >
            {t("landing.startDrawing")}
          </Button>
        </Reveal>
      </div>

      <TteuniHeroPeek />
    </section>
  );
}

export default memo(HeroSection);
