import { memo, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { CloseFillIcon } from "../icons/FillIcons.tsx";
import SmoothInput from "./SmoothInput.tsx";
import type { PatternCollection } from "../../utils/collectionStorage.ts";
import { UNFILED_COLLECTION_ID } from "../../utils/collectionStorage.ts";

type GiftPackagingAnimationProps = {
  isOpen: boolean;
  onClose: () => void;
  patternTitle: string;
  onTitleChange: (title: string) => void;
  collections: PatternCollection[];
  collectionId: string;
  onCollectionChange: (id: string) => void;
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
  onTitleChange,
  collections,
  collectionId,
  onCollectionChange,
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

  if (!isOpen) return null;

  return (
    <div className="fade-in fixed inset-0 z-[120] flex items-center justify-center bg-stone-950/70 p-6">
      <div className="relative w-full max-w-md rounded-xl bg-[#F7F5F0] px-8 py-10 text-center">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-stone-400 hover:bg-white hover:text-stone-700"
          aria-label={t("common.close")}
        >
          <CloseFillIcon className="h-4 w-4" />
        </button>
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

        <div className={packed ? "opacity-100" : "opacity-0"}>
          <p className="font-sans text-xs font-medium uppercase tracking-[0.18em] text-stone-400">
            {t("gift.packedChip")}
          </p>
          <h2 className="mt-2 font-sans text-xl font-bold text-stone-950">
            {t("gift.done")}
          </h2>
          <div className="mt-4 space-y-3 text-left">
            <SmoothInput
              label={t("editor.patternName")}
              value={patternTitle}
              onChange={(e) => onTitleChange(e.target.value)}
            />
            <label className="block font-sans text-sm text-stone-600">
              {t("gift.collection")}
              <select
                className="mt-1 w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-sm text-stone-800"
                value={collectionId}
                onChange={(e) => onCollectionChange(e.target.value)}
              >
                <option value={UNFILED_COLLECTION_ID}>{t("mypage.patterns.unfiled")}</option>
                {collections.map((folder) => (
                  <option key={folder.id} value={folder.id}>
                    {folder.name}
                  </option>
                ))}
              </select>
            </label>
          </div>

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
              className="h-11 rounded-xl border border-stone-200 bg-white px-5 font-sans text-sm font-medium text-stone-600 hover:bg-stone-50"
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
