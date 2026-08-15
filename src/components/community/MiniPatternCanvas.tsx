import type { CommunityPattern } from "../../data/communityPatterns.ts";
import { getPatternPreviewModel } from "../../data/patternThumbnails.ts";
import PatternChartGrid from "./PatternChartGrid.tsx";

type MiniPatternCanvasProps = {
  pattern: CommunityPattern;
  label?: string;
  className?: string;
};

export default function MiniPatternCanvas({
  pattern,
  label,
  className = "",
}: MiniPatternCanvasProps) {
  const { cells, colorMap } = getPatternPreviewModel(pattern);

  return (
    <div className={`rounded-2xl bg-gray-50 p-4 ${className}`}>
      {label && (
        <p className="mb-3 font-sans text-sm font-normal text-gray-500">{label}</p>
      )}
      <div className="overflow-hidden rounded-xl bg-gray-200 p-1">
        <PatternChartGrid cells={cells} colorMap={colorMap} fit="cells" />
      </div>
    </div>
  );
}
