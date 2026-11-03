import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import type { EditorYarn } from "../../types/editorYarn.ts";

type ColorChipMenuProps = {
  yarn: EditorYarn;
  isActive?: boolean;
  onSelect?: () => void;
  onChangeColor: (colorId: string, hex: string) => void;
  onDeleteFromCanvas: (colorId: string) => void;
  variant?: "palette" | "compact" | "selection";
};

export default function ColorChipMenu({
  yarn,
  isActive = false,
  onSelect,
  onChangeColor,
  onDeleteFromCanvas,
  variant = "palette",
}: ColorChipMenuProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const colorInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        setOpen(false);
        rootRef.current?.querySelector("button")?.focus();
      }
    };
    document.addEventListener("mousedown", onDoc);
    window.addEventListener("keydown", onKey);
    const firstItem = rootRef.current?.querySelector<HTMLElement>("[data-chip-menu] button");
    firstItem?.focus();
    return () => {
      document.removeEventListener("mousedown", onDoc);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const chipClass =
    variant === "selection"
      ? "h-7 w-7 rounded-md"
      : variant === "compact"
        ? "h-6 w-6 rounded-md"
        : "h-full w-full rounded-lg min-h-[2rem]";

  const hexValue = yarn.hex.startsWith("#") ? yarn.hex.slice(0, 7) : `#${yarn.hex.slice(0, 6)}`;

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        title={yarn.label}
        aria-label={yarn.label}
        aria-haspopup={variant === "selection" ? undefined : "menu"}
        aria-expanded={variant === "selection" ? undefined : open}
        onClick={() => {
          onSelect?.();
        }}
        onKeyDown={(e) => {
          if (variant === "selection") return;
          if (e.key === "ContextMenu" || (e.key === "F10" && e.shiftKey) || e.key === "ArrowDown") {
            e.preventDefault();
            setOpen(true);
          }
        }}
        onContextMenu={(e) => {
          if (variant === "selection") return;
          e.preventDefault();
          setOpen((o) => !o);
        }}
        className={`relative flex items-center justify-center transition-colors ${
          variant === "palette"
            ? `aspect-square w-full rounded-xl ${isActive ? "bg-coral p-0.5" : "border border-stone-200 bg-white p-0.5 hover:border-stone-300 hover:bg-stone-50"}`
            : variant === "selection"
              ? `rounded-lg p-0.5 ${isActive ? "bg-coral" : "border border-stone-200 bg-white hover:border-stone-300 hover:bg-stone-50"}`
              : `rounded-lg p-1 ${isActive ? "bg-coral p-0.5" : "border border-stone-200 bg-white"}`
        }`}
      >
        <span
          className={`block ${chipClass}`}
          style={{ backgroundColor: yarn.hex }}
        />
      </button>
      {variant === "selection" ? (
        <input
          type="color"
          aria-label={`${yarn.label} ${t("common.change")}`}
          className="absolute inset-0 cursor-pointer opacity-0"
          value={hexValue}
          onChange={(e) => onChangeColor(yarn.id, e.target.value)}
          onClick={() => onSelect?.()}
        />
      ) : null}

      {open && variant !== "selection" && (
        <div
          data-chip-menu
          role="menu"
          className="absolute left-0 top-full z-50 mt-1 min-w-[7rem] rounded-xl border border-stone-200 bg-white p-1 shadow-md"
        >
          <button
            type="button"
            role="menuitem"
            className="w-full rounded-lg px-3 py-2 text-left font-sans text-sm font-normal text-stone-700 transition-colors hover:bg-stone-50 hover:text-stone-900"
            onClick={() => colorInputRef.current?.click()}
          >
            {t("common.change")}
          </button>
          <button
            type="button"
            role="menuitem"
            className="w-full rounded-lg px-3 py-2 text-left font-sans text-sm font-normal text-stone-700 transition-colors hover:bg-stone-50 hover:text-stone-900"
            onClick={() => {
              onDeleteFromCanvas(yarn.id);
              setOpen(false);
            }}
          >
            {t("common.delete")}
          </button>
        </div>
      )}

      {variant !== "selection" ? (
        <input
          ref={colorInputRef}
          type="color"
          tabIndex={-1}
          className="sr-only"
          value={hexValue}
          onChange={(e) => {
            onChangeColor(yarn.id, e.target.value);
            setOpen(false);
          }}
        />
      ) : null}
    </div>
  );
}
