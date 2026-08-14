import { useTranslation } from "react-i18next";
import Button from "../ui/Button.tsx";
import Input from "../ui/Input.tsx";
import { UserFillIcon } from "../icons/FillIcons.tsx";
import { softShadow } from "../ui/tabButtonStyles.ts";

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
    <header
      className={`relative z-20 flex h-14 shrink-0 items-center bg-[#FFFBF7] px-4 md:px-5 ${softShadow}`}
    >
      <div className="z-10 flex shrink-0 items-center">
        <button
          type="button"
          onClick={onExit}
          className={`flex h-10 w-10 items-center justify-center rounded-full bg-white text-gray-700 transition-colors hover:bg-black hover:text-white ${softShadow}`}
          aria-label={t("editor.exitAria")}
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden>
            <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      <div className="pointer-events-none absolute left-1/2 top-1/2 z-20 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center gap-2 md:gap-3">
        <div className="pointer-events-auto">
          <Input
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            placeholder={t("editor.patternNamePlaceholder")}
            className="w-[9.5rem] py-1.5 text-center text-sm font-bold sm:w-44 md:w-52"
            aria-label={t("editor.patternName")}
          />
        </div>

        <div ref={sizeMenuRef} className="pointer-events-auto relative shrink-0">
          <button
            type="button"
            onClick={onToggleSizeMenu}
            className={`whitespace-nowrap rounded-full bg-white px-3 py-1.5 font-sans text-xs font-normal text-gray-700 transition-colors hover:bg-black hover:text-white md:px-4 md:text-sm ${softShadow}`}
          >
            {t("editor.sizeLabel", { cols: gridCols, rows: gridRows })}
          </button>
          {sizeMenuOpen && (
            <div
              className={`absolute left-1/2 top-full z-30 mt-2 w-56 -translate-x-1/2 rounded-2xl bg-[#FFFBF7] p-3 md:w-64 ${softShadow}`}
            >
              <p className="mb-2 font-sans text-xs font-normal text-gray-500">
                {t("editor.sizePresetsTitle")}
              </p>
              {SIZE_PRESETS.map((preset) => {
                const active = preset.w === gridCols && preset.h === gridRows;
                return (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => onApplySize(preset.w, preset.h)}
                  className={`mb-1 w-full rounded-full px-3 py-2 text-left font-sans text-sm font-normal transition-colors ${
                    active
                      ? "bg-coral text-white"
                      : "bg-stone-100 text-gray-700 hover:bg-black hover:text-white"
                  }`}
                >
                  {preset.label}
                </button>
                );
              })}
              <p className="mb-2 mt-3 font-sans text-xs font-normal text-gray-500">
                {t("editor.sizeCustomTitle")}
              </p>
              <div className="flex gap-2">
                <Input
                  value={customW}
                  onChange={(e) => onCustomWChange(e.target.value)}
                  placeholder="W"
                  className="py-1.5 text-sm"
                  inputMode="numeric"
                />
                <Input
                  value={customH}
                  onChange={(e) => onCustomHChange(e.target.value)}
                  placeholder="H"
                  className="py-1.5 text-sm"
                  inputMode="numeric"
                />
              </div>
              <Button
                variant="primary"
                fullWidth
                className="mt-2 py-2 text-sm"
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
        <Button type="button" onClick={onSave} className="px-3 py-2 text-sm">
          {t("editor.save")}
        </Button>
        <button
          type="button"
          onClick={onShare}
          className="rounded-full bg-coral px-4 py-2 font-sans text-sm font-normal text-white transition-colors hover:bg-black"
        >
          {t("editor.share")}
        </button>
        <button
          type="button"
          onClick={onGoMypage}
          className={`flex h-10 w-10 items-center justify-center rounded-full transition-colors duration-200 ${softShadow} bg-white text-gray-700 hover:bg-black hover:text-white`}
          aria-label={t("editor.mypageAria")}
        >
          <UserFillIcon className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
}
