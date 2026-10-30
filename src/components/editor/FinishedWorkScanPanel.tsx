import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { ImageFillIcon, SpinnerFillIcon } from "../icons/FillIcons.tsx";
import { generatePatternFromPhoto } from "../../utils/scanFinishedWork.ts";
import type { EditorCell } from "../../utils/patternGrid.ts";
import type { EditorYarn } from "../../types/editorYarn.ts";
import { iconTip } from "../../utils/iconTip.ts";

type FinishedWorkScanPanelProps = {
  onApply: (nextGrid: EditorCell[][], yarns: EditorYarn[]) => void;
};

export default function FinishedWorkScanPanel({ onApply }: FinishedWorkScanPanelProps) {
  const { t } = useTranslation();
  const fileRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const runFromFile = async (file: File | undefined) => {
    if (!file) return;
    if (preview?.startsWith("blob:")) URL.revokeObjectURL(preview);
    const url = URL.createObjectURL(file);
    setPreview(url);
    setBusy(true);
    setError(null);
    setDone(false);
    try {
      const next = await generatePatternFromPhoto(url);
      onApply(next.grid, next.yarns);
      setDone(true);
    } catch (err) {
      setDone(false);
      setError(err instanceof Error ? err.message : t("editor.scanFail"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <p className="mb-1 font-sans text-base font-bold text-stone-900">{t("editor.scanTitle")}</p>
      <p className="mb-3 font-seoyun text-sm font-normal leading-snug text-stone-500">
        {t("editor.scanHint")}
      </p>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          e.target.value = "";
          void runFromFile(file);
        }}
      />

      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        disabled={busy}
        className="flex h-9 w-9 items-center justify-center text-stone-600 transition-colors hover:text-stone-900 disabled:opacity-60"
        {...iconTip(busy ? t("editor.scanBusy") : t("common.photoUpload"))}
      >
        {busy ? (
          <SpinnerFillIcon className="h-4 w-4 animate-spin" />
        ) : (
          <ImageFillIcon className="h-4 w-4" />
        )}
      </button>

      {preview ? (
        <img
          src={preview}
          alt=""
          className="mt-3 max-h-28 w-full rounded-xl object-cover"
        />
      ) : null}

      {error ? (
        <p className="mt-3 font-seoyun text-sm leading-snug text-coral">{error}</p>
      ) : null}

      {done && !busy ? (
        <p className="mt-3 font-seoyun text-sm font-normal leading-relaxed text-stone-600">
          {t("editor.scanOk")}
        </p>
      ) : null}
    </div>
  );
}
