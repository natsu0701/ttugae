import { memo, useRef } from "react";
import { Swiper, SwiperSlide, type SwiperRef } from "swiper/react";
import { Autoplay, Pagination, EffectCreative } from "swiper/modules";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { landingSection } from "./landingStyles.ts";
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
    border-radius: 2.5rem;
  }
  .custom-swiper-pagination .swiper-pagination-bullet {
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
  .custom-swiper-pagination .swiper-pagination-bullet-active {
    width: 22px;
    background: #FC5F53;
  }
`;

const ARROW_BTN =
  "flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-stone-200 bg-white text-stone-600 shadow-sm transition-all duration-200 hover:scale-110 hover:border-stone-300 hover:text-coral";

function AppPromotionSection() {
  const swiperRef = useRef<SwiperRef>(null);

  return (
    <section className={landingSection.promo}>
      <Reveal className="mx-auto max-w-7xl">
        <div className="rounded-[2.5rem] bg-gray-100">
          <div className="grid items-center gap-12 p-10 md:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] md:gap-16 md:p-14 lg:p-16">
            <div>
              <h2 className="flex flex-col gap-2 font-sans text-2xl font-bold leading-none text-black sm:text-3xl md:gap-2.5 md:text-4xl">
                <span>실전 뜨개질은 뜨니와 함께!</span>
                <span>AR 내비게이션 앱</span>
              </h2>
              <p className="mt-5 font-seoyun text-[1.5rem] font-normal leading-tight text-gray-700 md:text-[1.7rem]">
                웹에서 그린 도안을 앱으로 연동해 보세요. 카메라로 비추면 다음 코를
                안내해 줍니다.
              </p>
              <div className="flex flex-wrap gap-3 pt-6">
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

            <div
              className="app-promo-swiper relative mx-auto flex w-full max-w-[34rem] flex-col items-center md:max-w-[40rem] lg:max-w-none"
              aria-roledescription="carousel"
              aria-label="앱 홍보 목업"
            >
              <div className="relative w-full">
                <button
                  type="button"
                  onClick={() => swiperRef.current?.swiper.slidePrev()}
                  className={`${ARROW_BTN} absolute left-0 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2`}
                  aria-label="이전 목업"
                >
                  <ChevronLeft className="h-5 w-5" strokeWidth={2.2} />
                </button>

                <div className="overflow-hidden rounded-[2.5rem]">
                  <Swiper
                    ref={swiperRef}
                    modules={[Autoplay, Pagination, EffectCreative]}
                    effect={"creative"}
                    grabCursor={true}
                    centeredSlides={true}
                    loop={true}
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
                      el: ".custom-swiper-pagination",
                      clickable: true,
                    }}
                    className="w-full"
                  >
                    {SLIDES.map((slide) => (
                      <SwiperSlide key={slide.src}>
                        <img src={slide.src} alt={slide.alt} className="pointer-events-none select-none" />
                      </SwiperSlide>
                    ))}
                  </Swiper>
                </div>

                <button
                  type="button"
                  onClick={() => swiperRef.current?.swiper.slideNext()}
                  className={`${ARROW_BTN} absolute right-0 top-1/2 z-10 -translate-y-1/2 translate-x-1/2`}
                  aria-label="다음 목업"
                >
                  <ChevronRight className="h-5 w-5" strokeWidth={2.2} />
                </button>
              </div>

              <div className="custom-swiper-pagination mt-5 flex justify-center gap-1.5 py-1.5" />
            </div>
          </div>
        </div>
      </Reveal>
      <style>{css}</style>
    </section>
  );
}

export default memo(AppPromotionSection);
