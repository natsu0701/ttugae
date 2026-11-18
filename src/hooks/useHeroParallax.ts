import { useEffect, type RefObject } from "react";

/** 위아래 둥실거림·외곽선이 화면 밖으로 나가지 않게 남기는 여유 */
const EDGE_SLACK = 18;

type RestGap = {
  left: number;
  right: number;
  top: number;
  bottom: number;
};

/**
 * 마우스 패럴랙스. 각 장식은 히어로 박스 안에서만 움직이게 잘라 내지 않는다.
 */
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
    const rest = new Map<HTMLElement, RestGap>();

    const captureRest = () => {
      for (const node of nodes) node.style.transform = "none";
      void root.offsetWidth;
      const rr = root.getBoundingClientRect();
      for (const node of nodes) {
        const nr = node.getBoundingClientRect();
        rest.set(node, {
          left: nr.left - rr.left,
          right: rr.right - nr.right,
          top: nr.top - rr.top,
          bottom: rr.bottom - nr.bottom,
        });
      }
    };

    const tick = () => {
      currentX += (targetX - currentX) * 0.12;
      currentY += (targetY - currentY) * 0.12;
      for (const node of nodes) {
        const dx = Number(node.dataset.parDx) || 0;
        const dy = Number(node.dataset.parDy) || 0;
        const gap = rest.get(node);
        let tx = currentX * dx;
        let ty = currentY * dy;
        if (gap) {
          const minX = -(Math.max(0, gap.left - EDGE_SLACK));
          const maxX = Math.max(0, gap.right - EDGE_SLACK);
          const minY = -(Math.max(0, gap.top - EDGE_SLACK));
          const maxY = Math.max(0, gap.bottom - EDGE_SLACK);
          tx = Math.max(minX, Math.min(maxX, tx));
          ty = Math.max(minY, Math.min(maxY, ty));
        }
        node.style.transform = `translate3d(${tx.toFixed(2)}px, ${ty.toFixed(2)}px, 0)`;
      }
      if (Math.abs(targetX - currentX) > 0.002 || Math.abs(targetY - currentY) > 0.002) {
        frame = requestAnimationFrame(tick);
      } else {
        frame = 0;
      }
    };

    const onMove = (event: PointerEvent) => {
      if (event.pointerType === "touch") return;
      const rect = root.getBoundingClientRect();
      const width = rect.width || 1;
      const height = rect.height || 1;
      targetX = Math.max(-1, Math.min(1, ((event.clientX - rect.left) / width - 0.5) * 2));
      targetY = Math.max(-1, Math.min(1, ((event.clientY - rect.top) / height - 0.5) * 2));
      if (!frame) frame = requestAnimationFrame(tick);
    };

    const onResize = () => {
      captureRest();
      if (!frame) frame = requestAnimationFrame(tick);
    };

    captureRest();
    const recapture = () => onResize();
    root.querySelectorAll("img").forEach((img) => {
      if (!img.complete) img.addEventListener("load", recapture, { once: true });
    });
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("resize", onResize, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("resize", onResize);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);
}
