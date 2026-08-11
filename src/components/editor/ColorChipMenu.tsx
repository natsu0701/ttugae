import { useEffect, useRef, useState } from "react";
import type { EditorYarn } from "../../types/editorYarn.ts";

type ColorChipMenuProps = {
  yarn: EditorYarn;
  isActive?: boolean;
  onSelect?: () => void;
  onChangeColor: (colorId: string, hex: string) => void;
  onDeleteFromCanvas: (colorId: string) => void;
  variant?: "palette" | "compact";
};

export default function ColorChipMenu({
  yarn,
  isActive = false,
  onSelect,
  onChangeColor,
  onDeleteFromCanvas,
  variant = "palette",
}: ColorChipMenuProps) {
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
    variant === "compact"
      ? "h-6 w-6 rounded-md"
      : "h-full w-full rounded-lg min-h-[2rem]";

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        title={yarn.label}
        onClick={() => {
          onSelect?.();
          setOpen((o) => !o);
        }}
        className={`flex items-center justify-center transition-colors ${
          variant === "palette"
            ? `aspect-square w-full rounded-xl ${isActive ? "bg-coral p-0.5" : "bg-transparent"}`
            : `rounded-lg bg-white p-1 ${isActive ? "ring-2 ring-coral" : ""}`
        }`}
      >
        <span
          className={`block ${chipClass}`}
          style={{ backgroundColor: yarn.hex }}
        />
      </button>

      {open && (
        <div className="absolute left-0 top-full z-50 mt-1 min-w-[7rem] rounded-xl bg-gray-50 p-1">
          <button
            type="button"
            className="w-full rounded-lg px-3 py-2 text-left font-sans text-xs font-normal text-gray-700 transition-colors hover:bg-black hover:text-white"
            onClick={() => {
              colorInputRef.current?.click();
            }}
          >
            변경
          </button>
          <button
            type="button"
            className="w-full rounded-lg px-3 py-2 text-left font-sans text-xs font-normal text-gray-700 transition-colors hover:bg-coral hover:text-white"
            onClick={() => {
              onDeleteFromCanvas(yarn.id);
              setOpen(false);
            }}
          >
            삭제
          </button>
        </div>
      )}

      <input
        ref={colorInputRef}
        type="color"
        className="sr-only"
        value={yarn.hex}
        onChange={(e) => {
          onChangeColor(yarn.id, e.target.value);
          setOpen(false);
        }}
      />
    </div>
  );
}
