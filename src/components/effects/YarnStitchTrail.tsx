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

const MAX_POINTS = 32;
const POINT_LIFETIME = 960;
const RECORD_THROTTLE_MS = 16;
const MIN_POINT_DIST = 3;
const SMOOTHING = 0.62;
const HEAD_ALPHA = 0.8;
const YARN_BODY = "#FC5F53";
const YARN_EDGE = "#C4453C";
const YARN_HIGHLIGHT = "#FFE6D8";

/** 커스텀 커서 핫스팟 = 바늘 끝(궤적 시작점) */
export const CURSOR_HOTSPOT = { x: 28, y: 8 } as const;

function segmentFade(now: number, a: Point, b: Point): number {
  const age = now - (a.time + b.time) / 2;
  return Math.max(0, 1 - age / POINT_LIFETIME);
}

function paintTrail(ctx: CanvasRenderingContext2D, points: Point[], now: number) {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  if (points.length < 2) return;

  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.strokeStyle = YARN_BODY;
  ctx.lineWidth = 8.5;
  ctx.globalCompositeOperation = "destination-over";

  for (let index = points.length - 2; index >= 0; index -= 1) {
    const p0 = points[Math.max(0, index - 1)];
    const p1 = points[index];
    const p2 = points[index + 1];
    const p3 = points[Math.min(points.length - 1, index + 2)];
    ctx.globalAlpha = HEAD_ALPHA * segmentFade(now, p1, p2);
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    if (points.length === 2) {
      ctx.lineTo(p2.x, p2.y);
    } else {
      ctx.bezierCurveTo(
        p1.x + (p2.x - p0.x) / 5,
        p1.y + (p2.y - p0.y) / 5,
        p2.x - (p3.x - p1.x) / 5,
        p2.y - (p3.y - p1.y) / 5,
        p2.x,
        p2.y,
      );
    }
    ctx.stroke();
  }

  ctx.globalCompositeOperation = "source-over";
  ctx.globalAlpha = 1;
}

type YarnStitchTrailProps = {
  disabled?: boolean;
};

function YarnStitchTrail({ disabled = false }: YarnStitchTrailProps) {
  const [prefEnabled, setPrefEnabled] = useState(loadYarnTrailEnabled);

  const pointsRef = useRef<Point[]>([]);
  const cursorRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const rafIdRef = useRef<number | null>(null);
  const lastRecordRef = useRef(0);
  const lastSizeRef = useRef({ w: 0, h: 0 });
  const drawingRef = useRef(false);
  const inactive = disabled || !prefEnabled;

  useEffect(() => subscribeYarnTrail(setPrefEnabled), []);

  useEffect(() => {
    if (inactive) {
      pointsRef.current = [];
      drawingRef.current = false;
      if (rafIdRef.current != null) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
      const ctx = ctxRef.current;
      if (ctx) ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      document.body.classList.remove("yarn-trail-active");
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;
    ctxRef.current = ctx;

    document.body.classList.add("yarn-trail-active");

    const syncSize = () => {
      const nextW = window.innerWidth;
      const nextH = window.innerHeight;
      if (lastSizeRef.current.w === nextW && lastSizeRef.current.h === nextH) return;
      lastSizeRef.current = { w: nextW, h: nextH };
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(nextW * dpr);
      canvas.height = Math.floor(nextH * dpr);
      canvas.style.width = `${nextW}px`;
      canvas.style.height = `${nextH}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const stopLoop = () => {
      if (rafIdRef.current != null) cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
      drawingRef.current = false;
    };

    const updateTrail = () => {
      const now = Date.now();
      const validPoints = pointsRef.current.filter((p) => now - p.time < POINT_LIFETIME);
      pointsRef.current = validPoints;
      paintTrail(ctx, validPoints, now);
      if (validPoints.length === 0) {
        stopLoop();
        return;
      }
      rafIdRef.current = requestAnimationFrame(updateTrail);
    };

    const startLoop = () => {
      if (drawingRef.current) return;
      drawingRef.current = true;
      rafIdRef.current = requestAnimationFrame(updateTrail);
    };

    const handleMove = (e: PointerEvent | MouseEvent) => {
      if ("pointerType" in e && e.pointerType === "touch") return;
      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(${e.clientX - CURSOR_HOTSPOT.x}px, ${e.clientY - CURSOR_HOTSPOT.y}px, 0)`;
      }

      const now = Date.now();
      if (now - lastRecordRef.current < RECORD_THROTTLE_MS) return;

      const prev = pointsRef.current[pointsRef.current.length - 1];
      const x = prev ? prev.x + (e.clientX - prev.x) * SMOOTHING : e.clientX;
      const y = prev ? prev.y + (e.clientY - prev.y) * SMOOTHING : e.clientY;
      if (prev && Math.hypot(x - prev.x, y - prev.y) < MIN_POINT_DIST) return;

      lastRecordRef.current = now;
      pointsRef.current = [...pointsRef.current, { x, y, time: now }].slice(-MAX_POINTS);
      startLoop();
    };

    const handleLeave = () => {
      pointsRef.current = [];
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      stopLoop();
    };

    syncSize();
    window.addEventListener("pointermove", handleMove, { passive: true });
    window.addEventListener("mousemove", handleMove, { passive: true });
    window.addEventListener("resize", syncSize);
    document.documentElement.addEventListener("mouseleave", handleLeave);

    return () => {
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("resize", syncSize);
      document.documentElement.removeEventListener("mouseleave", handleLeave);
      stopLoop();
      document.body.classList.remove("yarn-trail-active");
      pointsRef.current = [];
    };
  }, [inactive]);

  if (inactive) {
    return null;
  }

  return (
    <div
      className="yarn-trail-layer pointer-events-none fixed inset-0 z-[9998] h-[100dvh] w-screen overflow-hidden"
      aria-hidden
    >
      <canvas ref={canvasRef} className="yarn-trail-svg pointer-events-none h-full w-full" aria-hidden />

      <div
        ref={cursorRef}
        className="yarn-cursor pointer-events-none fixed left-0 top-0 z-[9999] transform-gpu will-change-transform"
        aria-hidden
      >
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
          <defs>
            <filter id="yarn-ball-fuzz" x="-45%" y="-45%" width="190%" height="190%">
              <feGaussianBlur stdDeviation="1.05" />
            </filter>
          </defs>
          <circle cx="12" cy="28" r="10" fill={YARN_BODY} opacity="0.45" filter="url(#yarn-ball-fuzz)" />
          <circle cx="12" cy="28" r="9" fill={YARN_EDGE} />
          <circle cx="12" cy="28" r="7.4" fill={YARN_BODY} />
          <path
            d="M7.2 25.2c2.4-1.6 6.6-1.4 8.6.6M6.8 28.6c2.8.2 6.2-.2 8.2-1.8M8.4 31.6c2.2 1.2 5.8 1 8 -0.6"
            stroke={YARN_HIGHLIGHT}
            strokeWidth="1.4"
            strokeLinecap="round"
            opacity="0.85"
          />
          <path d="M16.6 22.4 L30.5 6.2" stroke={YARN_EDGE} strokeWidth="3.4" strokeLinecap="round" />
          <path d="M16.6 22.4 L30.5 6.2" stroke={YARN_BODY} strokeWidth="2.2" strokeLinecap="round" />
          <circle cx="30.5" cy="6.2" r="2.4" fill={YARN_HIGHLIGHT} />
          <path d="M29.4 5.2 L33.2 2.4" stroke="#F7F5F0" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
      </div>
    </div>
  );
}

export default memo(YarnStitchTrail);
