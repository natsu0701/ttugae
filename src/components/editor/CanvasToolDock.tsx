import { memo } from "react";
import { useTranslation } from "react-i18next";
import {
  BrushFillIcon,
  CloseFillIcon,
  EraserFillIcon,
  PanFillIcon,
  PatternsFillIcon,
  SelectFillIcon,
  ZoomInFillIcon,
  ZoomOutFillIcon,
} from "../icons/FillIcons.tsx";
import { editorChromeBtn, editorChromeBtnActive } from "../ui/tabButtonStyles.ts";

type Tool = "paint" | "eraser" | "checker" | "select" | "pan";

const TOOLS: { id: Tool; Icon: typeof BrushFillIcon }[] = [
  { id: "paint", Icon: BrushFillIcon },
  { id: "eraser", Icon: EraserFillIcon },
  { id: "checker", Icon: PatternsFillIcon },
  { id: "select", Icon: SelectFillIcon },
  { id: "pan", Icon: PanFillIcon },
];

type CanvasToolDockProps = {
  tool: Tool;
  onToolChange: (tool: Tool) => void;
  showFillSelection: boolean;
  onFillSelection: () => void;
  hint: string;
  hintOpen: boolean;
  onDismissHint: () => void;
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
};

function CanvasToolDock({
  tool,
  onToolChange,
  showFillSelection,
  onFillSelection,
  hint,
  hintOpen,
  onDismissHint,
  zoom,
  onZoomIn,
  onZoomOut,
}: CanvasToolDockProps) {
  const { t } = useTranslation();

  return (
    <div className="flex w-full shrink-0 flex-col items-center gap-2 px-4 pb-4 pt-2">
      {hintOpen ? (
        <div
          className="flex max-w-[min(100%,28rem)] items-center gap-2 rounded-2xl border border-stone-200 bg-white px-3 py-2 shadow-sm"
          role="status"
        >
          <p className="min-w-0 flex-1 font-seoyun text-base font-normal leading-none text-stone-500">
            {hint}
          </p>
          <button
            type="button"
            onClick={onDismissHint}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-700"
            aria-label={t("editor.close")}
          >
            <CloseFillIcon className="h-4 w-4" />
          </button>
        </div>
      ) : null}

      <div className="flex items-center gap-2 rounded-2xl border border-stone-600/80 bg-stone-800 px-3 py-2 shadow-sm">
        <p className="mr-1 hidden font-sans text-sm font-normal tracking-wide text-stone-400 sm:block">
          {t("editor.drawingTools")}
        </p>
        <div className="flex items-center gap-1.5">
          {TOOLS.map((toolItem) => {
            const ToolIcon = toolItem.Icon;
            const isActive = tool === toolItem.id;
            const label = t(`editor.tools.${toolItem.id}`);
            return (
              <button
                key={toolItem.id}
                type="button"
                onClick={() => onToolChange(toolItem.id)}
                title={label}
                aria-label={label}
                className={`flex h-10 w-10 items-center justify-center px-2.5 font-sans text-base font-normal ${
                  isActive ? editorChromeBtnActive : editorChromeBtn
                }`}
              >
                <ToolIcon className="h-5 w-5 shrink-0" />
              </button>
            );
          })}
        </div>
        {showFillSelection ? (
          <button
            type="button"
            onClick={onFillSelection}
            className={`ml-1 px-3 py-2 font-sans text-sm font-normal ${editorChromeBtn}`}
          >
            {t("editor.fillSelection")}
          </button>
        ) : null}
        <span className="mx-1 h-5 w-px bg-stone-600" aria-hidden />
        <button
          type="button"
          onClick={onZoomOut}
          className={`flex h-10 w-10 items-center justify-center ${editorChromeBtn}`}
          aria-label={t("editor.zoomOut")}
        >
          <ZoomOutFillIcon className="h-5 w-5" />
        </button>
        <span className="min-w-[2.5rem] text-center font-sans text-sm text-stone-300">
          {Math.round(zoom * 100)}%
        </span>
        <button
          type="button"
          onClick={onZoomIn}
          className={`flex h-10 w-10 items-center justify-center ${editorChromeBtn}`}
          aria-label={t("editor.zoomIn")}
        >
          <ZoomInFillIcon className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}

export default memo(CanvasToolDock);
