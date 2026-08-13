import { Plus } from "lucide-react";
import type { KnittingChart } from "../../types/knittingProject.ts";
import { CHART_PART_LABELS } from "../../types/knittingProject.ts";

type ChartTabsProps = {
  charts: KnittingChart[];
  activeChartId: string;
  onSelect: (id: string) => void;
  onAdd: () => void;
};

export default function ChartTabs({
  charts,
  activeChartId,
  onSelect,
  onAdd,
}: ChartTabsProps) {
  return (
    <div className="flex shrink-0 items-center gap-1 overflow-x-auto border-b border-pink-100 bg-white px-3 py-1.5">
      {charts.map((chart) => {
        const active = chart.id === activeChartId;
        return (
          <button
            key={chart.id}
            type="button"
            onClick={() => onSelect(chart.id)}
            className={`max-w-[9.5rem] shrink-0 truncate rounded-full px-2.5 py-1 font-sans text-[11px] font-normal transition-colors duration-200 ${
              active
                ? "bg-coral text-white"
                : "bg-gray-100 text-gray-600 hover:bg-black hover:text-white"
            }`}
            title={`${chart.name} · ${CHART_PART_LABELS[chart.targetPart]}`}
          >
            {chart.name}
          </button>
        );
      })}
      <button
        type="button"
        onClick={onAdd}
        className="flex shrink-0 items-center gap-0.5 rounded-full bg-white px-2 py-1 font-sans text-[11px] font-normal text-coral transition-colors hover:bg-pink-50"
      >
        <Plus className="h-3.5 w-3.5" strokeWidth={2.2} aria-hidden />
        도안 추가
      </button>
    </div>
  );
}
