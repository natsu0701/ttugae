import { memo, useEffect } from "react";
import { motion, useAnimation } from "framer-motion";
import { TTEUNI_IMAGES } from "../../constants/tteuniImages.ts";

/**
 * 히어로 하단 안착 위치 (px) — 값이 작을수록 뜨니가 텍스트 쪽으로 올라옴.
 * 이미지 비율(705×776, 세로≈가로×1.10) 기준으로 래퍼 높이가
 * "이미지 폭 × 1.10 + (진폭 − REST_Y)" 이상이면 머리가 잘리지 않는다.
 */
const TTEUNI_REST_Y = 12;

const ENTRANCE_SPRING = {
  type: "spring" as const,
  stiffness: 110,
  damping: 17,
  mass: 0.9,
};

/** 부유 진폭 — 래퍼 천장(overflow-hidden)에 머리가 닿지 않는 범위로 제한 */
const FLOAT_AMPLITUDE = 8;

const FLOAT_KEYFRAMES = [
  TTEUNI_REST_Y,
  TTEUNI_REST_Y - FLOAT_AMPLITUDE,
  TTEUNI_REST_Y,
  TTEUNI_REST_Y + FLOAT_AMPLITUDE,
  TTEUNI_REST_Y,
];

const FLOAT_LOOP = {
  duration: 3.2,
  ease: "easeInOut" as const,
  repeat: Infinity,
  repeatType: "loop" as const,
};

function TteuniHeroPeek() {
  const controls = useAnimation();

  useEffect(() => {
    let active = true;

    void (async () => {
      await controls.start({
        y: TTEUNI_REST_Y,
        transition: ENTRANCE_SPRING,
      });

      if (!active) return;

      void controls.start({
        y: FLOAT_KEYFRAMES,
        transition: FLOAT_LOOP,
      });
    })();

    return () => {
      active = false;
      controls.stop();
    };
  }, [controls]);

  return (
    <div
      className="pointer-events-none relative z-10 mx-auto mt-2 flex h-[20rem] w-full shrink-0 items-end justify-center overflow-hidden sm:mt-4 sm:h-[25rem] md:h-[29rem] [@media(max-height:750px)]:h-[17rem]"
      aria-hidden
    >
      <motion.img
        src={TTEUNI_IMAGES.hero}
        alt=""
        className="relative h-auto w-[18rem] max-w-none object-contain object-bottom sm:w-[22rem] md:w-[26rem] [@media(max-height:750px)]:w-[15rem]"
        initial={{ y: 96 }}
        animate={controls}
        style={{ position: "relative" }}
      />
    </div>
  );
}

export default memo(TteuniHeroPeek);
