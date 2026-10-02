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

export const CURSOR_HOTSPOT = { x: 21, y: 5 } as const;

function canDrawYarnTrail(): boolean {
  if (typeof window === "undefined") return false;
  return !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function readCssSize(canvas: HTMLCanvasElement): { w: number; h: number } {
  return {
    w: canvas.clientWidth || window.innerWidth,
    h: canvas.clientHeight || window.innerHeight,
  };
}

function paintTrail(ctx: CanvasRenderingContext2D, points: Point[], cssW: number, cssH: number) {
  ctx.clearRect(0, 0, cssW, cssH);
  if (points.length < 2) return;

  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  for (let index = 1; index < points.length; index += 1) {
    const point = points[index];
    const prevPoint = points[index - 1];
    const ratio = index / points.length;
    const opacity = Math.max(0, ratio * MAX_OPACITY);
    const strokeWidth = 1.2 + ratio * 4.0;

    ctx.strokeStyle = HALO_COLOR;
    ctx.globalAlpha = opacity * 0.4;
    ctx.lineWidth = strokeWidth * 1.4;
    ctx.beginPath();
    ctx.moveTo(prevPoint.x, prevPoint.y);
    ctx.lineTo(point.x, point.y);
    ctx.stroke();

    ctx.strokeStyle = BASE_COLOR;
    ctx.globalAlpha = opacity;
    ctx.lineWidth = strokeWidth;
    ctx.beginPath();
    ctx.moveTo(prevPoint.x, prevPoint.y);
    ctx.lineTo(point.x, point.y);
    ctx.stroke();
  }

  ctx.globalAlpha = 1;
}

function eventPoint(e: Event): { x: number; y: number } | null {
  if (e instanceof TouchEvent) {
    const touch = e.touches[0] || e.changedTouches[0];
    if (touch) return { x: touch.clientX, y: touch.clientY };
    return null;
  }
  if (e instanceof PointerEvent || e instanceof MouseEvent) {
    return { x: e.clientX, y: e.clientY };
  }
  return null;
}

type YarnStitchTrailProps = {
  disabled?: boolean;
};

function YarnStitchTrail({ disabled = false }: YarnStitchTrailProps) {
  const [motionOk, setMotionOk] = useState(canDrawYarnTrail);
  const [prefEnabled, setPrefEnabled] = useState(loadYarnTrailEnabled);

  const pointsRef = useRef<Point[]>([]);
  const cursorRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const rafIdRef = useRef<number | null>(null);
  const lastRecordRef = useRef(0);
  const lastPointRef = useRef({ x: Number.NaN, y: Number.NaN });
  const lastSizeRef = useRef({ w: 0, h: 0, dpr: 0 });
  const drawingRef = useRef(false);
  const inactive = disabled || !prefEnabled || !motionOk;

  useEffect(() => subscribeYarnTrail(setPrefEnabled), []);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setMotionOk(canDrawYarnTrail());
    reduced.addEventListener("change", sync);
    sync();
    return () => reduced.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (inactive) {
      pointsRef.current = [];
      drawingRef.current = false;
      if (rafIdRef.current != null) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
      const ctx = ctxRef.current;
      const canvas = canvasRef.current;
      if (ctx && canvas) {
        const size = readCssSize(canvas);
        ctx.clearRect(0, 0, size.w, size.h);
      }
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
      const dpr = Math.max(1, window.devicePixelRatio || 1);
      if (
        lastSizeRef.current.w === nextW &&
        lastSizeRef.current.h === nextH &&
        lastSizeRef.current.dpr === dpr
      ) {
        return;
      }
      lastSizeRef.current = { w: nextW, h: nextH, dpr };
      canvas.width = Math.max(1, Math.floor(nextW * dpr));
      canvas.height = Math.max(1, Math.floor(nextH * dpr));
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
      const size = lastSizeRef.current;
      paintTrail(ctx, validPoints, size.w, size.h);
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

    const handleMove = (e: Event) => {
      const point = eventPoint(e);
      if (!point) return;

      const finePointer = window.matchMedia("(pointer: fine)").matches;
      if (finePointer && cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(${point.x - CURSOR_HOTSPOT.x}px, ${point.y - CURSOR_HOTSPOT.y}px, 0)`;
        cursorRef.current.style.opacity = "1";
      } else if (cursorRef.current) {
        cursorRef.current.style.opacity = "0";
      }

      const now = Date.now();
      const lastPoint = lastPointRef.current;
      const sameSpot =
        Number.isFinite(lastPoint.x) &&
        Math.abs(lastPoint.x - point.x) < 0.5 &&
        Math.abs(lastPoint.y - point.y) < 0.5;
      if (sameSpot && now - lastRecordRef.current < RECORD_THROTTLE_MS) return;
      if (now - lastRecordRef.current < RECORD_THROTTLE_MS) return;
      lastRecordRef.current = now;
      lastPointRef.current = point;

      pointsRef.current = [
        ...pointsRef.current,
        { x: point.x, y: point.y, time: now },
      ].slice(-MAX_POINTS);
      startLoop();
    };

    const handleMouseLeave = (e: MouseEvent) => {
      if (e.relatedTarget) return;
      pointsRef.current = [];
      const size = lastSizeRef.current;
      ctx.clearRect(0, 0, size.w, size.h);
      stopLoop();
    };

    syncSize();
    window.addEventListener("pointermove", handleMove, { passive: true });
    window.addEventListener("mousemove", handleMove, { passive: true });
    window.addEventListener("touchmove", handleMove, { passive: true });
    window.addEventListener("resize", syncSize);
    window.addEventListener("orientationchange", syncSize);
    window.visualViewport?.addEventListener("resize", syncSize);
    document.documentElement.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("touchmove", handleMove);
      window.removeEventListener("resize", syncSize);
      window.removeEventListener("orientationchange", syncSize);
      window.visualViewport?.removeEventListener("resize", syncSize);
      document.documentElement.removeEventListener("mouseleave", handleMouseLeave);
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
      className="pointer-events-none fixed inset-0 z-50 h-[100dvh] w-screen overflow-hidden yarn-trail-layer"
      aria-hidden
    >
      <canvas
        ref={canvasRef}
        className="yarn-trail-svg pointer-events-none fixed inset-0 z-50 h-full w-full"
        style={{ mixBlendMode: "normal", pointerEvents: "none" }}
        aria-hidden
      />

      <div
        ref={cursorRef}
        className="yarn-cursor pointer-events-none fixed left-0 top-0 z-50 transform-gpu will-change-transform opacity-0"
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
