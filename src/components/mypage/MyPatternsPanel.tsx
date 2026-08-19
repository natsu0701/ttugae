import { useTranslation } from "react-i18next";
import Button from "../ui/Button.tsx";
import type { StoredPattern } from "../../types/storedPattern.ts";

const COLOR_MAP: Record<string, string> = {
  coral: "#FC5F53",
  black: "#374151",
  white: "#FFFFFF",
  gray: "#E5E7EB",
  cream: "#FFFFFF",
  pink: "#FC5F53",
};

function formatDate(ts: number) {
  const d = new Date(ts);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
}

function PatternThumb({ pattern }: { pattern: StoredPattern }) {
  const size = Math.min(10, pattern.gridSize);
  const cells = pattern.grid.slice(0, size).map((r) => r.slice(0, size));

  return (
    <div className="rounded-xl bg-gray-100 p-2" aria-hidden>
      <div
        className="grid gap-px overflow-hidden rounded-lg bg-gray-200"
        style={{ gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))` }}
      >
        {cells.flatMap((row, r) =>
          row.map((cell, c) => (
            <div
              key={`${r}-${c}`}
              className="h-3 w-3"
              style={{ backgroundColor: COLOR_MAP[cell.colorId] ?? "#FFFFFF" }}
            />
          )),
        )}
      </div>
    </div>
  );
}

type MyPatternsPanelProps = {
  patterns: StoredPattern[];
  onCreateNew: () => void;
  onOpen: (id: string) => void;
  onDelete: (id: string) => void;
};

export default function MyPatternsPanel({
  patterns,
  onCreateNew,
  onOpen,
  onDelete,
}: MyPatternsPanelProps) {
  const { t } = useTranslation();

  const handleDelete = (id: string, title: string) => {
    if (window.confirm(t("common.deletePatternConfirm", { title }))) {
      onDelete(id);
    }
  };

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="font-sans text-2xl font-bold text-gray-900">
            {t("mypage.patterns.title")}
          </h2>
          <p className="mt-1 font-sans text-sm font-normal text-gray-600">
            {t("mypage.patterns.subtitle")}
          </p>
        </div>
        <Button variant="primary" onClick={onCreateNew} className="px-6 py-3">
          {t("mypage.patterns.createNew")}
        </Button>
      </div>

      {patterns.length === 0 ? (
        <div className="rounded-2xl bg-gray-50 p-8 text-center">
          <p className="font-sans text-xl font-bold text-gray-900">
            {t("mypage.patterns.emptyTitle")}
          </p>
          <p className="mt-2 font-seoyun text-sm text-gray-600">
            {t("mypage.patterns.emptyDesc")}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {patterns
            .slice()
            .sort((a, b) => b.updatedAt - a.updatedAt)
            .map((pattern) => (
              <article
                key={pattern.id}
                className="flex flex-col gap-3 rounded-2xl bg-gray-50 p-4 transition-colors hover:bg-gray-100"
              >
                <button
                  type="button"
                  onClick={() => onOpen(pattern.id)}
                  className="flex items-start gap-4 text-left"
                >
                  <PatternThumb pattern={pattern} />
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate font-sans text-lg font-bold text-gray-900">
                      {pattern.title}
                    </h3>
                    <p className="mt-1 font-sans text-xs font-normal text-gray-500">
                      {formatDate(pattern.updatedAt)}
                    </p>
                    <p className="mt-2 font-sans text-sm font-normal text-gray-600">
                      {pattern.gridSize}×{pattern.gridSize}
                    </p>
                  </div>
                </button>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    className="flex-1 py-2 text-sm"
                    onClick={() => onOpen(pattern.id)}
                  >
                    {t("common.edit")}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    className="flex-1 py-2 text-sm text-gray-600"
                    onClick={() => handleDelete(pattern.id, pattern.title)}
                  >
                    {t("common.delete")}
                  </Button>
                </div>
              </article>
            ))}
        </div>
      )}
    </div>
  );
}
