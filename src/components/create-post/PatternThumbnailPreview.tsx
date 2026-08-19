import PatternChartGrid from "../community/PatternChartGrid.tsx";
import { EDITOR_COLOR_HEX, type EditorCell } from "../../utils/patternGrid.ts";
import { useTranslation } from "react-i18next";

type PatternThumbnailPreviewProps = {
  grid: EditorCell[][];
  colorMap: Record<string, string>;
  photoUrl?: string;
  title?: string;
};

export default function PatternThumbnailPreview({
  grid,
  colorMap,
  photoUrl,
  title,
}: PatternThumbnailPreviewProps) {
  const { t } = useTranslation();
  const mergedColorMap = { ...EDITOR_COLOR_HEX, ...colorMap };

  return (
    <div className="overflow-hidden rounded-2xl bg-gray-50">
      {photoUrl ? (
        <img
          src={photoUrl}
          alt={title ? t("community.finishedAltOf", { title }) : t("createPost.previewAlt")}
          className="h-52 w-full object-cover"
        />
      ) : (
        <div className="p-4">
          <p className="mb-3 font-sans text-xs font-normal text-gray-500">
            {t("community.patternPreview")}
          </p>
          <div className="mx-auto max-w-xs overflow-hidden rounded-xl bg-gray-200 p-1">
            <PatternChartGrid
              cells={grid}
              colorMap={mergedColorMap}
              fit="cells"
            />
          </div>
        </div>
      )}
    </div>
  );
}
