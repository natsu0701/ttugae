import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import Button from "../ui/Button.tsx";
import SmoothInput from "../ui/SmoothInput.tsx";
import { softShadow } from "../ui/tabButtonStyles.ts";
import {
  CAST_ON_PARTS,
  CHART_PART_LABELS,
  type ChartTargetPart,
} from "../../types/knittingProject.ts";
import { loadGaugeProfile, saveGaugeProfile } from "../../utils/personalizationStorage.ts";
import NeedleSpecFields from "./NeedleSpecFields.tsx";
import { DEFAULT_NEEDLE, type NeedleSpec } from "../../data/knittingMetadataLibrary.ts";
import { chartPartLabel } from "../../utils/i18nContent.ts";

export type CastOnMode = "replace" | "add" | "gauge";

type CastOnModalProps = {
  open: boolean;
  mode?: CastOnMode;
  onClose: () => void;
  onApply: (cols: number, rows: number) => void;
  onAddChart?: (payload: {
    cols: number;
    rows: number;
    name: string;
    targetPart: ChartTargetPart;
  }) => void;
  needle?: NeedleSpec;
  onNeedleChange?: (next: NeedleSpec) => void;
};

const PARTS = CAST_ON_PARTS;
/** 성인 스웨터 몸통 한 판 표준 폭 (cm) */
const STANDARD_BODY_WIDTH_CM = 50;

