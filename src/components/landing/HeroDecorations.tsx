import { memo } from "react";
import { assetUrl } from "../../utils/appPath.ts";

type Floater = {
  src: string;
  className: string;
  duration: number;
  delay: number;
  y: number;
  depthX: number;
  depthY: number;
};

function asset(name: string) {
  return assetUrl(`/images/${encodeURIComponent(name)}`);
}

const FLOATERS: Floater[] = [
  {
    src: asset("Stroked Image1.png"),
    className:
      "hidden sm:block left-[2%] top-[26%] w-[clamp(4.25rem,11vw,12rem)] md:left-[4%] lg:left-[7%]",
    duration: 4.4,
    delay: 0.15,
    y: -14,
    depthX: 22,
    depthY: 16,
  },
  {
    src: asset("Stroked Image2.png"),
    className:
      "hidden sm:block right-[2%] top-[24%] w-[clamp(4.75rem,13vw,15rem)] md:right-[4%] lg:right-[6%]",
    duration: 5.1,
    delay: 0.6,
    y: -11,
    depthX: -20,
    depthY: 14,
  },
  {
    src: asset("Star 1.png"),
    className:
      "hidden sm:block left-[3%] top-[20%] h-[clamp(1.75rem,3.4vw,2.75rem)] w-[clamp(1.75rem,3.4vw,2.75rem)] md:left-[5%] lg:left-[8%]",
    duration: 3.2,
    delay: 0.05,
    y: -10,
    depthX: 16,
    depthY: 20,
  },
  {
    src: asset("Star 2.png"),
    className:
      "hidden sm:block right-[3%] top-[18%] h-[clamp(1.5rem,2.8vw,2.35rem)] w-[clamp(1.5rem,2.8vw,2.35rem)] md:right-[5%] lg:right-[8%]",
    duration: 3.8,
    delay: 0.9,
    y: -12,
    depthX: -14,
    depthY: 18,
  },
  {
    src: asset("Ellipse 2.png"),
    className:
      "hidden sm:block left-[4%] bottom-[12%] w-[clamp(2rem,3.6vw,3.25rem)] md:left-[6%] lg:left-[8%]",
    duration: 4.8,
    delay: 0.35,
    y: -13,
    depthX: 12,
    depthY: 10,
  },
  {
    src: asset("Ellipse 3.png"),
    className:
      "hidden sm:block right-[4%] bottom-[20%] w-[clamp(2.15rem,3.8vw,3.5rem)] md:right-[6%] lg:right-[10%]",
    duration: 3.6,
    delay: 1.1,
    y: -9,
    depthX: -12,
    depthY: 11,
  },
  {
    src: asset("Ellipse 4.png"),
    className:
      "hidden sm:block left-[12%] top-[58%] w-[clamp(1.35rem,2.4vw,2rem)] md:left-[16%] lg:left-[18%]",
    duration: 5.0,
    delay: 0.45,
    y: -16,
    depthX: 10,
    depthY: 14,
  },
];

function HeroDecorations() {
  return (
    <div
      className="pointer-events-none absolute inset-0 z-[5] h-full w-full overflow-hidden"
      aria-hidden
    >
      {FLOATERS.map((item) => (
        <div
          key={item.src}
          className={`hero-parallax-layer absolute ${item.className}`}
          style={{
            ["--depth-x" as string]: String(item.depthX),
            ["--depth-y" as string]: String(item.depthY),
          }}
        >
          <div
            className="hero-floater h-full w-full"
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
