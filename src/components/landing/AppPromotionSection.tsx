import { memo, useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, EffectCreative } from "swiper/modules";
import type { Swiper as SwiperClass } from "swiper";
import { ChevronLeftFillIcon, ChevronRightFillIcon } from "../icons/FillIcons.tsx";
import Reveal from "./Reveal.tsx";

import "swiper/css";
import "swiper/css/effect-creative";
import "swiper/css/pagination";
import "swiper/css/autoplay";

const SLIDES = [
  {
    src: "/images/App_mockup_1.png",
    alt: "뜨니 AR 앱 모바일 목업 1",
  },
  {
    src: "/images/App_mockup_2.png",
    alt: "뜨니 AR 앱 모바일 목업 2",
  },
  {
    src: "/images/App_mockup_3.png",
    alt: "뜨니 AR 앱 모바일 목업 3",
  },
] as const;

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
    width: 8px;
    height: 8px;
    background: rgba(252, 95, 83, 0.25);
    opacity: 1;
    border-radius: 9999px;
    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    border: none;
    cursor: pointer;
    margin: 0 4px !important;
  }
  .app-promo-pagination .swiper-pagination-bullet-active {
    width: 22px;
    background: #FC5F53;
  }
`;

const ARROW_BTN =
  "pointer-events-auto flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-stone-200 bg-white/90 text-stone-600 shadow-sm backdrop-blur-sm transition-all duration-200 hover:scale-110 hover:border-stone-300 hover:text-coral";

function AppPromotionSection() {
  const swiperRef = useRef<SwiperClass | null>(null);

  const slideBy = (direction: 1 | -1) => {
    const swiper = swiperRef.current;
    if (!swiper) return;
    if (direction > 0) swiper.slideNext();
    else swiper.slidePrev();
  };

  return (
    <section className="bg-white py-16 md:py-24">
      <Reveal>
        <div
          className="app-promo-swiper relative w-full"
          aria-roledescription="carousel"
          aria-label="앱 홍보 목업"
        >
          <div className="relative w-full">
            <button
              type="button"
              onClick={() => slideBy(-1)}
              className={`${ARROW_BTN} absolute left-4 top-1/2 z-20 -translate-y-1/2 md:left-8`}
              aria-label="이전 목업"
            >
              <ChevronLeftFillIcon className="h-5 w-5" />
            </button>

            <Swiper
              modules={[Autoplay, Pagination, EffectCreative]}
              effect="creative"
              grabCursor={true}
              rewind={true}
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
              pagination={{
                el: ".app-promo-pagination",
                clickable: true,
              }}
              onSwiper={(swiper) => {
                swiperRef.current = swiper;
              }}
              className="w-full"
            >
              {SLIDES.map((slide) => (
                <SwiperSlide key={slide.src}>
                  <img
                    src={slide.src}
                    alt={slide.alt}
                    className="pointer-events-none select-none"
                  />
                </SwiperSlide>
              ))}
            </Swiper>

            <button
              type="button"
              onClick={() => slideBy(1)}
              className={`${ARROW_BTN} absolute right-4 top-1/2 z-20 -translate-y-1/2 md:right-8`}
              aria-label="다음 목업"
            >
              <ChevronRightFillIcon className="h-5 w-5" />
            </button>
          </div>

          <div className="app-promo-pagination mt-5 flex justify-center gap-1.5 py-1.5" />
        </div>

        <div className="mx-auto mt-20 max-w-3xl px-5 text-center md:mt-28 md:px-8">
          <h2 className="flex flex-col gap-2 font-sans text-2xl font-bold leading-none text-black sm:text-3xl md:gap-2.5 md:text-4xl">
            <span>실전 뜨개질은 뜨니와 함께!</span>
            <span>AR 내비게이션 앱</span>
          </h2>
          <p className="mt-5 font-seoyun text-[1.5rem] font-normal leading-tight text-gray-700 md:text-[1.7rem]">
            웹에서 그린 도안을 앱으로 연동해 보세요.
            <br />
            카메라로 비추면 다음 코를 안내해 줍니다.
          </p>
          <div className="flex flex-wrap justify-center gap-3 pt-6">
            <a
              href="https://apps.apple.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-10 items-center justify-center rounded-xl bg-stone-950 px-5 font-sans text-xs font-semibold text-white shadow-sm transition-colors hover:bg-stone-800"
            >
              App Store
            </a>
            <a
              href="https://play.google.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-10 items-center justify-center rounded-xl border border-stone-200 bg-white px-5 font-sans text-xs font-semibold text-stone-700 shadow-sm transition-colors hover:bg-stone-50"
            >
              Google Play
            </a>
          </div>
        </div>
      </Reveal>
      <style>{css}</style>
    </section>
  );
}

export default memo(AppPromotionSection);
