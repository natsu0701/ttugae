import { useEffect, useRef, useState } from "react";

type Point = {
  x: number;
  y: number;
  timestamp: number;
};

/** 좌표 수명 — 지나면 꼬리부터 사르르 잘려나감 */
const TRAIL_LIFESPAN_MS = 950;
const MAX_POINTS_DEFAULT = 48;
const MAX_POINTS_LOW_SPEC = 24;

/**
 * 마이크로 파이버 5겹 레이어 사양
 * - halo 2겹: 바깥 보풀 글로우
 * - body: 뽀송한 매트 본체
 * - fiber dark/light: 초단 대시 꼬임 질감
 */
const YARN_LAYERS = [
  { id: "halo-outer", color: "#FC5F53", width: 26, opacity: 0.03 },
  { id: "halo-mid", color: "#FC5F53", width: 20, opacity: 0.08 },
  { id: "body", color: "#FC5F53", width: 14, opacity: 0.95 },
  { id: "fiber-dark", color: "#D94B40", width: 14, opacity: 0.35, dasharray: "1 4" },
  { id: "fiber-light", color: "#FFE3E1", width: 14, opacity: 0.4, dasharray: "2 6" },
] as const;

/** 커스텀 커서 핫스팟 = 바늘 끝(궤적 시작점) */
export const CURSOR_HOTSPOT = { x: 21, y: 5 } as const;

/** 터치(비세밀 포인터) 기기 — 트레일을 아예 마운트하지 않음 */
function detectTouchDevice(): boolean {
  return (
    window.matchMedia("(pointer: coarse)").matches ||
    !window.matchMedia("(pointer: fine)").matches
  );
}

/** 저사양 기기 — 추적 좌표 수를 절반으로 스로틀링 */
function detectLowSpecDevice(): boolean {
  const nav = navigator as Navigator & { deviceMemory?: number };
  return (nav.hardwareConcurrency ?? 8) <= 4 || (nav.deviceMemory ?? 8) <= 4;
}

/** 이웃 중점 Quadratic 보간 — 각진 폴리라인 없이 부드러운 털실 곡선 */
function buildSmoothPath(points: Point[]): string {
  if (points.length === 0) return "";
  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    const xc = (points[i].x + points[i - 1].x) / 2;
    const yc = (points[i].y + points[i - 1].y) / 2;
    d += ` Q ${points[i - 1].x} ${points[i - 1].y}, ${xc} ${yc}`;
  }
  return d;
}

type YarnStitchTrailProps = {
  disabled?: boolean;
};

export default function YarnStitchTrail({ disabled = false }: YarnStitchTrailProps) {
  const [isTouchDevice] = useState(detectTouchDevice);
  const [maxPoints] = useState(() =>
    detectLowSpecDevice() ? MAX_POINTS_LOW_SPEC : MAX_POINTS_DEFAULT,
  );

  // React State 대신 ref만 사용 — 마우스 이동 중 리렌더 0회
  const pointsRef = useRef<Point[]>([]);
  const layerRefs = useRef<(SVGPathElement | null)[]>(
    Array<SVGPathElement | null>(YARN_LAYERS.length).fill(null),
  );
  const lastPathRef = useRef("");
  const cursorRef = useRef<HTMLDivElement>(null);
  const rafIdRef = useRef<number | null>(null);

  useEffect(() => {
    if (disabled || isTouchDevice) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion) return;

    document.body.classList.add("yarn-trail-active");

    const handleMouseMove = (e: MouseEvent) => {
      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(${e.clientX - CURSOR_HOTSPOT.x}px, ${e.clientY - CURSOR_HOTSPOT.y}px, 0)`;
      }

      pointsRef.current.push({
        x: e.clientX,
        y: e.clientY,
        timestamp: Date.now(),
      });
      if (pointsRef.current.length > maxPoints) {
        pointsRef.current.shift();
      }
    };

    const handleMouseLeave = () => {
      pointsRef.current = [];
    };

    // 🟢 React를 깨우지 않고 5개 <path>의 d 속성만 직접 주입하는 고성능 드로잉 루프
    const drawTrail = () => {
      const now = Date.now();
      pointsRef.current = pointsRef.current.filter(
        (p) => now - p.timestamp < TRAIL_LIFESPAN_MS,
      );

      const d = buildSmoothPath(pointsRef.current);
      if (d !== lastPathRef.current) {
        lastPathRef.current = d;
        for (const el of layerRefs.current) {
          el?.setAttribute("d", d);
        }
      }

      rafIdRef.current = requestAnimationFrame(drawTrail);
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    document.documentElement.addEventListener("mouseleave", handleMouseLeave);
    rafIdRef.current = requestAnimationFrame(drawTrail);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      document.documentElement.removeEventListener("mouseleave", handleMouseLeave);
      if (rafIdRef.current != null) cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
      document.body.classList.remove("yarn-trail-active");

      pointsRef.current = [];
      lastPathRef.current = "";
      for (const el of layerRefs.current) {
        el?.setAttribute("d", "");
      }
    };
  }, [disabled, isTouchDevice, maxPoints]);

  // 터치/모바일 기기: 리스너·rAF 루프·DOM 자체를 등록하지 않음
  if (disabled || isTouchDevice) {
    return null;
  }

  return (
    <div className="pointer-events-none fixed inset-0 z-[9998]" aria-hidden>
      {/* transform-gpu + will-change로 GPU 합성 레이어 생성, 매트한 블렌딩 고정 */}
      <svg
        className="yarn-trail-svg pointer-events-none h-full w-full transform-gpu will-change-transform"
        style={{ mixBlendMode: "normal" }}
        aria-hidden
      >
        {YARN_LAYERS.map((layer, i) => (
          <path
            key={layer.id}
            ref={(el) => {
              layerRefs.current[i] = el;
            }}
            className={`yarn-${layer.id}`}
            fill="none"
            stroke={layer.color}
            strokeWidth={layer.width}
            opacity={layer.opacity}
            strokeDasharray={"dasharray" in layer ? layer.dasharray : undefined}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
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
