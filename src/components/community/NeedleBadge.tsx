import { useTranslation } from "react-i18next";
import {
  parseNeedleFromText,
  type NeedleSpec,
} from "../../data/knittingMetadataLibrary.ts";
import {
  formatNeedleSizeI18n,
  formatNeedleTypeI18n,
} from "../../utils/i18nContent.ts";

type NeedleBadgeProps = {
  spec?: NeedleSpec | null;
  needleText?: string;
  className?: string;
};

export default function NeedleBadge({ spec, needleText, className = "" }: NeedleBadgeProps) {
  const { t } = useTranslation();
  const resolved = spec ?? (needleText ? parseNeedleFromText(needleText) : null);
  if (!resolved) return null;

  const label = `${formatNeedleTypeI18n(t, resolved.needleType)} ${formatNeedleSizeI18n(t, resolved.needleSize)}`;

  return (
    <span
      className={`inline-flex items-center rounded-full bg-white/90 px-2.5 py-0.5 font-sans text-[10px] font-medium tracking-wide text-stone-600 backdrop-blur-sm ${className}`}
    >
      {label}
    </span>
  );
}
