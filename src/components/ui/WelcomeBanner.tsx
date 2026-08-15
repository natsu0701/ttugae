import { motion } from "framer-motion";

/**
 * 니팅힙 감성 미니멀 웰컴 배너
 * - 테두리 없는 오트밀 크림 면(Fill) 카드 + 파스텔 번짐 섀도우
 * - 좌측: 카테고리 칩 → 타이틀(문경감홍사과체) → 서브타이틀 계층
 * - 우측: 몽글몽글 부유하는 뜨니 페르소나
 */
type WelcomeBannerProps = {
  chip: string;
  title: string;
  subtitle: string;
  /** 뜨니 이미지 경로 (TTEUNI_IMAGES.*) */
  image: string;
};

export default function WelcomeBanner({
  chip,
  title,
  subtitle,
  image,
}: WelcomeBannerProps) {
  return (
    <div className="relative flex flex-col items-center justify-between gap-6 overflow-hidden rounded-3xl bg-[#FFFBF7] p-8 shadow-[0_8px_30px_rgb(252,95,83,0.02)] sm:p-10 md:flex-row">
      <div className="w-full min-w-0 md:flex-1">
        <span className="mb-3 block w-fit rounded-full bg-[#FC5F53]/10 px-3 py-1 font-sans text-[10px] font-bold uppercase tracking-widest text-[#FC5F53]">
          {chip}
        </span>
        <h1
          className="break-keep font-gamhong text-2xl font-normal tracking-tight text-stone-900 sm:text-3xl"
          style={{
            fontFamily: "Mungyeong-Gamhong-Apple, sans-serif",
            fontWeight: 400,
            WebkitTextStroke: 0,
            textShadow: "none",
          }}
        >
          {title}
        </h1>
        <p className="mt-2.5 max-w-xl break-keep font-seoyun text-base font-normal leading-relaxed text-stone-500 sm:text-lg">
          {subtitle}
        </p>
      </div>

      <div className="relative hidden h-32 w-32 shrink-0 sm:block md:h-36 md:w-36" aria-hidden>
        <motion.img
          src={image}
          alt=""
          className="h-28 w-28 object-contain md:h-32 md:w-32"
          animate={{ y: [0, -6, 0] }}
          transition={{ repeat: Infinity, duration: 2.8, ease: "easeInOut" }}
        />
      </div>
    </div>
  );
}
