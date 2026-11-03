import { lazy, Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import type { EditorCell } from "../../utils/patternGrid.ts";
import type { KnittingChart } from "../../types/knittingProject.ts";
import type { GaugeProfile } from "../../utils/personalizationStorage.ts";
import { inferKnitItemType, type KnitItemType } from "../../utils/knitItemType.ts";
import { editorChromeTone } from "../ui/tabButtonStyles.ts";
import { SpinnerFillIcon } from "../icons/FillIcons.tsx";

const Knitting3DPreview = lazy(() => import("./Knitting3DPreview.tsx"));
const KnitStitchPreview = lazy(() => import("./stitchPreview/KnitStitchPreview.tsx"));

const PREVIEW_KIND_KEY = "ttugae.stitchPreview.kind.v1";
type PreviewKind = "stitches" | "garment";

type AiPreviewNavigatorProps = {
  title?: string;
  grid: EditorCell[][];
  frontGrid?: EditorCell[][];
  backGrid?: EditorCell[][];
  facesIndependent?: boolean;
  charts?: KnittingChart[];
  colorMap: Record<string, string>;
  stitchSymbols: Record<string, string>;
  gauge?: GaugeProfile | null;
};

const ITEM_OPTIONS: { id: KnitItemType; labelKey: string }[] = [
  { id: "sweater", labelKey: "editor.itemSweater" },
  { id: "vest", labelKey: "editor.itemVest" },
  { id: "beanie", labelKey: "editor.itemHat" },
  { id: "glove", labelKey: "editor.itemGloves" },
  { id: "socks", labelKey: "editor.itemSocks" },
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
  gauge = null,
}: AiPreviewNavigatorProps) {
  const { t } = useTranslation();
  const inferred = useMemo(() => inferKnitItemType(title), [title]);
  const [itemType, setItemType] = useState<KnitItemType>(inferred);
  const [previewKind, setPreviewKind] = useState<PreviewKind>(() => {
    try {
      return localStorage.getItem(PREVIEW_KIND_KEY) === "garment" ? "garment" : "stitches";
    } catch {
      return "stitches";
    }
  });
  const lastInferred = useRef(inferred);

  useEffect(() => {
    if (inferred === lastInferred.current) return;
    lastInferred.current = inferred;
    setItemType(inferred);
  }, [inferred]);

  const selectKind = (kind: PreviewKind) => {
    setPreviewKind(kind);
    try {
      localStorage.setItem(PREVIEW_KIND_KEY, kind);
    } catch {
      /* ignore */
    }
  };

  return (
    <div>
      <p className="mb-2 font-sans text-base font-bold text-stone-900">
        {previewKind === "stitches" ? t("editor.stitchSim.title") : t("editor.preview3d")}
      </p>

      <div className="mb-3 flex flex-wrap gap-1">
        <button
          type="button"
          onClick={() => selectKind("stitches")}
          className={`min-h-11 rounded-xl px-2.5 py-1 font-sans text-sm font-normal ${
            previewKind === "stitches" ? "border border-coral bg-coral text-white" : editorChromeTone
          }`}
        >
          {t("editor.stitchSim.tab")}
        </button>
        <button
          type="button"
          onClick={() => selectKind("garment")}
          className={`min-h-11 rounded-xl px-2.5 py-1 font-sans text-sm font-normal ${
            previewKind === "garment" ? "border border-coral bg-coral text-white" : editorChromeTone
          }`}
        >
          {t("editor.stitchSim.garmentTab")}
        </button>
      </div>

      {previewKind === "stitches" ? (
        <>
          <p className="mb-3 font-sans text-sm leading-snug text-stone-500">
            {t("editor.stitchSim.hint")}
          </p>
          <Suspense
            fallback={
              <div className="flex h-[300px] min-h-[220px] items-center justify-center bg-stone-100">
                <SpinnerFillIcon className="h-6 w-6 animate-spin text-coral" />
              </div>
            }
          >
            <KnitStitchPreview grid={grid} colorMap={colorMap} gauge={gauge} />
          </Suspense>
        </>
      ) : (
        <>
          <div className="mb-3 flex flex-wrap gap-1">
            {ITEM_OPTIONS.map((item) => {
              const active = itemType === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setItemType(item.id)}
                  className={`rounded-xl px-2.5 py-1 font-sans text-sm font-normal ${
                    active ? "border border-coral bg-coral text-white" : editorChromeTone
                  }`}
                >
                  {t(item.labelKey)}
                </button>
              );
            })}
          </div>
          <div className="relative w-full overflow-hidden rounded-lg">
            <Suspense
              fallback={
                <div className="flex h-[300px] min-h-[220px] items-center justify-center bg-stone-100">
                  <SpinnerFillIcon className="h-6 w-6 animate-spin text-coral" />
                </div>
              }
            >
              <Knitting3DPreview
                grid={frontGrid ?? grid}
                gridData={frontGrid ?? grid}
                backGrid={backGrid}
                facesIndependent={facesIndependent}
                charts={charts}
                colorMap={colorMap}
                stitchSymbols={stitchSymbols}
                itemType={itemType}
              />
            </Suspense>
          </div>
          {facesIndependent ? (
            <p className="mt-2 font-seoyun text-sm font-normal leading-snug text-stone-500">
              {t("editor.previewFacesSplit")}
            </p>
          ) : null}
        </>
      )}
    </div>
  );
}
