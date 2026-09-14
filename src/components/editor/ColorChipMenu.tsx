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
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
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
        onClick={() => {
          onSelect?.();
        }}
        onContextMenu={(e) => {
          if (variant === "selection") return;
          e.preventDefault();
          setOpen((o) => !o);
        }}
        className={`relative flex items-center justify-center overflow-hidden transition-colors ${
          variant === "palette"
            ? `aspect-square w-full rounded-xl ${isActive ? "bg-coral p-0.5" : "border border-stone-600/80 bg-stone-700 p-0.5 hover:border-stone-500 hover:bg-stone-600"}`
            : variant === "selection"
              ? `rounded-lg p-0.5 ${isActive ? "bg-coral" : "border border-stone-600/80 bg-stone-700 hover:border-stone-500 hover:bg-stone-600"}`
              : `rounded-lg p-1 ${isActive ? "bg-coral p-0.5" : "border border-stone-600/80 bg-stone-700"}`
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
        <div className="absolute left-0 top-full z-50 mt-1 min-w-[7rem] rounded-xl border border-stone-800/80 bg-stone-900 p-1">
          <button
            type="button"
            className="w-full rounded-lg px-3 py-2 text-left font-sans text-sm font-normal text-stone-200 transition-colors hover:bg-stone-800 hover:text-white"
            onClick={() => colorInputRef.current?.click()}
          >
            {t("common.change")}
          </button>
          <button
            type="button"
            className="w-full rounded-lg px-3 py-2 text-left font-sans text-sm font-normal text-stone-200 transition-colors hover:bg-stone-800 hover:text-white"
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
