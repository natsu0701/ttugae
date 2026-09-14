import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import Button from "../ui/Button.tsx";
import SmoothInput from "../ui/SmoothInput.tsx";
import type { StoredPattern } from "../../types/storedPattern.ts";
import {
  addCollection,
  assignPatternCollection,
  collectionIdForPattern,
  COLLECTIONS_CHANGED_EVENT,
  deleteCollection,
  loadCollections,
  UNFILED_COLLECTION_ID,
} from "../../utils/collectionStorage.ts";

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
  const [query, setQuery] = useState("");
  const [folderId, setFolderId] = useState("all");
  const [newFolder, setNewFolder] = useState("");
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const refresh = () => setTick((n) => n + 1);
    window.addEventListener(COLLECTIONS_CHANGED_EVENT, refresh);
    return () => window.removeEventListener(COLLECTIONS_CHANGED_EVENT, refresh);
  }, []);

  const collections = useMemo(() => {
    void tick;
    return loadCollections();
  }, [tick]);

  const visible = useMemo(() => {
      const q = query.trim().toLowerCase();
    return patterns
      .filter((pattern) => {
        const assigned = collectionIdForPattern(pattern.id);
        if (folderId !== "all" && assigned !== folderId) return false;
        if (q && !pattern.title.toLowerCase().includes(q)) return false;
        return true;
      })
      .sort((a, b) => b.updatedAt - a.updatedAt);
  }, [folderId, patterns, query, tick]);

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
          <p className="mt-1 font-sans text-base font-normal text-gray-600">
            {t("mypage.patterns.subtitle")}
          </p>
        </div>
        <Button variant="primary" onClick={onCreateNew} className="px-6 py-3">
          {t("mypage.patterns.createNew")}
        </Button>
      </div>

      <div className="mb-5 rounded-xl border border-stone-200 bg-white p-4">
        <SmoothInput
          label={t("mypage.patterns.search")}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("mypage.patterns.searchPh")}
        />
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setFolderId("all")}
            className={`rounded-full px-3 py-1.5 font-sans text-sm ${
              folderId === "all" ? "bg-stone-900 text-white" : "bg-stone-100 text-stone-600"
            }`}
          >
            {t("mypage.patterns.allFolders")}
          </button>
          <button
            type="button"
            onClick={() => setFolderId(UNFILED_COLLECTION_ID)}
            className={`rounded-full px-3 py-1.5 font-sans text-sm ${
              folderId === UNFILED_COLLECTION_ID ? "bg-stone-900 text-white" : "bg-stone-100 text-stone-600"
            }`}
          >
            {t("mypage.patterns.unfiled")}
          </button>
          {collections.map((folder) => (
            <button
              key={folder.id}
              type="button"
              onClick={() => setFolderId(folder.id)}
              className={`rounded-full px-3 py-1.5 font-sans text-sm ${
                folderId === folder.id ? "bg-stone-900 text-white" : "bg-stone-100 text-stone-600"
              }`}
            >
              {folder.name}
            </button>
          ))}
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <SmoothInput
            value={newFolder}
            onChange={(e) => setNewFolder(e.target.value)}
            placeholder={t("mypage.patterns.newFolderPh")}
            className="max-w-xs"
          />
          <Button
            type="button"
            variant="secondary"
            className="px-3 py-2 text-base"
            onClick={() => {
              if (!newFolder.trim()) return;
              addCollection(newFolder);
              setNewFolder("");
            }}
          >
            {t("mypage.patterns.addFolder")}
          </Button>
          {folderId !== "all" && folderId !== UNFILED_COLLECTION_ID ? (
            <Button
              type="button"
              variant="ghost"
              className="px-3 py-2 text-base"
              onClick={() => {
                deleteCollection(folderId);
                setFolderId("all");
              }}
            >
              {t("mypage.patterns.deleteFolder")}
            </Button>
          ) : null}
        </div>
      </div>

      {visible.length === 0 ? (
        <div className="rounded-xl bg-gray-50 p-8 text-center">
          <p className="font-sans text-xl font-bold text-gray-900">
            {t("mypage.patterns.emptyTitle")}
          </p>
          <p className="mt-2 font-seoyun text-base text-gray-600">
            {t("mypage.patterns.emptyDesc")}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {visible.map((pattern) => (
            <article key={pattern.id} className="flex flex-col gap-3 rounded-xl bg-gray-50 p-4">
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
                  <p className="mt-1 font-sans text-sm font-normal text-gray-500">
                    {formatDate(pattern.updatedAt)}
                  </p>
                  <p className="mt-2 font-sans text-base font-normal text-gray-600">
                    {pattern.grid[0]?.length ?? pattern.gridSize}x{pattern.grid.length}
                  </p>
                </div>
              </button>
              <label className="font-sans text-sm text-stone-500">
                {t("mypage.patterns.moveFolder")}
                <select
                  className="mt-1 w-full rounded-lg border border-stone-200 bg-white px-2 py-1.5 text-base text-stone-800"
                  value={collectionIdForPattern(pattern.id)}
                  onChange={(e) => assignPatternCollection(pattern.id, e.target.value)}
                >
                  <option value={UNFILED_COLLECTION_ID}>{t("mypage.patterns.unfiled")}</option>
                  {collections.map((folder) => (
                    <option key={folder.id} value={folder.id}>
                      {folder.name}
                    </option>
                  ))}
                </select>
              </label>
              <div className="flex gap-2">
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
                  className="flex-1 py-2 text-base text-gray-600"
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
