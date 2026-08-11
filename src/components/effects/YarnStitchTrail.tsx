import { useEffect, useRef } from "react";
import {
  buildTimeFadeSegments,
  fadeWidthScale,
  pruneExpiredPoints,
  YARN_TRAIL,
  type TrailPoint,
  type TrailSegment,
} from "../../utils/yarnTrailPath.ts";

const MIN_POINT_DISTANCE = 5;
const MAX_POINTS = 64;
const SEGMENT_COUNT = 6;
const { lifespanMs, layers: YARN_LAYERS } = YARN_TRAIL;

const PATH_CAPS = `stroke-linecap="round" stroke-linejoin="round"`;

type YarnLayerDef = (typeof YARN_LAYERS)[number];

function layerPathMarkup(
  seg: TrailSegment,
  layer: YarnLayerDef,
  widthScale: number,
  opacityScale: number,
): string {
  const dash =
    "dasharray" in layer
      ? `stroke-dasharray="${layer.dasharray}"${
          "dashoffset" in layer ? ` stroke-dashoffset="${layer.dashoffset}"` : ""
        }`
      : "";

  return `<path
        class="yarn-${layer.id}"
        d="${seg.d}"
        fill="none"
        stroke="${layer.color}"
        stroke-width="${(layer.width * widthScale).toFixed(2)}"
        stroke-opacity="${(layer.opacity * opacityScale).toFixed(3)}"
        ${dash}
        ${PATH_CAPS}
      />`;
}

/** 커스텀 커서 핫스팟 = 바늘 끝(궤적 시작점) */
export const CURSOR_HOTSPOT = { x: 21, y: 5 } as const;

type YarnStitchTrailProps = {
  disabled?: boolean;
};

function renderSegmentPaths(
  container: SVGGElement | null,
  segments: TrailSegment[],
) {
  if (!container) return;

  if (segments.length === 0) {
    container.innerHTML = "";
    return;
  }

  const html = segments
    .map((seg, i) => {
      const w = fadeWidthScale(seg.opacity);
      const layerPaths = YARN_LAYERS.map((layer) =>
        layerPathMarkup(seg, layer, w, seg.opacity),
      ).join("\n");

      return `
    <g class="yarn-segment" data-i="${i}" style="mix-blend-mode: normal">
      ${layerPaths}
    </g>`;
    })
    .join("");

  container.innerHTML = html;
}

export default function YarnStitchTrail({ disabled = false }: YarnStitchTrailProps) {
  const pointsRef = useRef<TrailPoint[]>([]);
  const lastSampleRef = useRef({ x: -200, y: -200 });
  const segmentsRef = useRef<SVGGElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef(0);
  const isRunningRef = useRef(false);

  useEffect(() => {
    if (disabled) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const finePointer = window.matchMedia("(pointer: fine)").matches;
    if (reducedMotion || !finePointer) return;

    document.body.classList.add("yarn-trail-active");
    isRunningRef.current = true;

    const updateCursor = (x: number, y: number) => {
      if (!cursorRef.current) return;
      cursorRef.current.style.transform = `translate3d(${x - CURSOR_HOTSPOT.x}px, ${y - CURSOR_HOTSPOT.y}px, 0)`;
    };

    const onMove = (e: MouseEvent) => {
      updateCursor(e.clientX, e.clientY);

      const pts = pointsRef.current;
      const last = lastSampleRef.current;
      const dist = Math.hypot(e.clientX - last.x, e.clientY - last.y);

      if (dist >= MIN_POINT_DISTANCE) {
        pts.push({ x: e.clientX, y: e.clientY, timestamp: Date.now() });
        lastSampleRef.current = { x: e.clientX, y: e.clientY };

        while (pts.length > MAX_POINTS) pts.shift();
      }
    };

    const onLeave = () => {
      pointsRef.current = [];
      renderSegmentPaths(segmentsRef.current, []);
    };

    const tick = () => {
      if (!isRunningRef.current) return;

      const now = Date.now();
      const pts = pointsRef.current;

      pruneExpiredPoints(pts, now, lifespanMs);

      if (pts.length >= 2) {
        const segments = buildTimeFadeSegments(
          pts,
          now,
          lifespanMs,
          SEGMENT_COUNT,
        );
        renderSegmentPaths(segmentsRef.current, segments);
      } else {
        renderSegmentPaths(segmentsRef.current, []);
      }

      animationRef.current = requestAnimationFrame(tick);
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    document.documentElement.addEventListener("mouseleave", onLeave);
    animationRef.current = requestAnimationFrame(tick);

    return () => {
      isRunningRef.current = false;
      cancelAnimationFrame(animationRef.current);
      animationRef.current = 0;

      window.removeEventListener("mousemove", onMove);
      document.documentElement.removeEventListener("mouseleave", onLeave);
      document.body.classList.remove("yarn-trail-active");

      pointsRef.current = [];
      renderSegmentPaths(segmentsRef.current, []);
    };
  }, [disabled]);

  if (disabled) {
    return null;
  }

  return (
    <div className="pointer-events-none fixed inset-0 z-[9998]" aria-hidden>
      <svg
        className="yarn-trail-svg pointer-events-none h-full w-full"
        aria-hidden
      >
        <g ref={segmentsRef} style={{ mixBlendMode: "normal" }} />
      </svg>

      <div
        ref={cursorRef}
        className="yarn-cursor pointer-events-none fixed left-0 top-0 z-[9999]"
        aria-hidden
      >
        <svg
          width="28"
          height="28"
          viewBox="0 0 28 28"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="7" cy="22" r="5.5" fill="#FC5F53" />
          <circle cx="7" cy="22" r="3.5" fill="#FFB3B3" opacity="0.65" />
          <path
            d="M10 19 L21 5"
            stroke="#FC5F53"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <circle cx="21" cy="5" r="2" fill="#FFB3B3" />
          <path
            d="M20 4 L23 2"
            stroke="#E8E8E8"
            strokeWidth="1.2"
            strokeLinecap="round"
            opacity="0.7"
          />
        </svg>
      </div>
    </div>
  );
}
