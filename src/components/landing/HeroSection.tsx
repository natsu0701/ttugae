import { memo, type MouseEvent } from "react";
import { motion } from "framer-motion";
import Button from "../ui/Button.tsx";
import { playWelcomeKnitSound } from "../../utils/audioEffects.ts";
import { landingSection } from "./landingStyles.ts";
import HeroDecorations from "./HeroDecorations.tsx";
import Reveal from "./Reveal.tsx";
import TteuniHeroPeek from "./TteuniHeroPeek.tsx";

type HeroSectionProps = {
  onOpenEditor: () => void;
};

const HERO_SLOGAN_LINES = ["뜨개질에만", "집중하세요!"] as const;

function HeroSection({ onOpenEditor }: HeroSectionProps) {
  const handleCharMove = (e: MouseEvent<HTMLSpanElement>) => {
    const el = e.currentTarget;
    const rect = el.getBoundingClientRect();
    el.style.setProperty("--mouse-x", `${e.clientX - rect.left}px`);
    el.style.setProperty("--mouse-y", `${e.clientY - rect.top}px`);
  };

  return (
    <section className={`${landingSection.hero} relative isolate overflow-hidden`}>
      <video
        src="/web_back.mp4"
        className="pointer-events-none absolute inset-0 z-0 h-full w-full object-cover"
        autoPlay
        loop
        muted
        playsInline
        aria-hidden
      />

      {/* 웰컴 그라데이션 오버레이 필터 (따스한 분위기 연출 및 6px 최적화 블러 적용) */}
      <motion.div
        className="absolute inset-0 z-0"
        initial={{
          backgroundColor: "rgba(244, 164, 184, 0.45)",
          backdropFilter: "blur(4px)",
        }}
        animate={{
          backgroundColor: "rgba(247, 245, 240, 0.2)",
          backdropFilter: "blur(6px)",
        }}
        transition={{
          duration: 1.8,
          ease: "easeOut",
        }}
        aria-hidden
      />

      <HeroDecorations />

      {/* 텍스트 컨테이너 여백 (레이스 아래 안전지대 확보) */}
      <div className="relative z-10 mx-auto w-full max-w-none text-center pt-28 sm:pt-36 md:pt-44">
        <div className="mx-auto max-w-4xl px-6 py-4">
          <Reveal delay={0.4}>
            <h1 className="break-keep">
              {/* 1줄 리드 카피 - 슬림하고 세련된 고딕 */}
              <span className="block font-sans text-lg font-semibold leading-relaxed tracking-[0.04em] text-white/80 [text-shadow:0_1px_3px_rgba(0,0,0,0.12),0_6px_24px_rgba(0,0,0,0.18)] sm:text-xl md:text-2xl">
                복잡한 도안은 뜨니에게 맡기고,
              </span>

              {/*
                2줄 메인 슬로건 - 문경감홍사과체
                마우스 위치를 정교하게 트래킹하는 솜사탕 그라데이션 효과
              */}
              <span
                className="interactive-gradient-text mt-3 flex cursor-pointer flex-col items-center gap-0.5 overflow-visible break-keep font-gamhong text-4xl font-normal leading-none tracking-[-0.02em] sm:text-5xl md:mt-4 md:gap-1 md:text-6xl lg:text-7xl"
                style={{ fontFamily: "Mungyeong-Gamhong-Apple, sans-serif" }}
              >
                {HERO_SLOGAN_LINES.map((line) => (
                  <span key={line} className="block overflow-visible py-0.5">
                    {line.split("").map((char, index) => (
                      <span
                        key={`${line}-${char}-${index}`}
                        className="interactive-gradient-char"
                        onMouseMove={handleCharMove}
                      >
                        {char}
                      </span>
                    ))}
                  </span>
                ))}
              </span>
            </h1>
          </Reveal>
        </div>

        {/* 3줄 서브 설명 */}
        <Reveal delay={0.75}>
          <p className="mx-auto mt-0.5 max-w-xl font-seoyun text-lg font-light leading-tight tracking-[0.05em] text-white/60 [text-shadow:0_1px_2px_rgba(0,0,0,0.14),0_4px_16px_rgba(0,0,0,0.16)] sm:text-xl md:mt-1 md:text-[1.3rem]">
            에디터부터 AI 챗봇, 커뮤니티까지 
            뜨개질의 모든 순간을 한곳에서.
          </p>
        </Reveal>

        {/* 시작 버튼 그룹 */}
        <Reveal delay={1.1} className="relative z-10 mt-8 md:mt-10">
          <Button
            variant="primary"
            onMouseEnter={playWelcomeKnitSound}
            onClick={() => {
              playWelcomeKnitSound();
              onOpenEditor();
            }}
            className="relative z-10 px-8 py-4 text-base font-extrabold sm:px-10 sm:text-lg"
          >
            도안 그리기
          </Button>
        </Reveal>
      </div>

      {/* 마스코트 뜨니 배치 */}
      <TteuniHeroPeek />

      {/*
        hover 시 텍스트 컬러가 transparent로 스르륵 변하며 클립된 그라데이션이 자연스럽게 투사됩니다.
        메인 옐로우(#FFD438) 중심부에서 밝은 레몬(#FFE89A)으로 펼쳐지는 180px 반경의 빛의 털실 질감입니다.
      */}
      <style>{`
        .interactive-gradient-text {
          color: #ffffff;
          -webkit-text-fill-color: #ffffff;
          -webkit-text-stroke: 0;
          text-shadow: none;
          paint-order: fill;
        }

        .interactive-gradient-char {
          display: inline-block;
          overflow: visible;
          /* 장식 서체 획이 박스 밖으로 나가도 잘리지 않도록 클립 영역을 넓힘 */
          padding: 0.22em 0.1em 0.28em;
          margin: -0.22em -0.1em -0.28em;
          line-height: 1.15;
          color: #ffffff;
          -webkit-text-fill-color: #ffffff;
          -webkit-text-stroke: 0;
          text-shadow: none;
          paint-order: fill;
          background-color: #ffffff;
          background-image: radial-gradient(
            circle 0px at var(--mouse-x, 50%) var(--mouse-y, 50%),
            #FFD438 0%,
            #FFE89A 45%,
            #FFFFFF 100%
          );
          -webkit-background-clip: text;
          background-clip: text;
          transition: -webkit-text-fill-color 0.28s cubic-bezier(0.16, 1, 0.3, 1),
            color 0.28s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .interactive-gradient-char:hover {
          color: transparent;
          -webkit-text-fill-color: transparent;
          transition: none;
          background-color: #ffffff;
          background-image: radial-gradient(
            circle 72px at var(--mouse-x, 50%) var(--mouse-y, 50%),
            #FFD438 0%,
            #FFE89A 55%,
            #FFD438 100%
          );
          animation: slogan-char-solidify 0.8s ease-out forwards;
        }

        @keyframes slogan-char-solidify {
          0% {
            color: transparent;
            -webkit-text-fill-color: transparent;
          }
          40% {
            color: transparent;
            -webkit-text-fill-color: transparent;
          }
          100% {
            color: #FFD438;
            -webkit-text-fill-color: #FFD438;
          }
        }
      `}</style>
    </section>
  );
}

export default memo(HeroSection);
