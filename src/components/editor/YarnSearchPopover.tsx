import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { searchYarnCatalog, YARN_CATALOG } from "../../data/yarnCatalog.ts";
import type { EditorYarn, YarnCatalogEntry } from "../../types/editorYarn.ts";
import SmoothInput from "../ui/SmoothInput.tsx";
import type { TFunction } from "i18next";
import { loc } from "../../utils/i18nContent.ts";

type YarnSearchPopoverProps = {
  open: boolean;
  onClose: () => void;
  onSelect: (yarn: EditorYarn) => void;
  existingIds: Set<string>;
};

function catalogToEditorYarn(entry: YarnCatalogEntry, t: TFunction): EditorYarn {
  return {
    id: `yarn-${entry.id}`,
    label: loc(t, `content.yarns.${entry.id}.name`, entry.name),
    hex: entry.hex,
    brand: loc(t, `content.yarns.${entry.id}.brand`, entry.brand),
    fiberType: loc(t, `content.yarns.${entry.id}.fiber`, entry.fiberType),
    texture: entry.texture,
  };
}

export default function YarnSearchPopover({
  open,
  onClose,
  onSelect,
  existingIds,
}: YarnSearchPopoverProps) {
  const { t } = useTranslation();
  const [query, setQuery] = useState("");
  const [highlight, setHighlight] = useState(0);
  const panelRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const base = searchYarnCatalog(query);
    if (!q) return base;
    const extra = YARN_CATALOG.filter((entry) => {
      const name = loc(t, `content.yarns.${entry.id}.name`, entry.name).toLowerCase();
      const brand = loc(t, `content.yarns.${entry.id}.brand`, entry.brand).toLowerCase();
      const fiber = loc(t, `content.yarns.${entry.id}.fiber`, entry.fiberType).toLowerCase();
      return name.includes(q) || brand.includes(q) || fiber.includes(q);
    });
    const map = new Map(base.map((entry) => [entry.id, entry]));
    extra.forEach((entry) => map.set(entry.id, entry));
    return [...map.values()].slice(0, 10);
  }, [query, t]);

  useEffect(() => {
    if (open) {
      setQuery("");
      setHighlight(0);
      window.setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open, onClose]);

  const pick = (entry: YarnCatalogEntry) => {
    const yarn = catalogToEditorYarn(entry, t);
    if (existingIds.has(yarn.id)) {
      onSelect(yarn);
      onClose();
      return;
    }
    onSelect(yarn);
    onClose();
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      onClose();
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlight((h) => Math.min(h + 1, results.length - 1));
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight((h) => Math.max(h - 1, 0));
    }
    if (e.key === "Enter" && results[highlight]) {
      e.preventDefault();
      pick(results[highlight]);
    }
  };

  if (!open) return null;

  return (
    <div
      ref={panelRef}
      className="absolute left-0 right-0 top-full z-30 mt-2 rounded-xl border border-stone-600/80 bg-stone-800 p-3"
      role="dialog"
      aria-label={t("editor.yarnSearch")}
    >
      <label className="mb-1.5 block font-sans text-sm font-bold text-stone-100">
        {t("editor.yarnSearch")}
      </label>
      <p className="mb-2 font-seoyun text-sm font-normal text-stone-400">
        {t("editor.yarnSearchHint")}
      </p>
      <SmoothInput
        ref={inputRef}
        type="text"
        tone="dark"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setHighlight(0);
        }}
        onKeyDown={onKeyDown}
        placeholder={t("editor.yarnSearchPh")}
        className="rounded-xl border-stone-700/80 px-3 py-2.5 text-base"
      />

      <ul className="mt-2 max-h-48 overflow-y-auto hide-scrollbar" role="listbox">
        {results.length === 0 ? (
          <li className="px-2 py-3 font-seoyun text-sm font-normal text-stone-500">
            {t("editor.yarnSearchEmpty")}
          </li>
        ) : (
          results.map((entry, i) => {
            const yarn = catalogToEditorYarn(entry, t);
            const added = existingIds.has(yarn.id);
            return (
              <li key={entry.id}>
                <button
                  type="button"
                  role="option"
                  aria-selected={i === highlight}
                  onMouseEnter={() => setHighlight(i)}
                  onClick={() => pick(entry)}
                  className={`flex w-full items-center gap-2.5 rounded-xl px-2 py-2 text-left transition-colors ${
                    i === highlight ? "bg-stone-800" : "hover:bg-stone-800"
                  }`}
                >
                  <span
                    className="h-8 w-8 shrink-0 rounded-lg"
                    style={{ backgroundColor: entry.hex }}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-sans text-base font-normal text-stone-100">
                      {loc(t, `content.yarns.${entry.id}.name`, entry.name)}
                    </span>
                    <span className="block truncate font-seoyun text-sm font-normal text-stone-400">
                      {loc(t, `content.yarns.${entry.id}.brand`, entry.brand)} ·{" "}
                      {loc(t, `content.yarns.${entry.id}.fiber`, entry.fiberType)}
                      {added ? t("editor.inPalette") : ""}
                    </span>
                  </span>
                </button>
              </li>
            );
          })
        )}
      </ul>
    </div>
  );
}
