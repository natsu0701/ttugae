import { memo, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import SmoothInput from "../ui/SmoothInput.tsx";

type GaugeCalculatorProps = {
  defaultSts?: string;
  defaultRows?: string;
};

function num(value: string): number {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : 0;
}

function GaugeCalculator({ defaultSts = "24", defaultRows = "32" }: GaugeCalculatorProps) {
  const { t } = useTranslation();
  const [swatchSts, setSwatchSts] = useState(defaultSts);
  const [swatchRows, setSwatchRows] = useState(defaultRows);
  const [targetWidth, setTargetWidth] = useState("40");
  const [targetHeight, setTargetHeight] = useState("50");

  const needed = useMemo(() => {
    const sts = num(swatchSts);
    const rows = num(swatchRows);
    const width = num(targetWidth);
    const height = num(targetHeight);
    return {
      sts: sts && width ? Math.round((sts * width) / 10) : 0,
      rows: rows && height ? Math.round((rows * height) / 10) : 0,
    };
  }, [swatchSts, swatchRows, targetWidth, targetHeight]);

  return (
    <div className="rounded-xl border border-stone-200 bg-white p-6">
      <h2 className="text-title text-gray-900">{t("mypage.gauge.calculatorTitle")}</h2>
      <p className="mt-1 font-seoyun text-base text-stone-500">{t("mypage.gauge.calculatorHint")}</p>
      <div className="mt-5 grid grid-cols-2 gap-3">
        <SmoothInput
          label={t("mypage.gauge.swatchSts")}
          value={swatchSts}
          onChange={(e) => setSwatchSts(e.target.value)}
          inputMode="numeric"
        />
        <SmoothInput
          label={t("mypage.gauge.swatchRows")}
          value={swatchRows}
          onChange={(e) => setSwatchRows(e.target.value)}
          inputMode="numeric"
        />
        <SmoothInput
          label={t("mypage.gauge.targetWidth")}
          value={targetWidth}
          onChange={(e) => setTargetWidth(e.target.value)}
          inputMode="numeric"
        />
        <SmoothInput
          label={t("mypage.gauge.targetHeight")}
          value={targetHeight}
          onChange={(e) => setTargetHeight(e.target.value)}
          inputMode="numeric"
        />
      </div>
      <div className="mt-5 rounded-lg bg-stone-50 p-4">
        <p className="font-sans text-base font-bold text-stone-800">{t("mypage.gauge.resultTitle")}</p>
        <p className="mt-2 text-body text-stone-600">
          {t("mypage.gauge.resultSize", {
            width: num(targetWidth) || 0,
            height: num(targetHeight) || 0,
            sts: needed.sts,
            rows: needed.rows,
          })}
        </p>
      </div>
    </div>
  );
}

export default memo(GaugeCalculator);
