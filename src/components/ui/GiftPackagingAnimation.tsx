import { memo, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

type GiftPackagingAnimationProps = {
  isOpen: boolean;
  onClose: () => void;
  patternTitle: string;
  onGoVault?: () => void;
};

const BOX_EASE = [0.22, 1, 0.36, 1] as const;

function RibbonBow() {
  return (
    <svg viewBox="0 0 72 48" className="h-12 w-[4.5rem]" aria-hidden>
      <path
        d="M36 28 C22 6 8 8 10 20 C12 30 28 30 36 28 Z"
        fill="#F7F5F0"
        stroke="#E45A50"
        strokeWidth="1.2"
      />
      <path
        d="M36 28 C50 6 64 8 62 20 C60 30 44 30 36 28 Z"
        fill="#F7F5F0"
        stroke="#E45A50"
        strokeWidth="1.2"
      />
      <circle cx="36" cy="28" r="6" fill="#FC5F53" />
      <path d="M32 32 Q28 42 24 46" fill="none" stroke="#E45A50" strokeWidth="3" strokeLinecap="round" />
      <path d="M40 32 Q44 42 48 46" fill="none" stroke="#E45A50" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

function GiftPackagingAnimation({
  isOpen,
  onClose,
  patternTitle,
  onGoVault,
}: GiftPackagingAnimationProps) {
  const [packed, setPacked] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setPacked(false);
      return;
    }
    const timer = window.setTimeout(() => setPacked(true), 1600);
    return () => window.clearTimeout(timer);
  }, [isOpen]);

  const displayTitle = patternTitle.trim() || "새 도안";

  return (
    <AnimatePresence>
      {isOpen ? (
        <motion.div
          className="fixed inset-0 z-[120] flex items-center justify-center bg-stone-950/70 p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="relative w-full max-w-md rounded-[2rem] bg-[#F7F5F0] px-8 py-10 text-center"
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.45, ease: BOX_EASE }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative mx-auto h-52 w-52">
              <motion.div
                className="absolute left-1/2 top-1/2 h-32 w-40 rounded-xl bg-coral"
                initial={{ x: "-50%", y: "-42%", scale: 0.72, opacity: 0 }}
                animate={{ x: "-50%", y: "-42%", scale: 1, opacity: 1 }}
                transition={{ duration: 0.45, ease: BOX_EASE }}
              />

              <motion.div
                className="absolute left-1/2 top-1/2 h-32 w-5 bg-[#F7F5F0]/90"
                initial={{ x: "-50%", y: "-42%", opacity: 0 }}
                animate={{ x: "-50%", y: "-42%", opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.35, ease: BOX_EASE }}
              />

              <motion.div
                className="absolute left-1/2 top-1/2 h-5 w-40 bg-[#F7F5F0]/90"
                initial={{ x: "-50%", y: "-42%", opacity: 0 }}
                animate={{ x: "-50%", y: "-42%", opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.35, ease: BOX_EASE }}
              />

              <motion.div
                className="absolute left-1/2 top-1/2 h-11 w-44 rounded-t-xl bg-[#E45A50]"
                initial={{ x: "-50%", y: "-118%", opacity: 0, rotateX: 40 }}
                animate={{ x: "-50%", y: "-92%", opacity: 1, rotateX: 0 }}
                transition={{ delay: 0.35, duration: 0.55, ease: BOX_EASE }}
              >
                <span className="absolute left-1/2 top-0 h-full w-5 -translate-x-1/2 bg-[#F7F5F0]/90" />
              </motion.div>

              <motion.div
                className="absolute left-1/2 top-1/2"
                initial={{ x: "-50%", y: "-128%", scale: 0, opacity: 0 }}
                animate={{ x: "-50%", y: "-118%", scale: 1, opacity: 1 }}
                transition={{ delay: 0.85, type: "spring", stiffness: 320, damping: 18 }}
              >
                <RibbonBow />
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={packed ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
              transition={{ duration: 0.4, ease: BOX_EASE }}
            >
              <p className="font-sans text-xs font-medium uppercase tracking-[0.18em] text-stone-400">
                Pattern packed
              </p>
              <h2 className="mt-2 font-sans text-xl font-bold text-stone-950">
                도안 포장이 완료되었어요
              </h2>
              <p className="mt-2 line-clamp-2 font-sans text-sm font-normal text-stone-500">
                {displayTitle}
              </p>

              <div className="mt-8 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={onGoVault}
                  className="h-11 rounded-xl bg-stone-950 px-5 font-sans text-sm font-semibold text-white transition-colors hover:bg-coral"
                >
                  보관함으로 가기
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="h-11 rounded-xl border border-stone-200 bg-white px-5 font-sans text-sm font-medium text-stone-600 transition-colors hover:bg-stone-50"
                >
                  에디터로 돌아가기
                </button>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

export default memo(GiftPackagingAnimation);
