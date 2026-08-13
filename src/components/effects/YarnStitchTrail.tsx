import { useEffect, useRef, useState } from "react";
import {
  buildTimeFadeSegments,
  fadeWidthScale,
  pruneExpiredPoints,
  YARN_TRAIL,
  type TrailPoint,
  type TrailSegment,
} from "../../utils/yarnTrailPath.ts";

const MIN_POINT_DISTANCE = 5;
const MAX_POINTS_DEFAULT = 64;
const MAX_POINTS_LOW_SPEC = 24;
const SEGMENT_COUNT = 6;

/** 터치(비세밀 포인터) 기기 — 트레일을 아예 마운트하지 않음 */
function detectTouchDevice(): boolean {
  return (
    window.matchMedia("(pointer: coarse)").matches ||
    !window.matchMedia("(pointer: fine)").matches
  );
}

/** 저사양 기기 — 추적 좌표 수를 절반 이하로 스로틀링 */
function detectLowSpecDevice(): boolean {
  const nav = navigator as Navigator & { deviceMemory?: number };
  return (nav.hardwareConcurrency ?? 8) <= 4 || (nav.deviceMemory ?? 8) <= 4;
}
const { lifespanMs, layers: YARN_LAYERS } = YARN_TRAIL;

const SEGMENT_INDICES = Array.from({ length: SEGMENT_COUNT }, (_, i) => i);

/** 커스텀 커서 핫스팟 = 바늘 끝(궤적 시작점) */
export const CURSOR_HOTSPOT = { x: 21, y: 5 } as const;

type YarnStitchTrailProps = {
  disabled?: boolean;
};

/**
 * 세그먼트(6) × 레이어(5) = 30개의 고정 <path>에 setAttribute로 d/굵기/투명도만
 * 직접 주입한다. React 상태·VDOM 리렌더·innerHTML 파싱을 전혀 거치지 않으므로
 * mousemove/rAF 루프가 브라우저 페인트 외의 비용을 만들지 않는다.
 */
function applySegmentsToDom(
  refs: (SVGPathElement | null)[][],
  segments: TrailSegment[],
) {
  for (let si = 0; si < refs.length; si++) {
    const seg = si < segments.length ? segments[si] : null;
    const layerEls = refs[si];

    for (let li = 0; li < layerEls.length; li++) {
      const el = layerEls[li];
      if (!el) continue;

      if (!seg) {
        // 이미 비워진 path는 건드리지 않음 (불필요한 스타일 무효화 방지)
        if (el.getAttribute("d")) {
          el.setAttribute("d", "");
          el.setAttribute("stroke-opacity", "0");
        }
        continue;
      }

      const layer = YARN_LAYERS[li];
      const widthScale = fadeWidthScale(seg.opacity);
      el.setAttribute("d", seg.d);
      el.setAttribute("stroke-width", (layer.width * widthScale).toFixed(2));
      el.setAttribute(
        "stroke-opacity",
        (layer.opacity * seg.opacity).toFixed(3),
      );
    }
  }
}

export default function YarnStitchTrail({ disabled = false }: YarnStitchTrailProps) {
  const [isTouchDevice] = useState(detectTouchDevice);
  const [maxPoints] = useState(() =>
    detectLowSpecDevice() ? MAX_POINTS_LOW_SPEC : MAX_POINTS_DEFAULT,
  );
  const pointsRef = useRef<TrailPoint[]>([]);
  const lastSampleRef = useRef({ x: -200, y: -200 });
  /** 세그먼트 × 레이어 <path> 엘리먼트 — 마운트 시 1회 생성 후 속성만 갱신 */
  const segmentPathRefs = useRef<(SVGPathElement | null)[][]>(
    Array.from({ length: SEGMENT_COUNT }, () =>
      Array<SVGPathElement | null>(YARN_LAYERS.length).fill(null),
    ),
  );
  const cursorRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef(0);
  const isRunningRef = useRef(false);

  useEffect(() => {
    if (disabled || isTouchDevice) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion) return;

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

        while (pts.length > maxPoints) pts.shift();
      }
    };

    const onLeave = () => {
      pointsRef.current = [];
      applySegmentsToDom(segmentPathRefs.current, []);
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
        applySegmentsToDom(segmentPathRefs.current, segments);
      } else {
        applySegmentsToDom(segmentPathRefs.current, []);
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
      applySegmentsToDom(segmentPathRefs.current, []);
    };
  }, [disabled, isTouchDevice, maxPoints]);

  // 터치/모바일 기기: 리스너·rAF 루프·DOM 자체를 등록하지 않음
  if (disabled || isTouchDevice) {
    return null;
  }

  return (
    <div className="pointer-events-none fixed inset-0 z-[9998]" aria-hidden>
      <svg
        className="yarn-trail-svg transform-gpu will-change-transform pointer-events-none h-full w-full"
        aria-hidden
      >
        {/* 5중 마이크로 파이버 레이어 × 페이드 세그먼트 — 정적 생성, 속성만 rAF에서 주입 */}
        {SEGMENT_INDICES.map((si) => (
          <g key={si} className="yarn-segment" style={{ mixBlendMode: "normal" }}>
            {YARN_LAYERS.map((layer, li) => (
              <path
                key={layer.id}
                className={`yarn-${layer.id}`}
                d=""
                fill="none"
                stroke={layer.color}
                strokeOpacity={0}
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray={"dasharray" in layer ? layer.dasharray : undefined}
                strokeDashoffset={"dashoffset" in layer ? layer.dashoffset : undefined}
                ref={(el) => {
                  segmentPathRefs.current[si][li] = el;
                }}
              />
            ))}
          </g>
        ))}
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
