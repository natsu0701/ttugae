import { useEffect, type RefObject } from "react";
import { focusableControls } from "../utils/keyboard.ts";

export function useModalKeyboard(
  open: boolean,
  onClose: () => void,
  containerRef: RefObject<HTMLElement | null>,
) {
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        onClose();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    const root = containerRef.current;
    if (!root) return;
    const previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const items = focusableControls(root);
    items[0]?.focus();

    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Tab") return;
      const list = focusableControls(root);
      if (list.length === 0) {
        event.preventDefault();
        root.focus();
        return;
      }
      const first = list[0];
      const last = list[list.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    root.addEventListener("keydown", onKey);
    return () => {
      root.removeEventListener("keydown", onKey);
      previouslyFocused?.focus();
    };
  }, [open, containerRef]);
}
