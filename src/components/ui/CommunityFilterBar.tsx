import { memo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  CheckFillIcon,
  FilterFillIcon,
  RefreshFillIcon,
} from "../icons/FillIcons.tsx";
import {
  DEFAULT_LOUNGE_FILTERS,
  filtersFromKnittingBag,
  type LoungeFilters,
} from "../../data/loungeFilters.ts";
import {
  loadNeedleInventory,
  loadYarnInventory,
} from "../../utils/personalizationStorage.ts";

type FilterOption = { id: string; label: string };

const LEVEL_FILTERS: FilterOption[] = [
  { id: "all", label: "모든 숙련도" },
  { id: "beginner", label: "초급 (쉬운 난이도)" },
  { id: "intermediate", label: "중급 (보통 난이도)" },
  { id: "advanced", label: "고급 (어려운 난이도)" },
];

const TOOL_FILTERS: FilterOption[] = [
  { id: "all", label: "모든 도구" },
  { id: "knitting", label: "대바늘 소품/의류" },
  { id: "crochet", label: "코바늘 소품/의류" },
];

const CATEGORY_FILTERS: FilterOption[] = [
  { id: "all", label: "모든 카테고리" },
  { id: "clothing", label: "의류 (스웨터/가디건)" },
  { id: "accessory", label: "소품 (비니/머플러/키링)" },
  { id: "household", label: "생활 용품 (매트/코스터)" },
];

const MATERIAL_FILTERS: FilterOption[] = [
  { id: "all", label: "모든 실 소재" },
  { id: "merino", label: "메리노울" },
  { id: "cotton", label: "오가닉 코튼" },
  { id: "mohair", label: "안개 모헤어" },
  { id: "acrylic", label: "아크릴" },
];

type CommunityFilterBarProps = {
  filters: LoungeFilters;
  resultCount: number;
  onChange: (next: LoungeFilters) => void;
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
  return (
    <div className="space-y-2">
      <p className="block font-sans text-[11px] font-medium uppercase tracking-wider text-gray-400">
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
              className={`flex items-center justify-between rounded-xl px-3.5 py-2 text-left font-sans text-xs transition-colors ${
                active
                  ? "bg-gray-900 font-medium text-white"
                  : "bg-transparent font-normal text-gray-600 hover:bg-gray-50"
              }`}
            >
              <span>{opt.label}</span>
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
}: CommunityFilterBarProps) {
  const [panelOpen, setPanelOpen] = useState(false);
  const hasActive =
    filters.level !== "all" ||
    filters.tool !== "all" ||
    filters.itemKind !== "all" ||
    filters.material !== "all" ||
    filters.myHardwareOnly;

  const bagHint = () => {
    const yarns = loadYarnInventory().length;
    const needles = loadNeedleInventory().length;
    if (yarns === 0 && needles === 0) {
      return "마이페이지 설정에 실 장고와 바늘 창고를 등록하면 더 정확히 맞춰 드려요.";
    }
    return `실 장고 ${yarns}개, 바늘 창고 ${needles}개를 기준으로 맞춥니다.`;
  };

  const patch = (partial: Partial<LoungeFilters>) => {
    onChange({ ...filters, ...partial });
  };

  const handleHardwareToggle = () => {
    if (filters.myHardwareOnly) {
      patch({ myHardwareOnly: false });
      return;
    }
    onChange({ ...filtersFromKnittingBag(), query: filters.query });
  };

  return (
    <div className="w-full select-none">
      <div className="flex items-center gap-2">
        <label className="flex h-11 min-w-0 flex-1 items-center rounded-full border border-gray-200 bg-white px-4">
          <span className="sr-only">도안 검색</span>
          <input
            type="search"
            value={filters.query}
            onChange={(e) => patch({ query: e.target.value })}
            placeholder="도안 검색"
            className="w-full bg-transparent font-sans text-sm font-normal text-gray-800 outline-none placeholder:text-gray-400"
          />
        </label>
        <button
          type="button"
          onClick={() => setPanelOpen((open) => !open)}
          aria-expanded={panelOpen}
          aria-label="필터"
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full border transition-colors ${
            panelOpen || hasActive
              ? "border-gray-900 bg-gray-900 text-white"
              : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
          }`}
        >
          <FilterFillIcon className="h-4 w-4" />
        </button>
      </div>

      <AnimatePresence>
        {panelOpen ? (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="mt-3 rounded-2xl border border-gray-200 bg-white p-5">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={handleHardwareToggle}
                  className={`flex items-center gap-2 rounded-full border px-3.5 py-2 font-sans text-xs font-medium transition-colors ${
                    filters.myHardwareOnly
                      ? "border-gray-900 bg-gray-900 text-white"
                      : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <span
                    className={`flex h-3.5 w-3.5 items-center justify-center rounded-full border ${
                      filters.myHardwareOnly
                        ? "border-white bg-white text-gray-900"
                        : "border-gray-300 bg-gray-100 text-transparent"
                    }`}
                  >
                    <CheckFillIcon className="h-2 w-2" />
                  </span>
                  내 뜨개가방으로 맞춤
                </button>
                {hasActive ? (
                  <button
                    type="button"
                    onClick={() =>
                      onChange({ ...DEFAULT_LOUNGE_FILTERS, query: filters.query })
                    }
                    className="flex items-center gap-1 rounded-full px-3 py-2 font-sans text-xs font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-800"
                  >
                    <RefreshFillIcon className="h-3 w-3" />
                    초기화
                  </button>
                ) : null}
              </div>

              {filters.myHardwareOnly ? (
                <p className="mb-4 font-seoyun text-[11px] font-normal text-gray-500">
                  {bagHint()}
                </p>
              ) : null}

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                <FilterColumn
                  label="나의 뜨개 실력"
                  options={LEVEL_FILTERS}
                  value={filters.level}
                  onSelect={(id) => patch({ level: id as LoungeFilters["level"] })}
                />
                <FilterColumn
                  label="사용 도구 (대바늘/코바늘)"
                  options={TOOL_FILTERS}
                  value={filters.tool}
                  onSelect={(id) => patch({ tool: id as LoungeFilters["tool"] })}
                />
                <FilterColumn
                  label="남아있는 실 소재"
                  options={MATERIAL_FILTERS}
                  value={filters.material}
                  onSelect={(id) => patch({ material: id as LoungeFilters["material"] })}
                />
                <FilterColumn
                  label="제작 품목 카테고리"
                  options={CATEGORY_FILTERS}
                  value={filters.itemKind}
                  onSelect={(id) => patch({ itemKind: id as LoungeFilters["itemKind"] })}
                />
              </div>
              <p className="mt-4 font-sans text-[11px] font-normal text-gray-400">
                {resultCount}개
              </p>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

export default memo(CommunityFilterBar);
