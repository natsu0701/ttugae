import { useTranslation } from "react-i18next";
import Button from "../ui/Button.tsx";
import SmoothInput from "../ui/SmoothInput.tsx";
import { CloseFillIcon, UserFillIcon } from "../icons/FillIcons.tsx";
import { editorChromeBtn, editorChromeBtnActive, editorChromeTone } from "../ui/tabButtonStyles.ts";

const SIZE_PRESETS = [
  { label: "10 × 10", w: 10, h: 10 },
  { label: "20 × 20", w: 20, h: 20 },
  { label: "50 × 50", w: 50, h: 50 },
] as const;

type EditorHeaderProps = {
  title: string;
  onTitleChange: (title: string) => void;
  gridCols: number;
  gridRows: number;
  sizeMenuOpen: boolean;
  onToggleSizeMenu: () => void;
  customW: string;
  customH: string;
  onCustomWChange: (v: string) => void;
  onCustomHChange: (v: string) => void;
  onApplySize: (w: number, h: number) => void;
  onSave: () => void;
  onShare: () => void;
  onExit: () => void;
  onGoMypage: () => void;
  sizeMenuRef: React.RefObject<HTMLDivElement>;
};

export default function EditorHeader({
  title,
  onTitleChange,
  gridCols,
  gridRows,
  sizeMenuOpen,
  onToggleSizeMenu,
  customW,
  customH,
  onCustomWChange,
  onCustomHChange,
  onApplySize,
  onSave,
  onShare,
  onExit,
  onGoMypage,
  sizeMenuRef,
}: EditorHeaderProps) {
  const { t } = useTranslation();

  return (
    <header className="relative z-20 flex h-16 shrink-0 items-center border-b border-stone-800/80 bg-stone-950 px-4 md:px-6">
      <div className="z-10 flex shrink-0 items-center">
        <button
          type="button"
          onClick={onExit}
          className={`flex h-10 w-10 items-center justify-center ${editorChromeBtn}`}
          aria-label={t("editor.exitAria")}
        >
          <CloseFillIcon className="h-5 w-5" />
        </button>
      </div>

      <div className="pointer-events-none absolute left-1/2 top-1/2 z-20 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center gap-2 md:gap-3">
        <div className="pointer-events-auto">
          <SmoothInput
            type="text"
            tone="dark"
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            placeholder={t("editor.patternNamePlaceholder")}
            aria-label={t("editor.patternName")}
            className="h-10 w-64 rounded-xl border-stone-700/80 bg-stone-950 px-4 py-1.5 text-sm font-semibold tracking-normal placeholder:text-stone-500"
          />
        </div>

        <div ref={sizeMenuRef} className="pointer-events-auto relative shrink-0">
          <button
            type="button"
            onClick={onToggleSizeMenu}
            className={`${editorChromeBtn} whitespace-nowrap px-3 py-1.5 font-sans text-xs font-medium md:px-4 md:text-sm`}
          >
            {t("editor.sizeLabel", { cols: gridCols, rows: gridRows })}
          </button>
          {sizeMenuOpen && (
            <div className="absolute left-1/2 top-full z-30 mt-2 w-56 -translate-x-1/2 rounded-2xl border border-stone-600/80 bg-stone-700 p-3 md:w-64">
              <p className="mb-2 font-sans text-xs font-normal text-stone-400">
                {t("editor.sizePresetsTitle")}
              </p>
              {SIZE_PRESETS.map((preset) => {
                const active = preset.w === gridCols && preset.h === gridRows;
                return (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => onApplySize(preset.w, preset.h)}
                    className={`mb-1 w-full px-3 py-2 text-left font-sans text-sm font-normal ${
                      active ? editorChromeBtnActive : editorChromeBtn
                    }`}
                  >
                    {preset.label}
                  </button>
                );
              })}
              <p className="mb-2 mt-3 font-sans text-xs font-normal text-stone-400">
                {t("editor.sizeCustomTitle")}
              </p>
              <div className="flex gap-2">
                <SmoothInput
                  tone="dark"
                  value={customW}
                  onChange={(e) => onCustomWChange(e.target.value)}
                  placeholder="W"
                  className="rounded-xl border-stone-700/80 py-1.5 text-sm"
                  inputMode="numeric"
                />
                <SmoothInput
                  tone="dark"
                  value={customH}
                  onChange={(e) => onCustomHChange(e.target.value)}
                  placeholder="H"
                  className="rounded-xl border-stone-700/80 py-1.5 text-sm"
                  inputMode="numeric"
                />
              </div>
              <Button
                variant="primary"
                fullWidth
                className="mt-2 bg-coral py-2 text-sm text-white hover:bg-black"
                onClick={() => {
                  const w = parseInt(customW, 10);
                  const h = parseInt(customH, 10);
                  if (Number.isFinite(w) && Number.isFinite(h)) onApplySize(w, h);
                }}
              >
                {t("editor.apply")}
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="z-10 ml-auto flex shrink-0 items-center gap-2">
        <button
          type="button"
          onClick={onSave}
          className={`${editorChromeBtn} px-4 py-2 font-sans text-sm font-semibold`}
        >
          {t("editor.save")}
        </button>
        <button
          type="button"
          onClick={onShare}
          className="rounded-xl bg-coral px-4 py-2 font-sans text-sm font-bold text-white transition-colors hover:bg-black"
        >
          {t("editor.share")}
        </button>
        <button
          type="button"
          onClick={onGoMypage}
          className={`flex h-10 w-10 items-center justify-center rounded-full ${editorChromeTone}`}
          aria-label={t("editor.mypageAria")}
        >
          <UserFillIcon className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
}
