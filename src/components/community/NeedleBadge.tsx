import {
  formatNeedleBadge,
  parseNeedleFromText,
  type NeedleSpec,
} from "../../data/knittingMetadataLibrary.ts";

type NeedleBadgeProps = {
  spec?: NeedleSpec | null;
  needleText?: string;
  className?: string;
};

export default function NeedleBadge({ spec, needleText, className = "" }: NeedleBadgeProps) {
  const resolved = spec ?? (needleText ? parseNeedleFromText(needleText) : null);
  if (!resolved) return null;

  return (
    <span
      className={`inline-flex items-center rounded-full bg-white/90 px-2.5 py-0.5 font-sans text-[10px] font-medium tracking-wide text-stone-600 backdrop-blur-sm ${className}`}
    >
      {formatNeedleBadge(resolved)}
    </span>
  );
}
