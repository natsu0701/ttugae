import { memo, useEffect } from "react";
import { motion, useAnimation } from "framer-motion";
import { TTEUNI_IMAGES } from "../../constants/tteuniImages.ts";

/** 반신이 보이는 안착 위치 (입까지만 노출) */
export const TTEUNI_REST_Y = "53%";

const ENTRANCE_SPRING = {
  type: "spring" as const,
  stiffness: 110,
  damping: 17,
  mass: 0.9,
};

const FLOAT_KEYFRAMES = [TTEUNI_REST_Y, "50%", TTEUNI_REST_Y, "56%", TTEUNI_REST_Y];

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
      className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-[11rem] overflow-hidden sm:h-[20rem] md:h-[25rem]"
      aria-hidden
    >
      <motion.img
        src={TTEUNI_IMAGES.hero}
        alt=""
        className="absolute bottom-0 left-1/2 h-auto w-[26rem] max-w-none object-contain object-bottom sm:w-[30rem] md:w-[36rem] lg:w-[28rem]"
        initial={{ y: "100%", x: "-50%" }}
        animate={controls}
        style={{ x: "-50%" }}
      />
    </div>
  );
}

export default memo(TteuniHeroPeek);
