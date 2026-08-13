import { type MotionValue } from "framer-motion";
import BrandTextLogo from "./components/ui/BrandTextLogo.tsx";

type TextDrawingProps = {
  scrollYProgress: MotionValue<number>;
  /** 페이지 스크롤 진행도 중 텍스트가 그려지는 구간 (0~1) */
  range?: [number, number];
};

export default function TextDrawing(_props: TextDrawingProps) {
  return (
    <div
      className="relative h-[120vh] w-full"
      aria-label="메인 타이틀 스크롤 드로잉"
    >
      <div className="sticky top-0 flex h-screen items-center justify-center px-4 sm:px-8">
        <BrandTextLogo className="h-16 w-auto max-w-[90vw] object-contain sm:h-20 md:h-24" />
        <p className="pointer-events-none absolute bottom-[18vh] text-sm text-stone-400">
          스크롤하여 글씨를 꿰매 보세요
        </p>
      </div>
    </div>
  );
}
