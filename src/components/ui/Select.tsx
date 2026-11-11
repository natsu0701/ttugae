import {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import { createPortal } from "react-dom";
import { ChevronFillIcon } from "../icons/FillIcons.tsx";

export type SelectOption = {
  value: string;
  label: string;
};

type SelectProps = {
  id?: string;
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  tone?: "light" | "dark";
  className?: string;
  "aria-label"?: string;
};

const PANEL_MAX = 240;
const GAP = 6;

export default function Select({
  id,
  value,
  options,
  onChange,
  tone = "light",
  className = "",
  "aria-label": ariaLabel,
}: SelectProps) {
  const autoId = useId();
  const triggerId = id ?? autoId;
  const listId = `${triggerId}-list`;
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({
    top: 0,
    bottom: 0,
    left: 0,
    width: 0,
    maxH: PANEL_MAX,
    place: "below" as "below" | "above",
  });
  const selectedIndex = Math.max(
    0,
    options.findIndex((option) => option.value === value),
  );
  const [active, setActive] = useState(selectedIndex);
  const current = options.find((option) => option.value === value) ?? options[0];
  const light = tone === "light";

  const placePanel = () => {
    const el = triggerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom - 8;
    const spaceAbove = rect.top - 8;
    const placeBelow = spaceBelow >= 120 || spaceBelow >= spaceAbove;
    setPos({
      top: rect.bottom + GAP,
      bottom: window.innerHeight - rect.top + GAP,
      left: rect.left,
      width: rect.width,
      maxH: Math.min(PANEL_MAX, Math.max(96, placeBelow ? spaceBelow : spaceAbove)),
      place: placeBelow ? "below" : "above",
    });
  };

  useLayoutEffect(() => {
    if (!open) return;
    placePanel();
    setActive(selectedIndex);
  }, [open, selectedIndex]);

  useEffect(() => {
    if (!open) return;
    const onDoc = (event: MouseEvent) => {
      const target = event.target as Node;
      if (rootRef.current?.contains(target) || panelRef.current?.contains(target)) return;
      setOpen(false);
    };
    const onWin = () => placePanel();
    document.addEventListener("mousedown", onDoc);
    window.addEventListener("resize", onWin);
    window.addEventListener("scroll", onWin, true);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      window.removeEventListener("resize", onWin);
      window.removeEventListener("scroll", onWin, true);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    panelRef.current
      ?.querySelector<HTMLElement>(`[data-select-index="${active}"]`)
      ?.scrollIntoView({ block: "nearest" });
  }, [open, active]);

  const pick = (next: string) => {
    onChange(next);
    setOpen(false);
    triggerRef.current?.focus();
  };

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (!open) {
      if (event.key === "ArrowDown" || event.key === "ArrowUp" || event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        setOpen(true);
      }
      return;
    }
    if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      setOpen(false);
      return;
    }
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActive((index) => Math.min(options.length - 1, index + 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive((index) => Math.max(0, index - 1));
    } else if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      const option = options[active];
      if (option) pick(option.value);
    }
  };

  const triggerClass = light
    ? "border-stone-200 bg-white text-gray-800 hover:border-stone-300 hover:bg-stone-50"
    : "border-stone-600/80 bg-stone-800 text-stone-100 hover:bg-stone-700";
  const panelClass = light
    ? "border-stone-200 bg-white"
    : "border-stone-600 bg-stone-800";

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <button
        ref={triggerRef}
        id={triggerId}
        type="button"
        role="combobox"
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-controls={listId}
        aria-label={ariaLabel}
        onClick={() => setOpen((next) => !next)}
        onKeyDown={onKeyDown}
        className={`flex w-full items-center justify-between gap-2 rounded-2xl border px-3 py-2 text-left font-sans text-base outline-none ${triggerClass}`}
      >
        <span className="min-w-0 truncate">{current?.label ?? ""}</span>
        <ChevronFillIcon className="h-4 w-4 shrink-0 text-stone-400" open={open} />
      </button>
      {open
        ? createPortal(
            <div
              ref={panelRef}
              id={listId}
              role="listbox"
              style={{
                position: "fixed",
                top: pos.place === "below" ? pos.top : undefined,
                bottom: pos.place === "above" ? pos.bottom : undefined,
                left: pos.left,
                width: pos.width,
                maxHeight: pos.maxH,
              }}
              className={`z-[130] overflow-y-auto rounded-2xl border p-1.5 shadow-lg scrollbar-thin ${panelClass}`}
            >
              {options.map((option, index) => {
                const selected = option.value === value;
                const focused = index === active;
                return (
                  <button
                    key={option.value}
                    type="button"
                    role="option"
                    aria-selected={selected}
                    data-select-index={index}
                    onMouseEnter={() => setActive(index)}
                    onClick={() => pick(option.value)}
                    className={`flex w-full items-center rounded-xl px-3 py-2 text-left font-sans text-base transition-colors ${
                      selected
                        ? "bg-coral text-white"
                        : focused
                          ? light
                            ? "bg-stone-100 text-stone-900"
                            : "bg-stone-700 text-white"
                          : light
                            ? "text-stone-700 hover:bg-stone-50"
                            : "text-stone-200 hover:bg-stone-700"
                    }`}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}
