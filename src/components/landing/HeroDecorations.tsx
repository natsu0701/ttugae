import { memo, useEffect, useRef } from "react";
import { assetUrl } from "../../utils/appPath.ts";

type Floater = {
  src: string;
  className: string;
  duration: number;
  delay: number;
  y: number;
  dx: number;
  dy: number;
};

function asset(name: string) {
  return assetUrl(`/images/${encodeURIComponent(name)}`);
}

const FLOATERS: Floater[] = [
  {
    src: asset("Stroked Image1.png"),
    className: "hidden lg:block left-4 top-[30%] w-14 lg:left-[10%] lg:w-[10.5rem] xl:left-[10%]",
    duration: 4.4,
    delay: 0.15,
    y: -14,
    dx: 72,
    dy: 36,
  },
  {
    src: asset("Stroked Image2.png"),
    className: "hidden lg:block right-4 top-[30%] w-12 lg:right-12 lg:w-[14rem] xl:right-16",
    duration: 5.1,
    delay: 0.6,
    y: -11,
    dx: 80,
    dy: 34,
  },
  {
    src: asset("Star 1.png"),
    className: "hidden lg:block left-4 top-[28%] h-10 w-10 lg:left-12 xl:left-16",
    duration: 3.2,
    delay: 0.05,
    y: -10,
    dx: 54,
    dy: 48,
  },
  {
    src: asset("Star 2.png"),
    className: "hidden lg:block right-4 top-[26%] h-7 w-7 lg:right-12 xl:right-16",
    duration: 3.8,
    delay: 0.9,
    y: -12,
    dx: 50,
    dy: 44,
  },
  {
    src: asset("Ellipse 2.png"),
    className: "hidden lg:block left-4 bottom-[12%] w-9 lg:left-12 lg:w-11 xl:left-16",
    duration: 4.8,
    delay: 0.35,
    y: -13,
    dx: 36,
    dy: 28,
  },
  {
    src: asset("Ellipse 3.png"),
    className: "hidden lg:block right-4 bottom-[22%] w-10 lg:right-12 lg:w-12 xl:right-24",
    duration: 3.6,
    delay: 1.1,
    y: -9,
    dx: 40,
    dy: 30,
  },
  {
    src: asset("Ellipse 4.png"),
    className: "hidden lg:block left-[10%] top-[60%] w-6 lg:left-[18%] lg:w-6 xl:left-[20%]",
    duration: 5.0,
    delay: 0.45,
    y: -16,
    dx: 32,
    dy: 38,
  },
];

function HeroDecorations() {
  const layerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const layer = layerRef.current;
    if (!layer) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;
    let frame = 0;

    const tick = () => {
      currentX += (targetX - currentX) * 0.08;
      currentY += (targetY - currentY) * 0.08;
      layer.style.setProperty("--par-x", currentX.toFixed(4));
      layer.style.setProperty("--par-y", currentY.toFixed(4));
      frame = requestAnimationFrame(tick);
    };

    const onMove = (event: MouseEvent | PointerEvent) => {
      if ("pointerType" in event && event.pointerType === "touch") return;
      const width = window.innerWidth || 1;
      const height = window.innerHeight || 1;
      targetX = (event.clientX / width - 0.5) * 2;
      targetY = (event.clientY / height - 0.5) * 2;
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("mousemove", onMove, { passive: true });
    frame = requestAnimationFrame(tick);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div
      ref={layerRef}
      className="pointer-events-none absolute inset-0 z-[5] h-full w-full overflow-hidden"
      aria-hidden
    >
      {FLOATERS.map((item) => (
        <div
          key={item.src}
          className={`hero-floater absolute ${item.className}`}
          style={{
            ["--par-dx" as string]: `${item.dx}px`,
            ["--par-dy" as string]: `${item.dy}px`,
          }}
        >
          <div
            className="hero-floater-bob h-full w-full"
            style={{
              ["--float-dur" as string]: `${item.duration}s`,
              ["--float-delay" as string]: `${item.delay}s`,
              ["--float-y" as string]: `${item.y}px`,
            }}
          >
            <img
              src={item.src}
              alt=""
              className="pointer-events-none h-full w-full select-none object-contain"
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export default memo(HeroDecorations);
