import { useTranslation } from "react-i18next";
import type { StoredPattern } from "../../types/storedPattern.ts";
import { softShadow } from "../ui/tabButtonStyles.ts";

const COLOR_MAP: Record<string, string> = {
  coral: "#FC5F53",
  black: "#374151",
  white: "#FFFFFF",
  gray: "#E5E7EB",
  cream: "#FFFFFF",
  pink: "#FC5F53",
};

function PatternThumb({ pattern }: { pattern: StoredPattern }) {
  const size = Math.min(10, pattern.grid.length || pattern.gridSize);
  const cells = pattern.grid.slice(0, size).map((r) => r.slice(0, size));

  return (
    <div className="h-14 w-14 shrink-0 rounded-xl bg-gray-100 p-1.5" aria-hidden>
      <div
        className="grid h-full w-full gap-px overflow-hidden rounded-lg bg-gray-200"
        style={{ gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))` }}
      >
        {cells.flatMap((row, r) =>
          row.map((cell, c) => (
            <div
              key={`${r}-${c}`}
              className="aspect-square min-h-0 min-w-0"
              style={{ backgroundColor: COLOR_MAP[cell.colorId] ?? "#FFFFFF" }}
            />
          )),
        )}
      </div>
    </div>
  );
}

function formatDate(ts: number) {
  const d = new Date(ts);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
}

type LoadMyPatternModalProps = {
  open: boolean;
  patterns: StoredPattern[];
  onClose: () => void;
  onSelect: (pattern: StoredPattern) => void;
};

export default function LoadMyPatternModal({
  open,
  patterns,
  onClose,
  onSelect,
}: LoadMyPatternModalProps) {
  const { t } = useTranslation();
  const sorted = patterns.slice().sort((a, b) => b.updatedAt - a.updatedAt);

  if (!open) return null;

  return (
        <div
          className="fade-in fixed inset-0 z-[100] flex items-end justify-center bg-black/50 p-4 sm:items-center"
          onClick={onClose}
          role="dialog"
          aria-modal
          aria-labelledby="load-pattern-title"
        >
          <div
            className={`max-h-[min(85vh,32rem)] w-full max-w-lg overflow-hidden rounded-xl bg-white ${softShadow}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="border-b border-gray-100 px-5 py-4">
              <h2
                id="load-pattern-title"
                className="font-sans text-lg font-bold text-gray-900"
              >
                {t("createPost.loadMine")}
              </h2>
              <p className="mt-1 font-sans text-sm font-normal text-gray-500">
                {t("createPost.loadMineHint")}
              </p>
            </div>

            <ul className="max-h-[min(60vh,24rem)] overflow-y-auto px-3 py-3">
              {sorted.length === 0 ? (
                <li className="px-3 py-8 text-center font-sans text-sm text-gray-500">
                  {t("createPost.loadMineEmpty")}
                </li>
              ) : (
                sorted.map((pattern) => (
                  <li key={pattern.id}>
                    <button
                      type="button"
                      onClick={() => {
                        onSelect(pattern);
                        onClose();
                      }}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition-colors hover:bg-gray-50"
                    >
                      <PatternThumb pattern={pattern} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-sans text-sm font-bold text-gray-900">
                          {pattern.title}
                        </p>
                        <p className="mt-0.5 font-sans text-xs font-normal text-gray-500">
                          {formatDate(pattern.updatedAt)} · {pattern.grid[0]?.length ?? pattern.gridSize}
                          ×{pattern.grid.length}
                        </p>
                      </div>
                    </button>
                  </li>
                ))
              )}
            </ul>

            <div className="border-t border-gray-100 px-5 py-3">
              <button
                type="button"
                onClick={onClose}
                className="w-full rounded-full py-2.5 font-sans text-sm font-normal text-gray-600 transition-colors hover:bg-gray-100"
              >
                {t("common.close")}
              </button>
            </div>
          </div>
        </div>
  );
}
