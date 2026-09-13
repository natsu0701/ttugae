import { memo, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

type GiftPackagingAnimationProps = {
  isOpen: boolean;
  onClose: () => void;
  patternTitle: string;
  onGoVault?: () => void;
};

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
  const { t } = useTranslation();
  const [packed, setPacked] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setPacked(false);
      return;
    }
    const timer = window.setTimeout(() => setPacked(true), 1600);
    return () => window.clearTimeout(timer);
  }, [isOpen]);

  const displayTitle = patternTitle.trim() || t("gift.untitled");

  if (!isOpen) return null;

  return (
    <div
      className="fade-in fixed inset-0 z-[120] flex items-center justify-center bg-stone-950/70 p-6"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md rounded-xl bg-[#F7F5F0] px-8 py-10 text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative mx-auto h-52 w-52">
          <div className="gift-box" />
          <div className="gift-ribbon-v" />
          <div className="gift-ribbon-h" />
          <div className="gift-lid">
            <span className="absolute left-1/2 top-0 h-full w-5 -translate-x-1/2 bg-[#F7F5F0]/90" />
          </div>
          <div className="gift-bow">
            <RibbonBow />
          </div>
        </div>

        <div
          className={`transition-all duration-300 ${
            packed ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
          }`}
        >
          <p className="font-sans text-xs font-medium uppercase tracking-[0.18em] text-stone-400">
            Pattern packed
          </p>
          <h2 className="mt-2 font-sans text-xl font-bold text-stone-950">
            {t("gift.done")}
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
              {t("gift.toVault")}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="h-11 rounded-xl border border-stone-200 bg-white px-5 font-sans text-sm font-medium text-stone-600 transition-colors hover:bg-stone-50"
            >
              {t("gift.backEditor")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default memo(GiftPackagingAnimation);
