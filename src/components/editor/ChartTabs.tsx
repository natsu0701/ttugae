import { useTranslation } from "react-i18next";
import { PlusFillIcon } from "../icons/FillIcons.tsx";
import type { KnittingChart } from "../../types/knittingProject.ts";
import {
  CHART_PART_LABELS,
  visibleEditorCharts,
} from "../../types/knittingProject.ts";
import { chartPartLabel } from "../../utils/i18nContent.ts";
import { editorChromeTone } from "../ui/tabButtonStyles.ts";

type ChartTabsProps = {
  charts: KnittingChart[];
  activeChartId: string;
  facesIndependent: boolean;
  onSelect: (id: string) => void;
  onAdd: () => void;
  onFacesIndependentChange: (independent: boolean) => void;
};

export default function ChartTabs({
  charts,
  activeChartId,
  facesIndependent,
  onSelect,
  onAdd,
  onFacesIndependentChange,
}: ChartTabsProps) {
  const { t } = useTranslation();
  const visible = visibleEditorCharts(charts, facesIndependent);

  return (
    <div className="flex min-w-0 items-center gap-1.5 overflow-x-auto">
      <p className="shrink-0 font-sans text-[10px] font-normal tracking-wide text-stone-400">
        {t("editor.facesTitle")}
      </p>
      <div
        className="flex shrink-0 items-center gap-0.5 rounded-full border border-stone-600/80 bg-stone-800 p-0.5"
        role="group"
        aria-label={t("editor.facesTitle")}
      >
        <button
          type="button"
          onClick={() => onFacesIndependentChange(false)}
          className={`rounded-full px-2.5 py-1 font-sans text-[11px] font-normal ${
            !facesIndependent
              ? "border border-coral bg-coral text-white"
              : editorChromeTone
          }`}
        >
          {t("editor.facesSame")}
        </button>
        <button
          type="button"
          onClick={() => onFacesIndependentChange(true)}
          className={`rounded-full px-2.5 py-1 font-sans text-[11px] font-normal ${
            facesIndependent
              ? "border border-coral bg-coral text-white"
              : editorChromeTone
          }`}
        >
          {t("editor.facesDifferent")}
        </button>
      </div>
      <span className="h-4 w-px shrink-0 bg-stone-700" aria-hidden />
      {visible.map((chart) => {
        const active = chart.id === activeChartId;
        return (
          <button
            key={chart.id}
            type="button"
            onClick={() => onSelect(chart.id)}
            className={`max-w-[7.5rem] shrink-0 truncate rounded-full px-2.5 py-1 font-sans text-[11px] font-normal ${
              active ? "border border-coral bg-coral text-white" : editorChromeTone
            }`}
            title={`${chart.name} · ${chartPartLabel(t, chart.targetPart, CHART_PART_LABELS[chart.targetPart])}`}
          >
            {chart.name}
          </button>
        );
      })}
      <button
        type="button"
        onClick={onAdd}
        className={`flex shrink-0 items-center gap-0.5 rounded-full px-2 py-1 font-sans text-[11px] font-normal ${editorChromeTone}`}
      >
        <PlusFillIcon className="h-3.5 w-3.5" />
        {t("editor.castOn.addAction")}
      </button>
    </div>
  );
}
