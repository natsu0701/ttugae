import { memo } from "react";
import { useTranslation } from "react-i18next";
import Button from "./Button.tsx";
import { CloseFillIcon, FolderFillIcon, PlusFillIcon } from "../icons/FillIcons.tsx";
import type { StoredPattern } from "../../types/storedPattern.ts";

type EditorEntryModalProps = {
  open: boolean;
  patterns: StoredPattern[];
  onClose: () => void;
  onCreateNew: () => void;
  onLoadExisting: (id: string) => void;
};

function EditorEntryModal({
  open,
  patterns,
  onClose,
  onCreateNew,
  onLoadExisting,
}: EditorEntryModalProps) {
  const { t } = useTranslation();
  if (!open) return null;

  const sorted = patterns.slice().sort((a, b) => b.updatedAt - a.updatedAt);

  return (
    <div className="fixed inset-0 z-[95] flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-stone-900/40"
        onClick={onClose}
        aria-label={t("common.close")}
      />
      <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-lg">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-stone-400 hover:bg-stone-100 hover:text-stone-700"
          aria-label={t("common.close")}
        >
          <CloseFillIcon className="h-4 w-4" />
        </button>
        <h2 className="pr-10 font-sans text-xl font-bold text-stone-900">{t("editor.entryTitle")}</h2>
        <p className="mt-2 font-sans text-base text-stone-500">{t("editor.entryHint")}</p>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <Button type="button" className="h-auto px-4 py-4 text-base" onClick={onCreateNew}>
            <PlusFillIcon className="mr-2 h-4 w-4" />
            {t("editor.entryNew")}
          </Button>
          <Button
            type="button"
            variant="secondary"
            className="h-auto px-4 py-4 text-base"
            disabled={sorted.length === 0}
            onClick={() => {
              document.getElementById("editor-entry-patterns")?.scrollIntoView({
                block: "nearest",
                behavior: "smooth",
              });
            }}
          >
            <FolderFillIcon className="mr-2 h-4 w-4" />
            {t("editor.entryLoad")}
          </Button>
        </div>
        {sorted.length > 0 ? (
          <ul
            id="editor-entry-patterns"
            className="mt-5 max-h-56 space-y-1 overflow-y-auto rounded-xl bg-stone-50 p-2"
          >
            {sorted.map((pattern) => (
              <li key={pattern.id}>
                <button
                  type="button"
                  onClick={() => onLoadExisting(pattern.id)}
                  className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left hover:bg-white"
                >
                  <span className="truncate font-sans text-base font-medium text-stone-800">
                    {pattern.title}
                  </span>
                  <span className="ml-3 shrink-0 font-sans text-sm text-stone-400">
                    {pattern.grid[0]?.length ?? pattern.gridSize}x{pattern.grid.length}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-5 font-sans text-base text-stone-500">{t("editor.entryEmpty")}</p>
        )}
      </div>
    </div>
  );
}

export default memo(EditorEntryModal);
