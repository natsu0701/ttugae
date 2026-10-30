import { memo, type ReactNode, type RefObject } from "react";
import { useTranslation } from "react-i18next";
import Button from "../ui/Button.tsx";
import SmoothInput from "../ui/SmoothInput.tsx";
import BackButton from "../ui/BackButton.tsx";
import { PlusFillIcon } from "../icons/FillIcons.tsx";
import { editorChromeBtn, editorChromeBtnActive } from "../ui/tabButtonStyles.ts";
import { iconTip } from "../../utils/iconTip.ts";

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
  onAddChart: () => void;
  sizeMenuRef: RefObject<HTMLDivElement>;
  needleLabel: string;
  yarnLabel: string;
  chartTabs?: ReactNode;
};

function EditorHeader({
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
  onAddChart,
  sizeMenuRef,
  needleLabel,
  yarnLabel,
  chartTabs,
}: EditorHeaderProps) {
  const { t } = useTranslation();

  return (
    <header className="relative z-20 flex min-h-16 shrink-0 items-center gap-3 border-b border-stone-200 bg-white px-4 py-2 md:px-6">
      <BackButton onClick={onExit} className={`shrink-0 ${editorChromeBtn}`} />

      <SmoothInput
        type="text"
        value={title}
        onChange={(e) => onTitleChange(e.target.value)}
        placeholder={t("editor.patternNamePlaceholder")}
        aria-label={t("editor.patternName")}
        className="h-10 w-40 shrink-0 rounded-xl border-stone-200 bg-white px-3 py-1.5 text-base font-semibold tracking-normal placeholder:text-stone-400 md:w-56"
      />

      <button
        type="button"
        onClick={onAddChart}
        className="flex h-9 w-9 shrink-0 items-center justify-center text-stone-600 transition-colors hover:text-stone-900"
        {...iconTip(t("editor.castOn.addAction"), "below")}
      >
        <PlusFillIcon className="h-4 w-4" />
      </button>

      {chartTabs ? <div className="hidden min-w-0 md:block">{chartTabs}</div> : null}

      <div ref={sizeMenuRef} className="relative shrink-0">
        <button
          type="button"
          onClick={onToggleSizeMenu}
          className={`${editorChromeBtn} whitespace-nowrap px-3 py-1.5 font-sans text-sm font-medium`}
        >
          {t("editor.sizeLabel", { cols: gridCols, rows: gridRows })}
        </button>
        {sizeMenuOpen && (
          <div className="absolute left-0 top-full z-30 mt-2 w-56 rounded-2xl border border-stone-200 bg-white p-3 shadow-md">
            <p className="mb-2 font-sans text-sm font-normal text-stone-500">
              {t("editor.sizePresetsTitle")}
            </p>
            {SIZE_PRESETS.map((preset) => {
              const active = preset.w === gridCols && preset.h === gridRows;
              return (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => onApplySize(preset.w, preset.h)}
                  className={`mb-1 w-full px-3 py-2 text-left font-sans text-base font-normal ${
                    active ? editorChromeBtnActive : editorChromeBtn
                  }`}
                >
                  {preset.label}
                </button>
              );
            })}
            <p className="mb-2 mt-3 font-sans text-sm font-normal text-stone-500">
              {t("editor.sizeCustomTitle")}
            </p>
            <div className="flex gap-2">
              <SmoothInput
                value={customW}
                onChange={(e) => onCustomWChange(e.target.value)}
                placeholder="W"
                className="rounded-xl border-stone-200 bg-white py-1.5 text-base"
                inputMode="numeric"
              />
              <SmoothInput
                value={customH}
                onChange={(e) => onCustomHChange(e.target.value)}
                placeholder="H"
                className="rounded-xl border-stone-200 bg-white py-1.5 text-base"
                inputMode="numeric"
              />
            </div>
            <Button
              variant="primary"
              fullWidth
              className="mt-2 py-2 text-base"
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

      <div className="min-w-0 flex-1">
        <p className="break-keep font-sans text-sm leading-snug text-stone-500">
          {t("editor.needleShort")}: {needleLabel}
        </p>
        <p className="break-keep font-sans text-sm leading-snug text-stone-500">
          {t("editor.yarnShort")}: {yarnLabel}
        </p>
      </div>

      <div className="ml-auto flex shrink-0 items-center gap-2">
        <button
          type="button"
          onClick={onSave}
          className={`${editorChromeBtn} px-4 py-2 font-sans text-base font-semibold`}
        >
          {t("editor.save")}
        </button>
        <button
          type="button"
          onClick={onShare}
          className="rounded-xl bg-coral px-4 py-2 font-sans text-base font-bold text-white transition-colors hover:bg-black"
        >
          {t("editor.share")}
        </button>
      </div>
    </header>
  );
}

export default memo(EditorHeader);
