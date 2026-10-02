import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import Button from "../ui/Button.tsx";
import type { StoredPattern } from "../../types/storedPattern.ts";
import type { CommunityPattern } from "../../data/communityPatterns.ts";
import {
  getPatternStatus,
  PATTERN_META_CHANGED_EVENT,
  setPatternStatus,
} from "../../utils/patternMetaStorage.ts";
import { tabButtonBase, tabButtonClass } from "../ui/tabButtonStyles.ts";
import FinishedWorksGallery from "./FinishedWorksGallery.tsx";
import PagedCardGrid from "../ui/PagedCardGrid.tsx";

function formatDate(ts: number) {
  const d = new Date(ts);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
}

type ProjectView = "progress" | "finished";

type MyProjectsPanelProps = {
  patterns: StoredPattern[];
  onCreateNew: () => void;
  onOpen: (id: string) => void;
  onDelete: (id: string) => void;
  onEditPost: (pattern: CommunityPattern) => void;
};

export default function MyProjectsPanel({
  patterns,
  onCreateNew,
  onOpen,
  onDelete,
  onEditPost,
}: MyProjectsPanelProps) {
  const { t } = useTranslation();
  const [tick, setTick] = useState(0);
  const [view, setView] = useState<ProjectView>("progress");

  useEffect(() => {
    const refresh = () => setTick((n) => n + 1);
    window.addEventListener(PATTERN_META_CHANGED_EVENT, refresh);
    return () => window.removeEventListener(PATTERN_META_CHANGED_EVENT, refresh);
  }, []);

  const grouped = useMemo(() => {
    void tick;
    const inProgress: StoredPattern[] = [];
    const completed: StoredPattern[] = [];
    for (const pattern of patterns) {
      if (getPatternStatus(pattern.id) === "completed") completed.push(pattern);
      else inProgress.push(pattern);
    }
    const byDate = (a: StoredPattern, b: StoredPattern) => b.updatedAt - a.updatedAt;
    return {
      inProgress: inProgress.sort(byDate),
      completed: completed.sort(byDate),
    };
  }, [patterns, tick]);

  const renderList = (items: StoredPattern[], completed: boolean) => {
    if (items.length === 0) {
      return (
        <p className="rounded-xl bg-stone-50 px-4 py-8 text-center font-sans text-base text-stone-400">
          {completed ? t("mypage.projects.completedEmpty") : t("mypage.projects.progressEmpty")}
        </p>
      );
    }
    return (
      <PagedCardGrid
        items={items}
        getKey={(pattern) => pattern.id}
        resetKey={completed ? "completed" : "progress"}
        renderItem={(pattern) => (
          <article className="flex h-full flex-col rounded-xl border border-stone-200 bg-white p-4">
            <button type="button" className="w-full text-left" onClick={() => onOpen(pattern.id)}>
              <h3 className="truncate font-sans text-lg font-bold text-gray-900">{pattern.title}</h3>
              <p className="mt-1 font-sans text-sm text-gray-500">{formatDate(pattern.updatedAt)}</p>
              <p className="mt-2 font-sans text-base text-gray-600">
                {pattern.grid[0]?.length ?? pattern.gridSize}x{pattern.grid.length}
              </p>
            </button>
            <label className="mt-3 flex items-center gap-2 font-sans text-base text-stone-700">
              <input
                type="checkbox"
                checked={completed}
                onChange={(e) =>
                  setPatternStatus(pattern.id, e.target.checked ? "completed" : "in-progress")
                }
              />
              {t("mypage.projects.completeToggle")}
            </label>
            <div className="mt-3 flex gap-2">
              <Button
                type="button"
                variant="secondary"
                className="flex-1 py-2 text-base"
                onClick={() => onOpen(pattern.id)}
              >
                {t("common.edit")}
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="flex-1 py-2 text-base"
                onClick={() => {
                  if (window.confirm(t("common.deletePatternConfirm", { title: pattern.title }))) {
                    onDelete(pattern.id);
                  }
                }}
              >
                {t("common.delete")}
              </Button>
            </div>
          </article>
        )}
      />
    );
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="font-sans text-2xl font-bold text-gray-900">{t("mypage.projects.title")}</h2>
          <p className="mt-1 font-sans text-base text-gray-600">{t("mypage.projects.subtitle")}</p>
        </div>
        <Button variant="primary" onClick={onCreateNew} className="px-6 py-3">
          {t("mypage.projects.create")}
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setView("progress")}
          className={`${tabButtonBase} ${tabButtonClass(view === "progress")}`}
        >
          {t("mypage.projects.inProgress")}
        </button>
        <button
          type="button"
          onClick={() => setView("finished")}
          className={`${tabButtonBase} ${tabButtonClass(view === "finished")}`}
        >
          {t("mypage.tabs.finished")}
        </button>
      </div>

      {view === "progress" ? (
        <section>{renderList(grouped.inProgress, false)}</section>
      ) : (
        <div className="space-y-8">
          <section>
            <h3 className="mb-3 font-sans text-base font-bold text-stone-800">
              {t("mypage.projects.completed")}
            </h3>
            {renderList(grouped.completed, true)}
          </section>
          <section>
            <h3 className="mb-3 font-sans text-base font-bold text-stone-800">
              {t("mypage.finishedTitle")}
            </h3>
            <FinishedWorksGallery onEditPost={onEditPost} />
          </section>
        </div>
      )}
    </div>
  );
}
