import { memo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectCreative } from "swiper/modules";
import type { Swiper as SwiperClass } from "swiper";
import { ChevronLeftFillIcon, ChevronRightFillIcon } from "../icons/FillIcons.tsx";
import Reveal from "./Reveal.tsx";
import { assetUrl } from "../../utils/appPath.ts";
import { landingHeading } from "./landingStyles.ts";

import "swiper/css";
import "swiper/css/effect-creative";
import "swiper/css/autoplay";

const SLIDE_SRCS = [
  assetUrl("/images/App_mockup_1.png"),
  assetUrl("/images/App_mockup_2.png"),
  assetUrl("/images/App_mockup_3.png"),
] as const;

const LAST_INDEX = SLIDE_SRCS.length - 1;
const LOOP_INDEX = SLIDE_SRCS.length;
const SLIDE_LOOP_SRCS = [...SLIDE_SRCS, SLIDE_SRCS[0]];

const css = `
  .app-promo-swiper .swiper,
  .app-promo-swiper .swiper-wrapper,
  .app-promo-swiper .swiper-slide {
    height: auto;
  }
  .app-promo-swiper .swiper-slide img {
    display: block;
    width: 100%;
    height: auto;
  }
  .app-promo-pagination .swiper-pagination-bullet {
    width: 16px;
    height: 4px;
    background: rgba(252, 95, 83, 0.25);
    opacity: 1;
    border-radius: 2px;
    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    border: none;
    cursor: pointer;
    margin: 0 4px !important;
    padding: 0;
  }
  .app-promo-pagination .swiper-pagination-bullet-active {
    width: 28px;
    background: #FC5F53;
  }
`;

const ARROW_BTN =
  "pointer-events-auto flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-stone-200 bg-white/90 text-stone-600 shadow-sm backdrop-blur-sm transition-colors duration-200 hover:border-stone-300 hover:text-coral";

function realSlideIndex(index: number) {
  return index % SLIDE_SRCS.length;
}

function AppPromotionSection() {
  const { t } = useTranslation();
  const swiperRef = useRef<SwiperClass | null>(null);
  const [realIndex, setRealIndex] = useState(0);

  const snapLoopClone = (swiper: SwiperClass) => {
    if (swiper.activeIndex >= LOOP_INDEX) {
      swiper.slideTo(0, 0);
    }
  };

  const slideBy = (direction: 1 | -1) => {
    const swiper = swiperRef.current;
    if (!swiper) return;
    if (direction > 0) swiper.slideNext();
    else swiper.slidePrev();
  };

  const goTo = (target: number) => {
    const swiper = swiperRef.current;
    if (!swiper) return;
    const current = realSlideIndex(swiper.activeIndex);
    if (target === current) return;
    if (target === 0 && current === LAST_INDEX) {
      swiper.slideTo(LOOP_INDEX);
      return;
    }
    swiper.slideTo(target);
  };

  return (
    <section className="bg-white py-16 md:py-24">
      <Reveal>
        <div
          className="app-promo-swiper relative w-full"
          aria-roledescription="carousel"
          aria-label={t("landing.promoAria")}
        >
          <div className="relative w-full">
            <button
              type="button"
              onClick={() => slideBy(-1)}
              className={`${ARROW_BTN} absolute left-4 top-1/2 z-20 -translate-y-1/2 md:left-8`}
              aria-label={t("landing.promoPrev")}
            >
              <ChevronLeftFillIcon className="h-5 w-5" />
            </button>

            <Swiper
              modules={[Autoplay, EffectCreative]}
              effect="creative"
              grabCursor={true}
              speed={500}
              observer={true}
              observeParents={true}
              autoHeight={true}
              autoplay={{
                delay: 3000,
                disableOnInteraction: false,
                pauseOnMouseEnter: true,
              }}
              creativeEffect={{
                prev: {
                  shadow: true,
                  translate: [0, 0, -400],
                },
                next: {
                  translate: ["100%", 0, 0],
                },
              }}
              onSwiper={(swiper) => {
                swiperRef.current = swiper;
              }}
              onSlideChange={(swiper) => {
                setRealIndex(realSlideIndex(swiper.activeIndex));
              }}
              onSlideChangeTransitionEnd={snapLoopClone}
              className="w-full"
            >
              {SLIDE_LOOP_SRCS.map((src, index) => (
                <SwiperSlide key={`${src}-${index}`}>
                  <img
                    src={src}
                    alt={t("landing.promoAlt", { n: realSlideIndex(index) + 1 })}
                    className="pointer-events-none select-none"
                  />
                </SwiperSlide>
              ))}
            </Swiper>

            <button
              type="button"
              onClick={() => slideBy(1)}
              className={`${ARROW_BTN} absolute right-4 top-1/2 z-20 -translate-y-1/2 md:right-8`}
              aria-label={t("landing.promoNext")}
            >
              <ChevronRightFillIcon className="h-5 w-5" />
            </button>
          </div>

          <div className="app-promo-pagination mt-5 flex justify-center gap-1.5 py-1.5">
            {SLIDE_SRCS.map((_, index) => (
              <button
                key={index}
                type="button"
                aria-label={t("landing.promoAlt", { n: index + 1 })}
                aria-current={index === realIndex ? "true" : undefined}
                className={`swiper-pagination-bullet${
                  index === realIndex ? " swiper-pagination-bullet-active" : ""
                }`}
                onClick={() => goTo(index)}
              />
            ))}
          </div>
        </div>

        <div className="page-shell mt-20 text-center md:mt-28">
          <h2 className={landingHeading.h2Center}>
            {t("landing.promoLine1")}
          </h2>
        </div>
      </Reveal>
      <style>{css}</style>
    </section>
  );
}

export default memo(AppPromotionSection);
