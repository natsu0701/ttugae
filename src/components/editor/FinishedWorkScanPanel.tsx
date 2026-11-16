import { useRef, useState, type DragEvent } from "react";
import { useTranslation } from "react-i18next";
import { SpinnerFillIcon } from "../icons/FillIcons.tsx";
import { generatePatternFromPhoto } from "../../utils/scanFinishedWork.ts";
import type { EditorCell } from "../../utils/patternGrid.ts";
import type { EditorYarn } from "../../types/editorYarn.ts";
import { editorSectionTitle } from "../ui/tabButtonStyles.ts";

type FinishedWorkScanPanelProps = {
  onApply: (nextGrid: EditorCell[][], yarns: EditorYarn[]) => void;
};

function firstImageFile(files: FileList | null | undefined): File | undefined {
  if (!files?.length) return;
  return [...files].find((file) => file.type.startsWith("image/"));
}

export default function FinishedWorkScanPanel({ onApply }: FinishedWorkScanPanelProps) {
  const { t } = useTranslation();
  const fileRef = useRef<HTMLInputElement>(null);
  const dragCountRef = useRef(0);
  const [preview, setPreview] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const runFromFile = async (file: File | undefined) => {
    if (!file || busy) return;
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

  const resetDrag = () => {
    dragCountRef.current = 0;
    setDragging(false);
  };

  const onDragEnter = (e: DragEvent<HTMLButtonElement>) => {
    e.preventDefault();
    dragCountRef.current += 1;
    setDragging(true);
  };

  const onDragOver = (e: DragEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
  };

  const onDragLeave = () => {
    dragCountRef.current = Math.max(0, dragCountRef.current - 1);
    if (dragCountRef.current === 0) setDragging(false);
  };

  const onDrop = (e: DragEvent<HTMLButtonElement>) => {
    e.preventDefault();
    resetDrag();
    const file = firstImageFile(e.dataTransfer.files);
    if (!file) {
      setError(t("editor.scanNeedPhoto"));
      return;
    }
    void runFromFile(file);
  };

  return (
    <div>
      <p className={`mb-3 ${editorSectionTitle}`}>{t("editor.scanTitle")}</p>

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
        onClick={() => {
          if (!busy) fileRef.current?.click();
        }}
        onDragEnter={onDragEnter}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        aria-label={busy ? t("editor.scanBusy") : t("editor.scanDrop")}
        aria-busy={busy}
        className={`relative mx-auto flex aspect-square w-40 items-center justify-center overflow-hidden rounded-xl border-2 border-dashed transition-colors ${
          dragging
            ? "border-coral bg-coral/10"
            : "border-stone-300 bg-stone-50 hover:border-stone-400 hover:bg-stone-100"
        } ${busy ? "cursor-wait" : "cursor-pointer"}`}
      >
        {preview ? (
          <img src={preview} alt="" className="absolute inset-0 h-full w-full object-cover" />
        ) : (
          <span className="select-none text-5xl leading-none" aria-hidden>
            📷
          </span>
        )}
        {busy ? (
          <span className="absolute inset-0 flex items-center justify-center bg-white/70">
            <SpinnerFillIcon className="h-6 w-6 animate-spin text-stone-600" />
          </span>
        ) : null}
      </button>

      <p className="mt-3 font-seoyun text-sm font-normal leading-snug text-stone-500">
        {t("editor.scanHint")}
      </p>

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
