import { useEffect, type RefObject } from "react";

export function useHeroParallax(rootRef: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const nodes = Array.from(root.querySelectorAll<HTMLElement>("[data-par-dx]"));
    if (nodes.length === 0) return;

    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;
    let frame = 0;

    const tick = () => {
      currentX += (targetX - currentX) * 0.12;
      currentY += (targetY - currentY) * 0.12;
      for (const node of nodes) {
        const dx = Number(node.dataset.parDx) || 0;
        const dy = Number(node.dataset.parDy) || 0;
        node.style.transform = `translate3d(${(currentX * dx).toFixed(2)}px, ${(currentY * dy).toFixed(2)}px, 0)`;
      }
      frame = requestAnimationFrame(tick);
    };

    const onMove = (event: PointerEvent) => {
      if (event.pointerType === "touch") return;
      const rect = root.getBoundingClientRect();
      const width = rect.width || 1;
      const height = rect.height || 1;
      targetX = Math.max(-1, Math.min(1, ((event.clientX - rect.left) / width - 0.5) * 2));
      targetY = Math.max(-1, Math.min(1, ((event.clientY - rect.top) / height - 0.5) * 2));
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    frame = requestAnimationFrame(tick);
    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(frame);
    };
  }, []);
}
