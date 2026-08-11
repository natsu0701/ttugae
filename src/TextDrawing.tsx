import { useLayoutEffect, useRef, useState } from "react";
import {
  motion,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";

const MAIN_COPY = "뜨개러투게더";
const STROKE_COLOR = "#F4A4B8";

type TextDrawingProps = {
  scrollYProgress: MotionValue<number>;
  /** 페이지 스크롤 진행도 중 텍스트가 그려지는 구간 (0~1) */
  range?: [number, number];
};

export default function TextDrawing({
  scrollYProgress,
  range = [0.06, 0.22],
}: TextDrawingProps) {
  const textRef = useRef<SVGTextElement>(null);
  const [strokeLength, setStrokeLength] = useState(0);

  const drawProgress = useSpring(
    useTransform(scrollYProgress, range, [0, 1]),
    { stiffness: 88, damping: 28, mass: 0.35 },
  );

  useLayoutEffect(() => {
    const measure = () => {
      const node = textRef.current;
      if (!node) return;

      const length =
        (
          node as unknown as {
            getTotalLength?: () => number;
          }
        ).getTotalLength?.() ?? 0;
      if (length > 0) {
        setStrokeLength(length);
        return;
      }

      const { width, height } = node.getBBox();
      setStrokeLength((width + height) * 2.5);
    };

    measure();
    document.fonts?.ready?.then(measure);
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  const strokeDashoffset = useTransform(drawProgress, (p) =>
    strokeLength > 0 ? strokeLength * (1 - p) : 0,
  );

  const guideOpacity = useTransform(drawProgress, [0, 0.08], [0.35, 0.2]);

  return (
    <div
      className="relative h-[120vh] w-full"
      aria-label="메인 타이틀 스크롤 드로잉"
    >
      <div className="sticky top-0 flex h-screen items-center justify-center px-4 sm:px-8">
        <svg
          viewBox="0 0 800 140"
          className="w-full max-w-6xl overflow-visible"
          role="img"
          aria-label={MAIN_COPY}
        >
          <motion.text
            x="400"
            y="78"
            textAnchor="middle"
            dominantBaseline="middle"
            fontFamily="Jua, sans-serif"
            fontSize={88}
            fill="transparent"
            stroke="#E8DDD0"
            strokeWidth={2}
            strokeDasharray="8 10"
            strokeLinecap="round"
            style={{ opacity: guideOpacity }}
          >
            {MAIN_COPY}
          </motion.text>

          <motion.text
            ref={textRef}
            x="400"
            y="78"
            textAnchor="middle"
            dominantBaseline="middle"
            fontFamily="Jua, sans-serif"
            fontSize={88}
            fill="transparent"
            stroke={STROKE_COLOR}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            paintOrder="stroke fill"
            style={{
              strokeDasharray:
                strokeLength > 0 ? strokeLength : undefined,
              strokeDashoffset:
                strokeLength > 0 ? strokeDashoffset : undefined,
            }}
          >
            {MAIN_COPY}
          </motion.text>
        </svg>

        <p className="pointer-events-none absolute bottom-[18vh] text-sm text-stone-400">
          스크롤하여 글씨를 꿰매 보세요
        </p>
      </div>
    </div>
  );
}
