import { useRef, type ReactNode } from "react";
import { motion, useInView } from "framer-motion";

const REVEAL_TRANSITION = {
  duration: 0.55,
  ease: [0.22, 1, 0.36, 1] as const,
};

type RevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  /** Y축 슬라이드 시작 오프셋 (px) — 웰컴 모션 싱크용 */
  y?: number;
  /** 떠오르는 시간 (초) — 배경 트랜지션과 박자를 맞출 때 지정 */
  duration?: number;
};

export default function Reveal({
  children,
  className = "",
  delay = 0,
  y = 24,
  duration = REVEAL_TRANSITION.duration,
}: RevealProps) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y }}
      transition={{ ...REVEAL_TRANSITION, duration, delay }}
    >
      {children}
    </motion.div>
  );
}
