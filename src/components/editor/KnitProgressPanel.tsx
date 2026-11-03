import { memo } from "react";
import { useTranslation } from "react-i18next";
import { ChevronFillIcon } from "../icons/FillIcons.tsx";
import { editorChromeBtn, editorChromeBtnActive } from "../ui/tabButtonStyles.ts";
import { iconTip } from "../../utils/iconTip.ts";

type KnitProgressPanelProps = {
  enabled: boolean;
  current: number;
  total: number;
  onToggle: () => void;
  onPrev: () => void;
  onNext: () => void;
  onReset: () => void;
};

function KnitProgressPanel({
  enabled,
  current,
  total,
  onToggle,
  onPrev,
  onNext,
  onReset,
}: KnitProgressPanelProps) {
  const { t } = useTranslation();

  return (
    <div>
      <p className="mb-2 font-sans text-sm font-normal uppercase tracking-wide text-stone-500">
        {t("editor.progress.title")}
      </p>
      <button
        type="button"
        onClick={onToggle}
        className={`mb-2 w-full px-3 py-2 font-sans text-sm font-medium ${
          enabled ? editorChromeBtnActive : editorChromeBtn
        }`}
        aria-pressed={enabled}
      >
        {enabled ? t("editor.progress.on") : t("editor.progress.start")}
      </button>
      {enabled ? (
        <div className="space-y-2 rounded-xl border border-amber-200 bg-amber-50 p-3">
          <p className="text-center font-sans text-sm font-semibold text-stone-800">
            {t("editor.progress.current")}{" "}
            <span className="text-coral">
              {t("editor.progress.currentOf", { current, total })}
            </span>
          </p>
          <div className="flex gap-1.5">
            <button
              type="button"
              onClick={onPrev}
              disabled={current <= 1}
              className={`flex h-10 min-w-0 flex-1 items-center justify-center gap-1 px-2 font-sans text-sm disabled:opacity-40 ${editorChromeBtn}`}
              {...iconTip(t("editor.progress.prev"))}
            >
              <ChevronFillIcon className="h-4 w-4" />
              {t("editor.progress.prev")}
            </button>
            <button
              type="button"
              onClick={onNext}
              disabled={current >= total}
              className={`flex h-10 min-w-0 flex-1 items-center justify-center gap-1 px-2 font-sans text-sm disabled:opacity-40 ${editorChromeBtnActive}`}
              {...iconTip(t("editor.progress.next"))}
            >
              {t("editor.progress.next")}
              <ChevronFillIcon className="h-4 w-4 rotate-180" />
            </button>
          </div>
          <button
            type="button"
            onClick={onReset}
            className="w-full text-center font-sans text-sm text-stone-500 underline underline-offset-2 hover:text-stone-800"
          >
            {t("editor.progress.reset")}
          </button>
          <p className="font-sans text-sm leading-snug text-stone-500">
            {t("editor.progress.hint")}
          </p>
        </div>
      ) : (
        <p className="font-sans text-sm leading-snug text-stone-500">
          {t("editor.progress.idleHint")}
        </p>
      )}
    </div>
  );
}

export default memo(KnitProgressPanel);
