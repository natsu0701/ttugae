import { memo } from "react";
import { ChevronLeftFillIcon } from "../icons/FillIcons.tsx";
import { goBack } from "../../utils/navReturn.ts";

type BackButtonProps = {
  fallbackPath?: string;
  className?: string;
  onClick?: () => void;
};

function BackButton({ fallbackPath, className = "", onClick }: BackButtonProps) {
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
      className={`flex h-10 w-10 items-center justify-center rounded-lg text-gray-700 transition-colors duration-200 hover:bg-stone-100 hover:text-coral ${className}`}
      aria-label="back"
    >
      <ChevronLeftFillIcon className="h-5 w-5" />
    </button>
  );
}

export default memo(BackButton);
