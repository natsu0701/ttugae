import { useRef, useState } from "react";
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
  const fileRef = useRef<HTMLInputElement>(null);
  const [source, setSource] = useState<string | null>(null);
  const [sourceLabel, setSourceLabel] = useState("사진 없음");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<FinishedWorkScanResult | null>(null);

  const pickProjectPhoto = (file: string, label: string) => {
    setSource(`/images/${encodeURI(file)}`);
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
      setError("먼저 실물 완성작 사진을 선택해 주세요.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const next = await scanFinishedWorkAgainstGrid(source, grid, colorMap);
      setResult(next);
    } catch (err) {
      setResult(null);
      setError(err instanceof Error ? err.message : "분석에 실패했습니다.");
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
      messages: ["실물 사진의 배색과 기호 흐름에 맞춰 도안을 보정했습니다."],
    });
  };

  return (
    <div className={`${editorPanel} p-4`}>
      <p className="mb-1 font-sans text-sm font-bold text-white">실물 사진 교차 검증</p>
      <p className="mb-3 font-seoyun text-[11px] font-normal leading-snug text-stone-400">
        완성작 사진의 코·단 배치, 배색, 겉뜨기/안뜨기 흐름을 지금 격자 도안과 맞춰 봅니다.
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
              className={`rounded-full px-2.5 py-1 font-sans text-[10px] ${
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
          className={`${editorChromeBtn} flex flex-1 items-center justify-center gap-1.5 px-3 py-2 font-sans text-[11px]`}
        >
          <ImageFillIcon className="h-3.5 w-3.5" />
          사진 올리기
        </button>
        <button
          type="button"
          onClick={() => void runScan()}
          disabled={busy}
          className={`${editorChromeBtnActive} flex flex-1 items-center justify-center gap-1.5 px-3 py-2 font-sans text-[11px] disabled:opacity-60`}
        >
          {busy ? <SpinnerFillIcon className="h-3.5 w-3.5 animate-spin" /> : null}
          {busy ? "분석 중" : "교차 분석"}
        </button>
      </div>

      <p className="mt-2 truncate font-sans text-[10px] text-stone-400">{sourceLabel}</p>

      {error ? (
        <p className="mt-3 font-seoyun text-[11px] leading-snug text-stone-300">{error}</p>
      ) : null}

      {result ? (
        <div className="mt-3 space-y-2">
          {result.messages.map((message) => (
            <p
              key={message}
              className="font-seoyun text-[11px] font-normal leading-relaxed text-stone-200"
            >
              {message}
            </p>
          ))}
          {canCorrect ? (
            <button
              type="button"
              onClick={applyCorrection}
              className={`${editorChromeBtnActive} mt-1 flex w-full items-center justify-center gap-1.5 px-3 py-2 font-sans text-[11px]`}
            >
              <CheckFillIcon className="h-3.5 w-3.5" />
              사진에 맞춰 자동 보정
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
