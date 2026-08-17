import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import type { EditorYarn } from "../../types/editorYarn.ts";
import type { EditorCell } from "../../utils/patternGrid.ts";
import type { KnittingChart } from "../../types/knittingProject.ts";
import Knitting3DPreview, {
  inferKnitItemType,
  type KnitItemType,
} from "./Knitting3DPreview.tsx";
import { editorChromeTone, editorPanel } from "../ui/tabButtonStyles.ts";

type AiPreviewNavigatorProps = {
  title?: string;
  grid: EditorCell[][];
  frontGrid?: EditorCell[][];
  backGrid?: EditorCell[][];
  facesIndependent?: boolean;
  charts?: KnittingChart[];
  colorMap: Record<string, string>;
  stitchSymbols: Record<string, string>;
  yarnMeta?: EditorYarn[];
};

const ITEM_OPTIONS: { id: KnitItemType; label: string }[] = [
  { id: "sweater", label: "스웨터" },
  { id: "vest", label: "조끼" },
  { id: "beanie", label: "모자" },
  { id: "glove", label: "장갑" },
  { id: "socks", label: "양말" },
];

export default function AiPreviewNavigator({
  title = "",
  grid,
  frontGrid,
  backGrid,
  facesIndependent = false,
  charts = [],
  colorMap,
  stitchSymbols,
  yarnMeta = [],
}: AiPreviewNavigatorProps) {
  const { t } = useTranslation();
  const inferred = useMemo(() => inferKnitItemType(title), [title]);
  const [itemType, setItemType] = useState<KnitItemType>(inferred);
  const lastInferred = useRef(inferred);

  useEffect(() => {
    if (inferred === lastInferred.current) return;
    lastInferred.current = inferred;
    setItemType(inferred);
  }, [inferred]);
  const metaHint = useMemo(() => {
    if (yarnMeta.length === 0) return null;
    const fibers = [...new Set(yarnMeta.map((y) => y.fiberType))];
    const textures = [...new Set(yarnMeta.map((y) => y.texture))];
    return `${fibers.join(" · ")} (${textures.join(", ")})`;
  }, [yarnMeta]);

  return (
    <div className={`${editorPanel} p-4`}>
      <p className="mb-1 font-sans text-sm font-bold text-white">
        {t("editor.preview3d")}
      </p>
      {metaHint && (
        <p className="mb-2 font-seoyun text-[11px] font-normal leading-snug text-stone-300">
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
              className={`rounded-full px-2.5 py-1 font-sans text-[11px] font-normal ${
                active ? "border border-coral bg-coral text-white" : editorChromeTone
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      <div className="relative w-full overflow-hidden rounded-lg">
        <Knitting3DPreview
          grid={frontGrid ?? grid}
          gridData={frontGrid ?? grid}
          backGrid={backGrid}
          facesIndependent={facesIndependent}
          charts={charts}
          colorMap={colorMap}
          stitchSymbols={stitchSymbols}
          itemType={itemType}
          yarnMeta={yarnMeta}
        />
      </div>
      {facesIndependent ? (
        <p className="mt-2 font-seoyun text-[11px] font-normal leading-snug text-stone-300">
          {t("editor.previewFacesSplit")}
        </p>
      ) : null}
    </div>
  );
}