export default function CastOnModal({
  open,
  mode = "replace",
  onClose,
  onApply,
  onAddChart,
  needle = DEFAULT_NEEDLE,
  onNeedleChange,
}: CastOnModalProps) {
  const { t } = useTranslation();
  const [w, setW] = useState("24");
  const [h, setH] = useState("28");
  const [name, setName] = useState("");
  const [targetPart, setTargetPart] = useState<ChartTargetPart>("body");
  const [beforeSts, setBeforeSts] = useState("22");
  const [beforeRows, setBeforeRows] = useState("30");
  const [afterSts, setAfterSts] = useState("20");
  const [afterRows, setAfterRows] = useState("28");
  const isAdd = mode === "add";
  const isGauge = mode === "gauge";

  useEffect(() => {
    if (!open) return;
    const saved = loadGaugeProfile();
    if (!saved) return;
    if (saved.beforeSts) setBeforeSts(saved.beforeSts);
    if (saved.beforeRows) setBeforeRows(saved.beforeRows);
    if (saved.afterSts) setAfterSts(saved.afterSts);
    if (saved.afterRows) setAfterRows(saved.afterRows);
    const afterS = Number.parseFloat(saved.afterSts);
    const afterR = Number.parseFloat(saved.afterRows);
    if (Number.isFinite(afterS) && afterS > 0) {
      setW(String(Math.round((STANDARD_BODY_WIDTH_CM / 10) * afterS)));
    }
    if (Number.isFinite(afterR) && afterR > 0) {
      setH(String(Math.round((60 / 10) * afterR)));
    }
  }, [open]);

  const recommended = useMemo(() => {
    const afterS = Number.parseFloat(afterSts);
    const afterR = Number.parseFloat(afterRows);
    const beforeS = Number.parseFloat(beforeSts);
    const beforeR = Number.parseFloat(beforeRows);
    const safe = (n: number) => (Number.isFinite(n) && n > 0 ? n : 0);
    const startSts = Math.round((STANDARD_BODY_WIDTH_CM / 10) * safe(afterS));
    const beforeStartSts = Math.round((STANDARD_BODY_WIDTH_CM / 10) * safe(beforeS));
    const startRows = Math.round((60 / 10) * safe(afterR));
    const beforeStartRows = Math.round((60 / 10) * safe(beforeR));
    return { startSts, beforeStartSts, startRows, beforeStartRows };
  }, [afterSts, afterRows, beforeSts, beforeRows]);

  const handleApply = () => {
    if (isGauge) {
      saveGaugeProfile({ beforeSts, beforeRows, afterSts, afterRows });
      onClose();
      return;
    }
    const cols = parseInt(w, 10);
    const rows = parseInt(h, 10);
    if (!Number.isFinite(cols) || !Number.isFinite(rows)) return;
    if (isAdd && onAddChart) {
      const label = name.trim() || chartPartLabel(t, targetPart, CHART_PART_LABELS[targetPart]);
      onAddChart({ cols, rows, name: label, targetPart });
    } else {
      onApply(cols, rows);
    }
    onClose();
  };

  const applyRecommended = () => {
    saveGaugeProfile({ beforeSts, beforeRows, afterSts, afterRows });
    if (recommended.startSts > 0) setW(String(recommended.startSts));
    if (recommended.startRows > 0) setH(String(recommended.startRows));
    if (isGauge && recommended.startSts > 0 && recommended.startRows > 0) {
      onApply(recommended.startSts, recommended.startRows);
      onClose();
    }
  };

  if (!open) return null;

  return (
        <div
          className="fade-in pointer-events-auto fixed inset-0 z-[100] flex items-center justify-center bg-stone-900/20 p-6"
          onClick={onClose}
          role="dialog"
          aria-modal
        >
          <div
            className={`max-h-[90vh] w-full max-w-md overflow-y-auto rounded-xl bg-[#FFFBF7] p-6 ${softShadow}`}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="font-sans text-xl font-bold text-gray-900">
              {isGauge
                ? t("editor.gaugeButton")
                : isAdd
                  ? t("editor.castOn.addTitle")
                  : t("editor.castOn.title")}
            </h2>
            <p className="mt-2 font-seoyun text-base font-normal text-gray-600">
              {isGauge
                ? t("editor.castOn.gaugeHint")
                : isAdd
                  ? t("editor.castOn.addDescription")
                  : t("editor.castOn.description")}
            </p>

            {isAdd && (
              <div className="mt-5 space-y-3">
                <div>
                  <label className="mb-1.5 block font-sans text-sm font-normal text-gray-600">
                    {t("editor.castOn.nameLabel")}
                  </label>
                  <SmoothInput
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={chartPartLabel(t, targetPart, CHART_PART_LABELS[targetPart])}
                    className="border-stone-200 bg-white py-2 text-base"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block font-sans text-sm font-normal text-gray-600">
                    {t("editor.castOn.partLabel")}
                  </label>
                  <select
                    value={targetPart}
                    onChange={(e) =>
                      setTargetPart(e.target.value as ChartTargetPart)
                    }
                    className="w-full rounded-2xl bg-white px-3 py-2 font-sans text-base text-gray-800 outline-none"
                  >
                    {PARTS.map((part) => (
                      <option key={part} value={part}>
                        {chartPartLabel(t, part, CHART_PART_LABELS[part])}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {isGauge ? (
            <div className="mt-5 rounded-2xl bg-stone-100/80 p-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="mb-2 font-sans text-sm font-normal text-gray-600">
                    {t("editor.castOn.gaugeBefore")}
                  </p>
                  <div className="flex gap-2">
                    <SmoothInput
                      value={beforeSts}
                      onChange={(e) => setBeforeSts(e.target.value)}
                      inputMode="numeric"
          placeholder={t("common.sts")}
                      className="border-stone-200 bg-white py-1.5 text-base"
                      aria-label={t("editor.castOn.gaugeSts")}
                    />
                    <SmoothInput
                      value={beforeRows}
                      onChange={(e) => setBeforeRows(e.target.value)}
                      inputMode="numeric"
                      placeholder={t("common.rows")}
                      className="border-stone-200 bg-white py-1.5 text-base"
                      aria-label={t("editor.castOn.gaugeRows")}
                    />
                  </div>
                </div>
                <div>
                  <p className="mb-2 font-sans text-sm font-normal text-gray-600">
                    {t("editor.castOn.gaugeAfter")}
                  </p>
                  <div className="flex gap-2">
                    <SmoothInput
                      value={afterSts}
                      onChange={(e) => setAfterSts(e.target.value)}
                      inputMode="numeric"
          placeholder={t("common.sts")}
                      className="border-stone-200 bg-white py-1.5 text-base"
                      aria-label={t("editor.castOn.gaugeSts")}
                    />
                    <SmoothInput
                      value={afterRows}
                      onChange={(e) => setAfterRows(e.target.value)}
                      inputMode="numeric"
                      placeholder={t("common.rows")}
                      className="border-stone-200 bg-white py-1.5 text-base"
                      aria-label={t("editor.castOn.gaugeRows")}
                    />
                  </div>
                </div>
              </div>
              <div className="mt-3 rounded-xl bg-white px-3 py-2.5">
                <p className="font-sans text-sm font-normal text-gray-500">
                  {t("editor.castOn.recommended")}
                </p>
                <p className="mt-0.5 font-sans text-base font-semibold text-coral">
                  {recommended.startSts > 0
                    ? t("editor.castOn.recommendedValue", {
                        sts: recommended.startSts,
                        rows: recommended.startRows,
                      })
                    : "—"}
                </p>
                {recommended.beforeStartSts > 0 ? (
                  <p className="mt-0.5 font-seoyun text-sm text-gray-400">
                    {t("editor.castOn.recommendedBefore", {
                      sts: recommended.beforeStartSts,
                      rows: recommended.beforeStartRows,
                    })}
                  </p>
                ) : null}
              </div>
              <button
                type="button"
                onClick={applyRecommended}
                className="mt-2 w-full rounded-full bg-white px-3 py-2 font-sans text-sm font-normal text-gray-900 transition-colors hover:bg-black hover:text-white"
              >
                {t("editor.castOn.applyRecommended")}
              </button>
            </div>
            ) : (
            <>
            {!isAdd ? (
            <div className="mt-5 rounded-2xl bg-stone-100/80 p-4">
              <p className="font-sans text-sm font-normal uppercase tracking-wide text-gray-500">
                {t("editor.castOn.needleTitle")}
              </p>
              <p className="mt-1 font-seoyun text-sm font-normal text-gray-500">
                {t("editor.castOn.needleHint")}
              </p>
              <div className="mt-3">
                <NeedleSpecFields
                  value={needle}
                  onChange={(next) => onNeedleChange?.(next)}
                  tone="light"
                />
              </div>
            </div>
            ) : null}

            <div className="mt-5 flex gap-3">
              <div className="flex-1">
                <label className="mb-1.5 block font-sans text-sm font-normal text-gray-600">
                  {t("editor.castOn.widthLabel")}
                </label>
                <SmoothInput
                  value={w}
                  onChange={(e) => setW(e.target.value)}
                  inputMode="numeric"
                  placeholder="W"
                  className="border-stone-200 bg-white py-2 text-base"
                />
              </div>
              <div className="flex-1">
                <label className="mb-1.5 block font-sans text-sm font-normal text-gray-600">
                  {t("editor.castOn.heightLabel")}
                </label>
                <SmoothInput
                  value={h}
                  onChange={(e) => setH(e.target.value)}
                  inputMode="numeric"
                  placeholder="H"
                  className="border-stone-200 bg-white py-2 text-base"
                />
              </div>
            </div>
            </>
            )}

            <div className="mt-6 flex gap-2">
              <Button type="button" variant="ghost" onClick={onClose} className="flex-1 py-2.5">
                {t("editor.castOn.cancel")}
              </Button>
              <Button type="button" onClick={handleApply} className="flex-1 py-2.5">
                {isGauge
                  ? t("editor.castOn.gaugeSave")
                  : isAdd
                    ? t("editor.castOn.addAction")
                    : t("editor.castOn.createCanvas")}
              </Button>
            </div>
          </div>
        </div>
  );
}
