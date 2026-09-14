import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  CheckFillIcon,
  ImageFillIcon,
  SpinnerFillIcon,
} from "../icons/FillIcons.tsx";
import { editorChromeBtn, editorChromeBtnActive, editorPanel } from "../ui/tabButtonStyles.ts";
import {
  PROJECT_FINISHED_PHOTOS,
  scanFinishedWorkAgainstGrid,
  type FinishedWorkScanResult,
} from "../../utils/scanFinishedWork.ts";
import { paletteYarnsForGrid, type EditorCell } from "../../utils/patternGrid.ts";
import type { EditorYarn } from "../../types/editorYarn.ts";
import { assetUrl } from "../../utils/appPath.ts";

type FinishedWorkScanPanelProps = {
  grid: EditorCell[][];
  colorMap: Record<string, string>;
  onApply: (nextGrid: EditorCell[][], yarns: EditorYarn[]) => void;
};

export default function FinishedWorkScanPanel({
  grid,
  colorMap,
  onApply,
}: FinishedWorkScanPanelProps) {
  const { t } = useTranslation();
  const fileRef = useRef<HTMLInputElement>(null);
  const [source, setSource] = useState<string | null>(null);
  const [sourceLabel, setSourceLabel] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<FinishedWorkScanResult | null>(null);

  const pickProjectPhoto = (file: string, label: string) => {
    setSource(assetUrl(`/images/${encodeURI(file)}`));
    setSourceLabel(label);
    setResult(null);
    setError(null);
  };

  const onUpload = (file: File | undefined) => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setSource(url);
    setSourceLabel(file.name);
    setResult(null);
    setError(null);
  };

  const runScan = async () => {
    if (!source) {
      setError(t("editor.scanNeedPhoto"));
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const next = await scanFinishedWorkAgainstGrid(source, grid, colorMap);
      setResult(next);
    } catch (err) {
      setResult(null);
      setError(err instanceof Error ? err.message : t("editor.scanFail"));
    } finally {
      setBusy(false);
    }
  };

  const canCorrect =
    result &&
    (result.colorMismatches.length > 0 || result.stitchMismatches.length > 0);

  const applyCorrection = () => {
    if (!result) return;
    onApply(result.suggestedGrid, paletteYarnsForGrid(result.suggestedGrid, colorMap));
    setResult({
      ...result,
      colorMismatches: [],
      stitchMismatches: [],
      messages: [t("editor.scanOk")],
    });
  };

  return (
    <div className={`${editorPanel} p-4`}>
      <p className="mb-1 font-sans text-base font-bold text-white">{t("editor.scanTitle")}</p>
      <p className="mb-3 font-seoyun text-sm font-normal leading-snug text-stone-400">
        {t("editor.scanHint")}
      </p>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => onUpload(e.target.files?.[0])}
      />

      <div className="mb-3 flex flex-wrap gap-1.5">
        {PROJECT_FINISHED_PHOTOS.slice(0, 6).map((photo) => {
          const active = sourceLabel === photo.label;
          return (
            <button
              key={photo.file}
              type="button"
              onClick={() => pickProjectPhoto(photo.file, photo.label)}
              className={`rounded-full px-2.5 py-1 font-sans text-sm ${
                active ? editorChromeBtnActive : editorChromeBtn
              }`}
            >
              {photo.label}
            </button>
          );
        })}
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className={`${editorChromeBtn} flex flex-1 items-center justify-center gap-1.5 px-3 py-2 font-sans text-sm`}
        >
          <ImageFillIcon className="h-3.5 w-3.5" />
          {t("common.photoUpload")}
        </button>
        <button
          type="button"
          onClick={() => void runScan()}
          disabled={busy}
          className={`${editorChromeBtnActive} flex flex-1 items-center justify-center gap-1.5 px-3 py-2 font-sans text-sm disabled:opacity-60`}
        >
          {busy ? <SpinnerFillIcon className="h-3.5 w-3.5 animate-spin" /> : null}
          {busy ? t("editor.scanBusy") : t("editor.scanRun")}
        </button>
      </div>

      <p className="mt-2 truncate font-sans text-sm text-stone-400">
        {sourceLabel || t("editor.scanNoPhoto")}
      </p>

      {error ? (
        <p className="mt-3 font-seoyun text-sm leading-snug text-stone-300">{error}</p>
      ) : null}

      {result ? (
        <div className="mt-3 space-y-2">
          {result.messages.map((message) => (
            <p
              key={message}
              className="font-seoyun text-sm font-normal leading-relaxed text-stone-200"
            >
              {message}
            </p>
          ))}
          {canCorrect ? (
            <button
              type="button"
              onClick={applyCorrection}
              className={`${editorChromeBtnActive} mt-1 flex w-full items-center justify-center gap-1.5 px-3 py-2 font-sans text-sm`}
            >
              <CheckFillIcon className="h-3.5 w-3.5" />
              {t("editor.scanAutoFix")}
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
