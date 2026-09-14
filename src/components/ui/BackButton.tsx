import { memo } from "react";
import { useTranslation } from "react-i18next";
import { ChevronLeftFillIcon } from "../icons/FillIcons.tsx";
import { goBack } from "../../utils/navReturn.ts";

type BackButtonProps = {
  fallbackPath?: string;
  className?: string;
  onClick?: () => void;
  tone?: "light" | "dark";
};

function BackButton({
  fallbackPath,
  className = "",
  onClick,
  tone = "light",
}: BackButtonProps) {
  const { t } = useTranslation();

  return (
    <button
      type="button"
      onClick={() => {
        if (onClick) {
          onClick();
          return;
        }
        goBack(fallbackPath);
      }}
      className={`flex h-10 w-10 items-center justify-center rounded-lg transition-colors duration-200 ${
        tone === "dark"
          ? "text-stone-200 hover:bg-stone-800 hover:text-white"
          : "text-gray-700 hover:bg-stone-100 hover:text-coral"
      } ${className}`}
      aria-label={t("common.back")}
    >
      <ChevronLeftFillIcon className="h-5 w-5" />
    </button>
  );
}

export default memo(BackButton);
