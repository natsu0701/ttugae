import {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
  type ChangeEvent,
  type FocusEvent,
  type InputHTMLAttributes,
  type KeyboardEvent,
  type MouseEvent,
  type SyntheticEvent,
} from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

export type SmoothInputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  tone?: "light" | "dark";
};

const LIGHT_TONE =
  "w-full rounded-2xl border border-stone-200 bg-gray-100 px-4 py-3 font-sans font-normal text-gray-800 placeholder:text-gray-400 outline-none transition-colors focus:border-coral focus:bg-gray-50";

const DARK_TONE =
  "w-full rounded-2xl border border-stone-700/80 bg-stone-700 px-4 py-3 font-sans font-normal text-stone-100 placeholder:text-stone-400 outline-none transition-colors focus:border-coral focus:bg-stone-700";

function utilityGroup(token: string): string {
  const variant = token.match(/^((?:[\w-]+:)+)/)?.[1] ?? "";
  const core = token.slice(variant.length);
  if (core === "border" || core === "border-0" || /^border-[0-9]/.test(core)) {
    return `${variant}border-width`;
  }
  if (core.startsWith("border-")) return `${variant}border-color`;
  if (core.startsWith("rounded")) return `${variant}rounded`;
  if (core.startsWith("bg-")) return `${variant}bg`;
  if (/^text-(xs|sm|base|lg|xl|\[|[0-9])/.test(core)) return `${variant}text-size`;
  if (/^text-(left|right|center|start|end|justify)$/.test(core)) return `${variant}text-align`;
  if (core.startsWith("text-")) return `${variant}text-color`;
  if (core.startsWith("placeholder:")) return `${variant}placeholder`;
  if (
    core === "font-sans" ||
    core === "font-serif" ||
    core === "font-mono" ||
    core === "font-rounded"
  ) {
    return `${variant}font-family`;
  }
  if (core.startsWith("font-")) return `${variant}font-weight`;
  if (core.startsWith("px-")) return `${variant}px`;
  if (core.startsWith("py-")) return `${variant}py`;
  if (core.startsWith("pt-")) return `${variant}pt`;
  if (core.startsWith("pb-")) return `${variant}pb`;
  if (core.startsWith("pl-")) return `${variant}pl`;
  if (core.startsWith("pr-")) return `${variant}pr`;
  if (core.startsWith("p-")) return `${variant}p`;
  if (core.startsWith("h-")) return `${variant}h`;
  if (core.startsWith("w-")) return `${variant}w`;
  if (core.startsWith("min-w-")) return `${variant}min-w`;
  if (core.startsWith("max-w-")) return `${variant}max-w`;
  if (core.startsWith("caret-")) return `${variant}caret`;
  return `${variant}${core}`;
}

function mergeClasses(base: string, extra: string): string {
  if (!extra) return base;
  const extraParts = extra.split(/\s+/).filter(Boolean);
  const extraGroups = new Set(extraParts.map(utilityGroup));
  const kept = base.split(/\s+/).filter(Boolean).filter((token) => !extraGroups.has(utilityGroup(token)));
  return [...kept, ...extraParts].join(" ");
}

function rootClassName(className: string): string {
  if (/\bflex-1\b/.test(className)) return "relative min-w-0 flex-1";
  if (/\bw-(?!full\b)\S+/.test(className)) return "relative w-fit max-w-full";
  return "relative w-full";
}

function displayBeforeCaret(value: string, start: number, type: string): string {
  const slice = value.slice(0, Math.max(0, start));
  if (type === "password") return "\u2022".repeat(slice.length);
  return slice.replace(/\s/g, "\u00a0");
}

const SmoothInput = forwardRef<HTMLInputElement, SmoothInputProps>(function SmoothInput(
  {
    label,
    tone = "light",
    className = "",
    id,
    type = "text",
    value,
    defaultValue,
    onChange,
    onFocus,
    onBlur,
    onKeyDown,
    onKeyUp,
    onClick,
    onSelect,
    style,
    ...props
  },
  ref,
) {
  const inputRef = useRef<HTMLInputElement>(null);
  const measurerRef = useRef<HTMLSpanElement>(null);
  useImperativeHandle(ref, () => inputRef.current as HTMLInputElement);

  const isControlled = value !== undefined;
  const [focused, setFocused] = useState(false);

  const caretX = useMotionValue(0);
  const springCaretX = useSpring(caretX, {
    stiffness: 500,
    damping: 30,
    mass: 0.5,
  });

  const inputId = id ?? (label ? label.replace(/\s/g, "-").toLowerCase() : undefined);
  const toneClass = tone === "dark" ? DARK_TONE : LIGHT_TONE;
  const mergedClassName = mergeClasses(`${toneClass} caret-transparent`, className);

  const updateCaretPosition = useCallback(() => {
    const input = inputRef.current;
    const measurer = measurerRef.current;
    if (!input || !measurer) return;

    const liveValue = input.value;
    const selectionStart = input.selectionStart ?? liveValue.length;
    const cs = window.getComputedStyle(input);
    measurer.style.fontFamily = cs.fontFamily;
    measurer.style.fontSize = cs.fontSize;
    measurer.style.fontWeight = cs.fontWeight;
    measurer.style.letterSpacing = cs.letterSpacing;
    measurer.style.font = cs.font;
    measurer.textContent = displayBeforeCaret(liveValue, selectionStart, type);
    const paddingLeft = Number.parseFloat(cs.paddingLeft) || 0;
    const borderLeft = Number.parseFloat(cs.borderLeftWidth) || 0;
    caretX.set(measurer.offsetWidth + paddingLeft + borderLeft - input.scrollLeft);
  }, [caretX, type]);

  useLayoutEffect(() => {
    updateCaretPosition();
  }, [updateCaretPosition, value, focused]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    onChange?.(e);
    requestAnimationFrame(updateCaretPosition);
  };

  const handleFocus = (e: FocusEvent<HTMLInputElement>) => {
    setFocused(true);
    requestAnimationFrame(updateCaretPosition);
    onFocus?.(e);
  };

  const handleBlur = (e: FocusEvent<HTMLInputElement>) => {
    setFocused(false);
    onBlur?.(e);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    onKeyDown?.(e);
    requestAnimationFrame(updateCaretPosition);
  };

  const handleKeyUp = (e: KeyboardEvent<HTMLInputElement>) => {
    updateCaretPosition();
    onKeyUp?.(e);
  };

  const handleClick = (e: MouseEvent<HTMLInputElement>) => {
    updateCaretPosition();
    onClick?.(e);
  };

  const handleSelect = (e: SyntheticEvent<HTMLInputElement>) => {
    updateCaretPosition();
    onSelect?.(e);
  };

  const field = (
    <div className={rootClassName(mergedClassName)}>
      <span
        ref={measurerRef}
        className="pointer-events-none absolute whitespace-pre opacity-0"
        aria-hidden
      />
      <motion.div
        style={{ x: springCaretX, opacity: focused ? undefined : 0 }}
        className="pointer-events-none absolute left-0 top-1/2 z-10 h-[1.15em] w-[2.5px] -translate-y-1/2 rounded-full bg-coral"
        animate={focused ? { opacity: [1, 0.15, 1] } : { opacity: 0 }}
        transition={{ repeat: focused ? Infinity : 0, duration: 0.9, ease: "easeInOut" }}
      />
      <input
        {...props}
        ref={inputRef}
        id={inputId}
        type={type}
        {...(isControlled ? { value: value ?? "" } : { defaultValue })}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        onKeyUp={handleKeyUp}
        onClick={handleClick}
        onSelect={handleSelect}
        onScroll={updateCaretPosition}
        className={mergedClassName}
        style={{ ...style, caretColor: "transparent" }}
      />
    </div>
  );

  if (!label) return field;

  return (
    <div className="w-full">
      <label
        htmlFor={inputId}
        className={`mb-2 block font-sans text-sm font-normal ${
          tone === "dark" ? "text-stone-300" : "text-gray-700"
        }`}
      >
        {label}
      </label>
      {field}
    </div>
  );
});

export default SmoothInput;
