import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import type { EditorYarn } from "../../types/editorYarn.ts";
import type { EditorCell } from "../../utils/patternGrid.ts";
import type { KnittingChart } from "../../types/knittingProject.ts";
import Knitting3DPreview, {
  type KnitItemType,
} from "./Knitting3DPreview.tsx";

type AiPreviewNavigatorProps = {
  grid: EditorCell[][];
  charts?: KnittingChart[];
  colorMap: Record<string, string>;
  stitchSymbols: Record<string, string>;
  yarnMeta?: EditorYarn[];
};

const ITEM_OPTIONS: { id: KnitItemType; label: string }[] = [
  { id: "sweater", label: "스웨터" },
  { id: "vest", label: "조끼" },
  { id: "beanie", label: "비니" },
  { id: "blanket", label: "블랭킷" },
  { id: "socks", label: "양말" },
];

export default function AiPreviewNavigator({
  grid,
  charts = [],
  colorMap,
  stitchSymbols,
  yarnMeta = [],
}: AiPreviewNavigatorProps) {
  const { t } = useTranslation();
  const [itemType, setItemType] = useState<KnitItemType>("sweater");
  const metaHint = useMemo(() => {
    if (yarnMeta.length === 0) return null;
    const fibers = [...new Set(yarnMeta.map((y) => y.fiberType))];
    const textures = [...new Set(yarnMeta.map((y) => y.texture))];
    return `${fibers.join(" · ")} (${textures.join(", ")})`;
  }, [yarnMeta]);

  return (
    <div className="rounded-2xl bg-white p-4">
      <p className="mb-1 font-sans text-sm font-bold text-gray-900">
        {t("editor.preview3d")}
      </p>
      {metaHint && (
        <p className="mb-2 font-rounded text-[11px] font-normal leading-snug text-gray-500">
          {metaHint}
        </p>
      )}

      <div className="mb-3 flex flex-wrap gap-1">
        {ITEM_OPTIONS.map((item) => {
          const active = itemType === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setItemType(item.id)}
              className={`rounded-full px-2.5 py-1 font-sans text-[11px] font-normal transition-colors duration-200 ${
                active
                  ? "bg-coral text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-black hover:text-white"
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      <div className="relative w-full overflow-hidden rounded-lg">
        <Knitting3DPreview
          grid={grid}
          gridData={grid}
          charts={charts}
          colorMap={colorMap}
          stitchSymbols={stitchSymbols}
          itemType={itemType}
          yarnMeta={yarnMeta}
        />
      </div>
    </div>
  );
}
