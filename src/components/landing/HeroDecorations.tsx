import { memo } from "react";
import { assetUrl } from "../../utils/appPath.ts";

type Floater = {
  src: string;
  className: string;
  duration: number;
  delay: number;
  y: number;
};

function asset(name: string) {
  return assetUrl(`/images/${encodeURIComponent(name)}`);
}

const FLOATERS: Floater[] = [
  {
    src: asset("Stroked Image1.png"),
    className:
      "hidden lg:block left-4 top-[30%] w-14 lg:left-[10%] lg:w-[10.5rem] xl:left-[10%]",
    duration: 4.4,
    delay: 0.15,
    y: -14,
  },
  {
    src: asset("Stroked Image2.png"),
    className:
      "hidden lg:block right-4 top-[30%] w-12 lg:right-12 lg:w-[14rem] xl:right-16",
    duration: 5.1,
    delay: 0.6,
    y: -11,
  },
  {
    src: asset("Star 1.png"),
    className:
      "hidden lg:block left-4 top-[28%] h-10 w-10 lg:left-12 xl:left-16",
    duration: 3.2,
    delay: 0.05,
    y: -10,
  },
  {
    src: asset("Star 2.png"),
    className:
      "hidden lg:block right-4 top-[26%] h-7 w-7 lg:right-12 xl:right-16",
    duration: 3.8,
    delay: 0.9,
    y: -12,
  },
  {
    src: asset("Ellipse 2.png"),
    className:
      "hidden lg:block left-4 bottom-[12%] w-9 lg:left-12 lg:w-11 xl:left-16",
    duration: 4.8,
    delay: 0.35,
    y: -13,
  },
  {
    src: asset("Ellipse 3.png"),
    className:
      "hidden lg:block right-4 bottom-[22%] w-10 lg:right-12 lg:w-12 xl:right-24",
    duration: 3.6,
    delay: 1.1,
    y: -9,
  },
  {
    src: asset("Ellipse 4.png"),
    className:
      "hidden lg:block left-[10%] top-[60%] w-6 lg:left-[18%] lg:w-6 xl:left-[20%]",
    duration: 5.0,
    delay: 0.45,
    y: -16,
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
          className={`hero-floater absolute ${item.className}`}
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
      ))}
    </div>
  );
}

export default memo(HeroDecorations);
