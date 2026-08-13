import { motion } from "framer-motion";

/**
 * 니팅힙 감성 미니멀 웰컴 배너
 * - 테두리 없는 오트밀 크림 면(Fill) 카드 + 파스텔 번짐 섀도우
 * - 좌측: 카테고리 칩 → 타이틀(문경감홍사과체) → 서브타이틀 계층
 * - 우측: 코랄 실타래 뒤에서 몽글몽글 부유하는 뜨니 페르소나
 */
type WelcomeBannerProps = {
  chip: string;
  title: string;
  subtitle: string;
  /** 뜨니 이미지 경로 (TTEUNI_IMAGES.*) */
  image: string;
};

function CoralYarnBall() {
  return (
    <svg
      viewBox="0 0 96 96"
      className="absolute -bottom-1 -right-1 h-24 w-24 md:h-28 md:w-28"
      aria-hidden
    >
      <circle cx="48" cy="48" r="42" fill="#FC5F53" />
      <path
        d="M12 36 C 38 22, 62 22, 84 38"
        stroke="#FFB3B3"
        strokeWidth="4"
        fill="none"
        strokeLinecap="round"
        opacity="0.9"
      />
      <path
        d="M8 52 C 38 40, 64 42, 88 56"
        stroke="#FFB3B3"
        strokeWidth="4"
        fill="none"
        strokeLinecap="round"
        opacity="0.7"
      />
      <path
        d="M14 68 C 42 58, 62 60, 82 72"
        stroke="#FFB3B3"
        strokeWidth="4"
        fill="none"
        strokeLinecap="round"
        opacity="0.5"
      />
    </svg>
  );
}

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
          className="break-keep font-gamhong text-2xl tracking-tight text-stone-900 sm:text-3xl"
          style={{ fontFamily: "Mungyeong-Gamhong-Apple, sans-serif" }}
        >
          {title}
        </h1>
        <p className="mt-2.5 max-w-xl break-keep font-sans text-sm font-light leading-relaxed text-stone-500 sm:text-base">
          {subtitle}
        </p>
      </div>

      {/* 실타래 + 뜨니 페르소나 그래픽 */}
      <div className="relative hidden h-32 w-40 shrink-0 sm:block md:h-36 md:w-44" aria-hidden>
        {/* 뜨니 — 실타래 뒤에서 숨 쉬듯 부유 */}
        <motion.img
          src={image}
          alt=""
          className="absolute left-0 top-0 h-28 w-28 object-contain md:h-32 md:w-32"
          animate={{ y: [0, -6, 0] }}
          transition={{ repeat: Infinity, duration: 2.8, ease: "easeInOut" }}
        />
        <CoralYarnBall />
      </div>
    </div>
  );
}
