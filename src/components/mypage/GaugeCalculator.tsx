import { memo, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import SmoothInput from "../ui/SmoothInput.tsx";
import type { GaugeProfile } from "../../utils/personalizationStorage.ts";

type GaugeCalculatorProps = {
  gauge: GaugeProfile;
  onChange: (next: GaugeProfile) => void;
  compact?: boolean;
  onApplySize?: (sts: number, rows: number) => void;
};

function num(value: string): number {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : 0;
}

function GaugeCalculator({
  gauge,
  onChange,
  compact = false,
  onApplySize,
}: GaugeCalculatorProps) {
  const { t } = useTranslation();
  const [targetCm, setTargetCm] = useState("10");
  const ratioSts = useMemo(() => {
    const before = num(gauge.beforeSts);
    const after = num(gauge.afterSts);
    if (!before || !after) return 1;
    return after / before;
  }, [gauge.afterSts, gauge.beforeSts]);
  const ratioRows = useMemo(() => {
    const before = num(gauge.beforeRows);
    const after = num(gauge.afterRows);
    if (!before || !after) return 1;
    return after / before;
  }, [gauge.afterRows, gauge.beforeRows]);
  const target = num(targetCm) || 10;
  const recSts = Math.round((num(gauge.afterSts) || num(gauge.beforeSts)) * (target / 10));
  const recRows = Math.round((num(gauge.afterRows) || num(gauge.beforeRows)) * (target / 10));
  const canApply = Boolean(onApplySize && recSts > 0 && recRows > 0);

  const patch = (key: keyof GaugeProfile, value: string) => onChange({ ...gauge, [key]: value });
  const inputClass = compact
    ? "rounded-xl border-stone-200 bg-white py-1.5 text-base"
    : undefined;

  return (
    <div className={compact ? "" : "rounded-xl border border-stone-200 bg-white p-6"}>
      {compact ? (
        <p className="mb-2 font-sans text-sm font-normal uppercase tracking-wide text-stone-500">
          {t("editor.gaugeCalcTitle")}
        </p>
      ) : (
        <>
          <h2 className="text-title text-gray-900">{t("mypage.profile.gaugeTitle")}</h2>
          <p className="mt-1 font-seoyun text-base text-stone-500">{t("mypage.profile.gaugeHint")}</p>
        </>
      )}
      <div className={compact ? "grid grid-cols-2 gap-2" : "mt-5 grid grid-cols-2 gap-3"}>
        <SmoothInput
          label={t("mypage.profile.gaugeBeforeSts")}
          value={gauge.beforeSts}
          onChange={(e) => patch("beforeSts", e.target.value)}
          inputMode="numeric"
          className={inputClass}
        />
        <SmoothInput
          label={t("mypage.profile.gaugeBeforeRows")}
          value={gauge.beforeRows}
          onChange={(e) => patch("beforeRows", e.target.value)}
          inputMode="numeric"
          className={inputClass}
        />
        <SmoothInput
          label={t("mypage.profile.gaugeAfterSts")}
          value={gauge.afterSts}
          onChange={(e) => patch("afterSts", e.target.value)}
          inputMode="numeric"
          className={inputClass}
        />
        <SmoothInput
          label={t("mypage.profile.gaugeAfterRows")}
          value={gauge.afterRows}
          onChange={(e) => patch("afterRows", e.target.value)}
          inputMode="numeric"
          className={inputClass}
        />
      </div>
      <div className={compact ? "mt-2" : "mt-5"}>
        <SmoothInput
          label={t("mypage.gauge.targetCm")}
          value={targetCm}
          onChange={(e) => setTargetCm(e.target.value)}
          inputMode="numeric"
          className={inputClass}
        />
      </div>
      <div className={compact ? "mt-2 rounded-lg bg-stone-50 p-3" : "mt-5 rounded-lg bg-stone-50 p-4"}>
        <p className="font-sans text-base font-bold text-stone-800">{t("mypage.gauge.resultTitle")}</p>
        <p className={compact ? "mt-1 font-sans text-sm text-stone-600" : "mt-2 text-body text-stone-600"}>
          {t("mypage.gauge.resultLine", { sts: recSts, rows: recRows, cm: target })}
        </p>
        <p className="mt-1 font-sans text-sm text-stone-400">
          {t("mypage.gauge.ratioLine", {
            sts: ratioSts.toFixed(2),
            rows: ratioRows.toFixed(2),
          })}
        </p>
      </div>
      {canApply ? (
        <button
          type="button"
          onClick={() => onApplySize?.(recSts, recRows)}
          className="mt-2 w-full rounded-xl border border-stone-200 bg-white px-3 py-2 font-sans text-sm font-normal text-stone-700 transition-colors hover:border-stone-300 hover:bg-stone-50 hover:text-stone-900"
        >
          {t("editor.gaugeApplySize")}
        </button>
      ) : null}
    </div>
  );
}

export default memo(GaugeCalculator);
