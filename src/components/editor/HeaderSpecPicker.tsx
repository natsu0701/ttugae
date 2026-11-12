import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import { editorChromeBtn, editorChromeBtnActive } from "../ui/tabButtonStyles.ts";

export type HeaderSpecOption = {
  id: string;
  label: string;
  swatch?: string;
};

type HeaderSpecPickerProps = {
  fieldLabel: string;
  value: string;
  options: HeaderSpecOption[];
  open: boolean;
  onToggle: () => void;
  onClose: () => void;
  onPick: (id: string) => void;
  onCustom: (text: string) => void;
  placeholder: string;
  ariaLabel: string;
  selectedId?: string | null;
  className?: string;
  align?: "start" | "end";
};

export default function HeaderSpecPicker({
  fieldLabel,
  value,
  options,
  open,
  onToggle,
  onClose,
  onPick,
  onCustom,
  placeholder,
  ariaLabel,
  selectedId,
  className = "",
  align = "start",
}: HeaderSpecPickerProps) {
  const { t } = useTranslation();
  const rootRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [draft, setDraft] = useState(value);
  const [filtering, setFiltering] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (open) {
      setDraft(value);
      setFiltering(false);
    }
  }, [open, value]);

  const placePanel = () => {
    const el = rootRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const width = 320;
    const left =
      align === "end"
        ? Math.max(8, rect.right - width)
        : Math.min(rect.left, window.innerWidth - width - 8);
    setPos({ top: rect.bottom + 8, left: Math.max(8, left) });
  };

  useLayoutEffect(() => {
    if (!open) return;
    placePanel();
  }, [open, align]);

  useEffect(() => {
    if (!open) return;
    window.setTimeout(() => inputRef.current?.focus(), 0);
    const onDoc = (event: MouseEvent) => {
      const target = event.target as Node;
      if (rootRef.current?.contains(target) || panelRef.current?.contains(target)) return;
      onClose();
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        onClose();
      }
    };
    const onWin = () => placePanel();
    document.addEventListener("mousedown", onDoc);
    window.addEventListener("keydown", onKey);
    window.addEventListener("resize", onWin);
    window.addEventListener("scroll", onWin, true);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onWin);
      window.removeEventListener("scroll", onWin, true);
    };
  }, [open, onClose, align]);

  const filtered = useMemo(() => {
    if (!filtering) return options;
    const q = draft.trim().toLowerCase();
    if (!q) return options;
    return options.filter((option) => option.label.toLowerCase().includes(q));
  }, [draft, filtering, options]);

  const applyCustom = () => {
    const next = draft.trim();
    if (!next) return;
    onCustom(next);
    onClose();
  };

  return (
    <div ref={rootRef} className={`relative min-w-0 ${className}`}>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label={ariaLabel}
        title={`${fieldLabel}: ${value}`}
        className="flex min-h-8 max-w-full min-w-0 items-center gap-1 overflow-hidden rounded-md px-1.5 py-1 text-left font-sans text-xs leading-tight text-stone-500 transition-colors hover:bg-stone-100 hover:text-stone-800"
      >
        <span className="shrink-0">{fieldLabel}:</span>
        <span className="min-w-0 truncate">{value}</span>
      </button>
      {open
        ? createPortal(
            <div
              ref={panelRef}
              role="dialog"
              aria-label={ariaLabel}
              style={{ position: "fixed", top: pos.top, left: pos.left, width: 320 }}
              className="z-[130] rounded-2xl border border-stone-200 bg-white p-3 shadow-md"
            >
              <p className="mb-2 font-sans text-sm font-normal text-stone-500">
                {t("common.customInput")}
              </p>
              <div className="flex gap-2">
                <input
                  ref={inputRef}
                  value={draft}
                  onChange={(event) => {
                    setDraft(event.target.value);
                    setFiltering(true);
                  }}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      applyCustom();
                    }
                  }}
                  placeholder={placeholder}
                  className="w-full rounded-xl border border-stone-200 bg-white px-3 py-1.5 font-sans text-sm text-gray-800 outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-coral"
                />
                <button
                  type="button"
                  onClick={applyCustom}
                  className="shrink-0 rounded-xl bg-coral px-3 py-1.5 font-sans text-sm font-bold text-white transition-colors hover:bg-black"
                >
                  {t("editor.apply")}
                </button>
              </div>
              <p className="mb-1.5 mt-3 font-sans text-sm font-normal text-stone-500">
                {t("editor.headerSpecPick")}
              </p>
              <div className="max-h-56 overflow-y-auto scrollbar-thin">
                {filtered.length === 0 ? (
                  <p className="px-2 py-2 font-sans text-sm text-stone-400">
                    {t("editor.headerSpecEmpty")}
                  </p>
                ) : (
                  filtered.map((option) => {
                    const active = selectedId === option.id;
                    return (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => {
                          onPick(option.id);
                          onClose();
                        }}
                        className={`mb-1 flex w-full items-center gap-2 px-3 py-2 text-left font-sans text-sm font-normal last:mb-0 ${
                          active ? editorChromeBtnActive : editorChromeBtn
                        }`}
                      >
                        {option.swatch ? (
                          <span
                            className="h-3.5 w-3.5 shrink-0 rounded-full border border-stone-200"
                            style={{ backgroundColor: option.swatch }}
                          />
                        ) : null}
                        <span className="min-w-0 truncate">{option.label}</span>
                      </button>
                    );
                  })
                )}
              </div>
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}
