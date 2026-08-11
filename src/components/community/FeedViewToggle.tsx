import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import type { FeedViewMode } from "./PatternCard.tsx";

type FeedViewToggleProps = {
  value: FeedViewMode;
  onChange: (mode: FeedViewMode) => void;
};

export default function FeedViewToggle({ value, onChange }: FeedViewToggleProps) {
  const { t } = useTranslation();
  const isFinished = value === "finished";

  return (
    <div className="flex items-center gap-3">
      <span
        className={`font-sans text-sm font-normal transition-colors ${
          !isFinished ? "text-gray-900" : "text-gray-500"
        }`}
      >
        {t("community.feedPattern")}
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={isFinished}
        aria-label={t("community.feedToggleAria")}
        onClick={() => onChange(isFinished ? "pattern" : "finished")}
        className={`relative h-9 w-[4.5rem] rounded-full transition-colors duration-200 ${
          isFinished ? "bg-coral" : "bg-gray-300"
        }`}
      >
        <motion.span
          layout
          transition={{ type: "spring", stiffness: 500, damping: 35 }}
          className={`absolute top-1 h-7 w-7 rounded-full ${
            isFinished ? "bg-white" : "bg-coral"
          }`}
          style={{ left: isFinished ? "calc(100% - 1.75rem - 0.25rem)" : "0.25rem" }}
        />
      </button>
      <span
        className={`font-sans text-sm font-normal transition-colors ${
          isFinished ? "text-gray-900" : "text-gray-500"
        }`}
      >
        {t("community.feedFinished")}
      </span>
    </div>
  );
}
