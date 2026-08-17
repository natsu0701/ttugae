import { useTranslation } from "react-i18next";
import {
  BrushFillIcon,
  CloseFillIcon,
  EraserFillIcon,
  PatternsFillIcon,
  SelectFillIcon,
} from "../icons/FillIcons.tsx";
import { editorChromeBtn, editorChromeBtnActive } from "../ui/tabButtonStyles.ts";

type Tool = "paint" | "eraser" | "checker" | "select";

const TOOLS: { id: Tool; Icon: typeof BrushFillIcon }[] = [
  { id: "paint", Icon: BrushFillIcon },
  { id: "eraser", Icon: EraserFillIcon },
  { id: "checker", Icon: PatternsFillIcon },
  { id: "select", Icon: SelectFillIcon },
];

type CanvasToolDockProps = {
  tool: Tool;
  onToolChange: (tool: Tool) => void;
  showFillSelection: boolean;
  onFillSelection: () => void;
  hint: string;
  hintOpen: boolean;
  onDismissHint: () => void;
};

export default function CanvasToolDock({
  tool,
  onToolChange,
  showFillSelection,
  onFillSelection,
  hint,
  hintOpen,
  onDismissHint,
}: CanvasToolDockProps) {
  const { t } = useTranslation();

  return (
    <div className="flex w-full shrink-0 flex-col items-center gap-2 px-4 pb-4 pt-2">
      {hintOpen ? (
        <div
          className="flex max-w-[min(100%,28rem)] items-center gap-2 rounded-2xl border border-stone-200 bg-white px-3 py-2 shadow-[0_16px_40px_rgba(0,0,0,0.1)]"
          role="status"
        >
          <p className="min-w-0 flex-1 font-seoyun text-sm font-normal leading-none text-stone-500">
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

      <div className="flex items-center gap-2 rounded-2xl border border-stone-600/80 bg-stone-800 px-3 py-2 shadow-[0_16px_40px_rgba(0,0,0,0.18)]">
        <p className="mr-1 hidden font-sans text-[10px] font-normal tracking-wide text-stone-400 sm:block">
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
                className={`group flex h-10 w-10 items-center overflow-hidden px-2.5 font-sans text-sm font-normal whitespace-nowrap transition-[width] duration-200 ease-out hover:w-[8.5rem] ${
                  isActive ? editorChromeBtnActive : editorChromeBtn
                }`}
              >
                <ToolIcon className="h-5 w-5 shrink-0" />
                <span className="ml-0 max-w-0 overflow-hidden opacity-0 transition-all duration-200 ease-out group-hover:ml-2 group-hover:max-w-[6.5rem] group-hover:opacity-100">
                  {label}
                </span>
              </button>
            );
          })}
        </div>
        {showFillSelection ? (
          <button
            type="button"
            onClick={onFillSelection}
            className={`ml-1 px-3 py-2 font-sans text-xs font-normal ${editorChromeBtn}`}
          >
            {t("editor.fillSelection")}
          </button>
        ) : null}
      </div>
    </div>
  );
}
