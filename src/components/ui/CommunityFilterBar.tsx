import { memo, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  CheckFillIcon,
  FilterFillIcon,
  RefreshFillIcon,
} from "../icons/FillIcons.tsx";
import {
  DEFAULT_LOUNGE_FILTERS,
  type LoungeFilters,
} from "../../data/loungeFilters.ts";
import { LOUNGE_CLOSE_FILTER_EVENT } from "../../utils/communityTabEvent.ts";

type FilterOption = { id: string; labelKey: string };

const LEVEL_FILTERS: FilterOption[] = [
  { id: "all", labelKey: "community.filterLevelAll" },
  { id: "beginner", labelKey: "community.filterLevelBeginner" },
  { id: "intermediate", labelKey: "community.filterLevelMid" },
  { id: "advanced", labelKey: "community.filterLevelAdv" },
];

const TOOL_FILTERS: FilterOption[] = [
  { id: "all", labelKey: "community.filterToolAll" },
  { id: "knitting", labelKey: "community.filterToolKnit" },
  { id: "crochet", labelKey: "community.filterToolCrochet" },
];

type CommunityFilterBarProps = {
  filters: LoungeFilters;
  resultCount: number;
  onChange: (next: LoungeFilters) => void;
  closeSignal?: number;
};

function FilterColumn({
  label,
  options,
  value,
  onSelect,
}: {
  label: string;
  options: FilterOption[];
  value: string;
  onSelect: (id: string) => void;
}) {
  const { t } = useTranslation();
  return (
    <div className="space-y-2">
      <p className="block font-sans text-sm font-medium uppercase tracking-wider text-gray-400">
        {label}
      </p>
      <div className="flex flex-col gap-1">
        {options.map((opt) => {
          const active = value === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => onSelect(opt.id)}
              className={`flex items-center justify-between rounded-lg px-3.5 py-2 text-left font-sans text-sm transition-colors ${
                active
                  ? "bg-gray-900 font-medium text-white"
                  : "bg-transparent font-normal text-gray-600 hover:bg-gray-50"
              }`}
            >
              <span>{t(opt.labelKey)}</span>
              {active ? <CheckFillIcon className="h-3 w-3 text-white" /> : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function CommunityFilterBar({
  filters,
  resultCount,
  onChange,
  closeSignal = 0,
}: CommunityFilterBarProps) {
  const { t } = useTranslation();
  const [panelOpen, setPanelOpen] = useState(false);
  const hasActive = filters.level !== "all" || filters.tool !== "all";
  const searching = filters.query.trim().length > 0;

  useEffect(() => {
    setPanelOpen(false);
  }, [closeSignal]);

  useEffect(() => {
    const close = () => setPanelOpen(false);
    window.addEventListener(LOUNGE_CLOSE_FILTER_EVENT, close);
    return () => window.removeEventListener(LOUNGE_CLOSE_FILTER_EVENT, close);
  }, []);

  const patch = (partial: Partial<LoungeFilters>) => {
    onChange({ ...filters, ...partial });
  };

  return (
    <div className="w-full select-none">
      <div className="flex items-center gap-2">
        <label className="flex h-11 min-w-0 flex-1 items-center rounded-full border border-gray-200 bg-white px-4">
          <span className="sr-only">{t("community.filterSearch")}</span>
          <input
            type="search"
            value={filters.query}
            onChange={(e) => patch({ query: e.target.value })}
            placeholder={t("community.filterSearch")}
            className="w-full bg-transparent font-sans text-base font-normal text-gray-800 outline-none placeholder:text-gray-400"
          />
        </label>
        <button
          type="button"
          onClick={() => setPanelOpen((open) => !open)}
          aria-expanded={panelOpen}
          aria-label={t("community.filterAria")}
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full border transition-colors ${
            panelOpen || hasActive
              ? "border-gray-900 bg-gray-900 text-white"
              : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
          }`}
        >
          <FilterFillIcon className="h-4 w-4" />
        </button>
      </div>
      <p className="mt-3 font-sans text-base font-bold leading-6 text-stone-900">
        {t("community.searchResultCount", { count: resultCount })}
      </p>
      {searching ? (
        <p className="mt-1 font-sans text-sm font-medium leading-5 text-stone-500">
          {t("community.searchIncludesAuthor")}
        </p>
      ) : null}

      {panelOpen ? (
        <div className="mt-3 rounded-xl border border-gray-200 bg-white p-5">
          <div className="mb-4 flex justify-end">
            {hasActive ? (
              <button
                type="button"
                onClick={() => onChange({ ...DEFAULT_LOUNGE_FILTERS, query: filters.query })}
                className="flex items-center gap-1 rounded-full px-3 py-2 font-sans text-sm font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-800"
              >
                <RefreshFillIcon className="h-3 w-3" />
                {t("community.filterReset")}
              </button>
            ) : null}
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <FilterColumn
              label={t("community.filterLevel")}
              options={LEVEL_FILTERS}
              value={filters.level}
              onSelect={(id) => patch({ level: id as LoungeFilters["level"] })}
            />
            <FilterColumn
              label={t("community.filterTool")}
              options={TOOL_FILTERS}
              value={filters.tool}
              onSelect={(id) => patch({ tool: id as LoungeFilters["tool"] })}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default memo(CommunityFilterBar);
