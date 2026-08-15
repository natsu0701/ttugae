import { useEffect, useMemo, useRef, useState } from "react";
import { searchYarnCatalog } from "../../data/yarnCatalog.ts";
import type { EditorYarn, YarnCatalogEntry } from "../../types/editorYarn.ts";
import SmoothInput from "../ui/SmoothInput.tsx";

type YarnSearchPopoverProps = {
  open: boolean;
  onClose: () => void;
  onSelect: (yarn: EditorYarn) => void;
  existingIds: Set<string>;
};

function catalogToEditorYarn(entry: YarnCatalogEntry): EditorYarn {
  return {
    id: `yarn-${entry.id}`,
    label: entry.name,
    hex: entry.hex,
    brand: entry.brand,
    fiberType: entry.fiberType,
    texture: entry.texture,
  };
}

export default function YarnSearchPopover({
  open,
  onClose,
  onSelect,
  existingIds,
}: YarnSearchPopoverProps) {
  const [query, setQuery] = useState("");
  const [highlight, setHighlight] = useState(0);
  const panelRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const results = useMemo(() => searchYarnCatalog(query), [query]);

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
    const yarn = catalogToEditorYarn(entry);
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
      aria-label="실 검색"
    >
      <label className="mb-1.5 block font-sans text-xs font-bold text-stone-100">
        실 검색
      </label>
      <p className="mb-2 font-seoyun text-[11px] font-normal text-stone-400">
        브랜드·종류(메리노울, 모헤어 등)를 입력해 보세요
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
        placeholder="예: 메리노울, 모헤어"
        className="rounded-xl border-stone-700/80 px-3 py-2.5 text-sm"
      />

      <ul className="mt-2 max-h-48 overflow-y-auto hide-scrollbar" role="listbox">
        {results.length === 0 ? (
          <li className="px-2 py-3 font-seoyun text-xs font-normal text-stone-500">
            검색 결과가 없어요. 다른 키워드를 입력해 보세요.
          </li>
        ) : (
          results.map((entry, i) => {
            const yarn = catalogToEditorYarn(entry);
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
                    <span className="block truncate font-sans text-sm font-normal text-stone-100">
                      {entry.name}
                    </span>
                    <span className="block truncate font-seoyun text-[11px] font-normal text-stone-400">
                      {entry.brand} · {entry.fiberType}
                      {added ? " · 팔레트에 있음" : ""}
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
