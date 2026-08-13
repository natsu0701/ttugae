import { memo } from "react";
import { motion } from "framer-motion";

type Floater = {
  src: string;
  className: string;
  duration: number;
  delay: number;
  y: number;
};

function asset(name: string) {
  return `/images/${encodeURIComponent(name)}`;
}

const FLOATERS: Floater[] = [
  {
    src: asset("Stroked Image1.png"),
    className:
      "pointer-events-none hidden lg:block left-4 top-[28%] w-14 lg:left-12 lg:w-[8.5rem] xl:left-16",
    duration: 4.4,
    delay: 0.15,
    y: -14,
  },
  {
    src: asset("Stroked Image2.png"),
    className:
      "pointer-events-none hidden lg:block right-4 top-[26%] w-12 lg:right-12 lg:w-[12rem] xl:right-16",
    duration: 5.1,
    delay: 0.6,
    y: -11,
  },
  {
    src: asset("Star 1.png"),
    className:
      "pointer-events-none hidden lg:block left-4 top-[18%] h-10 w-10 lg:left-12 xl:left-16",
    duration: 3.2,
    delay: 0.05,
    y: -10,
  },
  {
    src: asset("Star 2.png"),
    className:
      "pointer-events-none hidden lg:block right-4 top-[20%] h-7 w-7 lg:right-12 xl:right-16",
    duration: 3.8,
    delay: 0.9,
    y: -12,
  },
  {
    src: asset("Ellipse 2.png"),
    className:
      "pointer-events-none hidden lg:block left-4 bottom-[12%] w-9 lg:left-12 lg:w-11 xl:left-16",
    duration: 4.8,
    delay: 0.35,
    y: -13,
  },
  {
    src: asset("Ellipse 3.png"),
    className:
      "pointer-events-none hidden lg:block right-4 bottom-[16%] w-10 lg:right-12 lg:w-12 xl:right-16",
    duration: 3.6,
    delay: 1.1,
    y: -9,
  },
  {
    src: asset("Ellipse 4.png"),
    className:
      "pointer-events-none hidden lg:block left-4 top-[42%] w-8 lg:left-12 lg:w-10 xl:left-16",
    duration: 5.0,
    delay: 0.45,
    y: -16,
  },
];

function HeroDecorations() {
  return (
    <div
      className="pointer-events-none absolute inset-0 z-[5] overflow-hidden"
      aria-hidden
    >
      {FLOATERS.map((item) => (
        <motion.img
          key={item.src}
          src={item.src}
          alt=""
          className={`pointer-events-none absolute object-contain ${item.className}`}
          animate={{
            y: [0, item.y, 0],
            rotate: [0, 5, -5, 0],
          }}
          transition={{
            duration: item.duration,
            delay: item.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

export default memo(HeroDecorations);
