import { memo, useEffect } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

type Floater = {
  src: string;
  className: string;
  duration: number;
  delay: number;
  y: number;
  axis: "button" | "yarn" | "needle" | "loop";
};

function asset(name: string) {
  return `/images/${encodeURIComponent(name)}`;
}

const FLOATERS: Floater[] = [
  {
    src: asset("Stroked Image1.png"),
    className:
      "hidden lg:block left-4 top-[30%] w-14 lg:left-[10%] lg:w-[10.5rem] xl:left-[10%]",
    duration: 4.4,
    delay: 0.15,
    y: -14,
    axis: "button",
  },
  {
    src: asset("Stroked Image2.png"),
    className:
      "hidden lg:block right-4 top-[30%] w-12 lg:right-12 lg:w-[14rem] xl:right-16",
    duration: 5.1,
    delay: 0.6,
    y: -11,
    axis: "needle",
  },
  {
    src: asset("Star 1.png"),
    className:
      "hidden lg:block left-4 top-[28%] h-10 w-10 lg:left-12 xl:left-16",
    duration: 3.2,
    delay: 0.05,
    y: -10,
    axis: "yarn",
  },
  {
    src: asset("Star 2.png"),
    className:
      "hidden lg:block right-4 top-[26%] h-7 w-7 lg:right-12 xl:right-16",
    duration: 3.8,
    delay: 0.9,
    y: -12,
    axis: "loop",
  },
  {
    src: asset("Ellipse 2.png"),
    className:
      "hidden lg:block left-4 bottom-[12%] w-9 lg:left-12 lg:w-11 xl:left-16",
    duration: 4.8,
    delay: 0.35,
    y: -13,
    axis: "yarn",
  },
  {
    src: asset("Ellipse 3.png"),
    className:
      "hidden lg:block right-4 bottom-[22%] w-10 lg:right-12 lg:w-12 xl:right-24",
    duration: 3.6,
    delay: 1.1,
    y: -9,
    axis: "loop",
  },
  {
    src: asset("Ellipse 4.png"),
    className:
      "hidden lg:block left-[10%] top-[60%] w-6 lg:left-[18%] lg:w-6 xl:left-[20%]",
    duration: 5.0,
    delay: 0.45,
    y: -16,
    axis: "button",
  },
];

function HeroDecorations() {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 32, stiffness: 75, mass: 0.6 };
  const springX = useSpring(mouseX, springConfig);
  const springY = useSpring(mouseY, springConfig);

  const buttonX = useTransform(springX, [-0.5, 0.5], [-18, 18]);
  const buttonY = useTransform(springY, [-0.5, 0.5], [-18, 18]);
  const yarnX = useTransform(springX, [-0.5, 0.5], [25, -25]);
  const yarnY = useTransform(springY, [-0.5, 0.5], [25, -25]);
  const needleX = useTransform(springX, [-0.5, 0.5], [-15, 15]);
  const needleY = useTransform(springY, [-0.5, 0.5], [-15, 15]);
  const loopX = useTransform(springX, [-0.5, 0.5], [20, -20]);
  const loopY = useTransform(springY, [-0.5, 0.5], [20, -20]);

  const axes = {
    button: { x: buttonX, y: buttonY },
    yarn: { x: yarnX, y: yarnY },
    needle: { x: needleX, y: needleY },
    loop: { x: loopX, y: loopY },
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX / window.innerWidth - 0.5);
      mouseY.set(e.clientY / window.innerHeight - 0.5);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  return (
    <div
      className="pointer-events-none absolute inset-0 z-[5] h-full w-full overflow-hidden"
      aria-hidden
    >
      {FLOATERS.map((item) => (
        <motion.div
          key={item.src}
          style={axes[item.axis]}
          className={`absolute ${item.className}`}
        >
          <motion.img
            src={item.src}
            alt=""
            className="pointer-events-none h-full w-full select-none object-contain"
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
        </motion.div>
      ))}
    </div>
  );
}

export default memo(HeroDecorations);
