import { useTranslation } from "react-i18next";
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
};

export default function ChartTabs({
  charts,
  activeChartId,
  facesIndependent,
  onSelect,
}: ChartTabsProps) {
  const { t } = useTranslation();
  const visible = visibleEditorCharts(charts, facesIndependent);
  if (visible.length <= 1) return null;

  return (
    <div className="flex min-w-0 items-center gap-1.5 overflow-x-auto">
      {visible.map((chart) => {
        const active = chart.id === activeChartId;
        return (
          <button
            key={chart.id}
            type="button"
            onClick={() => onSelect(chart.id)}
            className={`max-w-[7.5rem] shrink-0 truncate rounded-full px-2.5 py-1 font-sans text-sm font-normal ${
              active ? "border border-coral bg-coral text-white" : editorChromeTone
            }`}
            title={`${chart.name} · ${chartPartLabel(t, chart.targetPart, CHART_PART_LABELS[chart.targetPart])}`}
          >
            {chart.name}
          </button>
        );
      })}
    </div>
  );
}
