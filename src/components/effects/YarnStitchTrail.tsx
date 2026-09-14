import { memo, useEffect, useRef, useState } from "react";
import {
  loadYarnTrailEnabled,
  subscribeYarnTrail,
} from "../../utils/yarnTrailStorage.ts";

type Point = {
  x: number;
  y: number;
  time: number;
};

const MAX_POINTS = 24;
const POINT_LIFETIME = 600;
const RECORD_THROTTLE_MS = 24;
const BASE_COLOR = "#FC5F53";
const HALO_COLOR = "#FF8A9B";
const MAX_OPACITY = 0.45;
const POINTER_QUERY = "(hover: hover), (any-hover: hover), (pointer: fine), (any-pointer: fine)";

export const CURSOR_HOTSPOT = { x: 21, y: 5 } as const;

function canDrawYarnTrail(): boolean {
  if (typeof window === "undefined") return false;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
  return window.matchMedia(POINTER_QUERY).matches;
}

type YarnStitchTrailProps = {
  disabled?: boolean;
};

function YarnStitchTrail({ disabled = false }: YarnStitchTrailProps) {
  const [pointerOk, setPointerOk] = useState(canDrawYarnTrail);
  const [prefEnabled, setPrefEnabled] = useState(loadYarnTrailEnabled);

  const pointsRef = useRef<Point[]>([]);
  const cursorRef = useRef<HTMLDivElement>(null);
  const segmentsRef = useRef<SVGGElement>(null);
  const rafIdRef = useRef<number | null>(null);
  const lastRecordRef = useRef(0);
  const lastMarkupRef = useRef("");
  const inactive = disabled || !prefEnabled || !pointerOk;

  useEffect(() => subscribeYarnTrail(setPrefEnabled), []);

  useEffect(() => {
    const media = window.matchMedia(POINTER_QUERY);
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setPointerOk(canDrawYarnTrail());
    media.addEventListener("change", sync);
    reduced.addEventListener("change", sync);
    window.addEventListener("pointermove", sync, { once: true, passive: true });
    sync();
    return () => {
      media.removeEventListener("change", sync);
      reduced.removeEventListener("change", sync);
    };
  }, []);

  useEffect(() => {
    if (inactive) {
      pointsRef.current = [];
      lastMarkupRef.current = "";
      if (segmentsRef.current) segmentsRef.current.replaceChildren();
      document.body.classList.remove("yarn-trail-active");
      return;
    }

    document.body.classList.add("yarn-trail-active");

    const handleMouseMove = (e: PointerEvent | MouseEvent) => {
      if ("pointerType" in e && e.pointerType === "touch") return;
      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(${e.clientX - CURSOR_HOTSPOT.x}px, ${e.clientY - CURSOR_HOTSPOT.y}px, 0)`;
      }

      const now = Date.now();
      if (now - lastRecordRef.current < RECORD_THROTTLE_MS) return;
      lastRecordRef.current = now;

      pointsRef.current = [
        ...pointsRef.current,
        { x: e.clientX, y: e.clientY, time: now },
      ].slice(-MAX_POINTS);
    };

    const handleMouseLeave = () => {
      pointsRef.current = [];
    };

    const updateTrail = () => {
      const now = Date.now();
      const validPoints = pointsRef.current.filter((p) => now - p.time < POINT_LIFETIME);
      pointsRef.current = validPoints;

      const g = segmentsRef.current;
      if (g) {
        let markup = "";
        for (let index = 1; index < validPoints.length; index += 1) {
          const point = validPoints[index];
          const prevPoint = validPoints[index - 1];
          const ratio = index / validPoints.length;
          const opacity = Math.max(0, ratio * MAX_OPACITY);
          const strokeWidth = 1.2 + ratio * 4.0;
          markup += `<g><line class="yarn-segment" x1="${prevPoint.x}" y1="${prevPoint.y}" x2="${point.x}" y2="${point.y}" stroke="${BASE_COLOR}" stroke-width="${strokeWidth}" opacity="${opacity}" /><line class="yarn-segment" x1="${prevPoint.x}" y1="${prevPoint.y}" x2="${point.x}" y2="${point.y}" stroke="${HALO_COLOR}" stroke-width="${strokeWidth * 1.4}" opacity="${opacity * 0.4}" /></g>`;
        }
        if (markup !== lastMarkupRef.current) {
          lastMarkupRef.current = markup;
          g.innerHTML = markup;
        }
      }

      rafIdRef.current = requestAnimationFrame(updateTrail);
    };

    window.addEventListener("pointermove", handleMouseMove, { passive: true });
    document.documentElement.addEventListener("mouseleave", handleMouseLeave);
    rafIdRef.current = requestAnimationFrame(updateTrail);

    return () => {
      window.removeEventListener("pointermove", handleMouseMove);
      document.documentElement.removeEventListener("mouseleave", handleMouseLeave);
      if (rafIdRef.current != null) cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
      document.body.classList.remove("yarn-trail-active");
      pointsRef.current = [];
      lastMarkupRef.current = "";
      if (segmentsRef.current) segmentsRef.current.replaceChildren();
    };
  }, [inactive]);

  if (inactive) {
    return null;
  }

  return (
    <div
      className="pointer-events-none fixed inset-0 z-[9998] h-[100dvh] w-screen overflow-hidden yarn-trail-layer"
      aria-hidden
    >
      <svg
        className="yarn-trail-svg pointer-events-none h-full w-full"
        style={{ mixBlendMode: "normal" }}
        aria-hidden
      >
        <g
          ref={segmentsRef}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      <div
        ref={cursorRef}
        className="yarn-cursor pointer-events-none fixed left-0 top-0 z-[9999] transform-gpu will-change-transform"
        aria-hidden
      >
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
          <circle cx="7" cy="22" r="5.5" fill="#FC5F53" />
          <circle cx="7" cy="22" r="3.5" fill="#FFB3B3" opacity="0.65" />
          <path d="M10 19 L21 5" stroke="#FC5F53" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="21" cy="5" r="2" fill="#FFB3B3" />
          <path d="M20 4 L23 2" stroke="#E8E8E8" strokeWidth="1.2" strokeLinecap="round" opacity="0.7" />
        </svg>
      </div>
    </div>
  );
}

export default memo(YarnStitchTrail);
