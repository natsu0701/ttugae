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

function paintTrail(ctx: CanvasRenderingContext2D, points: Point[]) {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
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

type YarnStitchTrailProps = {
  disabled?: boolean;
};

function YarnStitchTrail({ disabled = false }: YarnStitchTrailProps) {
  const [pointerOk, setPointerOk] = useState(canDrawYarnTrail);
  const [prefEnabled, setPrefEnabled] = useState(loadYarnTrailEnabled);

  const pointsRef = useRef<Point[]>([]);
  const cursorRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const rafIdRef = useRef<number | null>(null);
  const lastRecordRef = useRef(0);
  const lastSizeRef = useRef({ w: 0, h: 0 });
  const drawingRef = useRef(false);
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
      paintTrail(ctx, validPoints);
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
      startLoop();
    };

    const handleMouseLeave = () => {
      pointsRef.current = [];
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      stopLoop();
    };

    syncSize();
    window.addEventListener("pointermove", handleMouseMove, { passive: true });
    window.addEventListener("resize", syncSize);
    document.documentElement.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      window.removeEventListener("pointermove", handleMouseMove);
      window.removeEventListener("resize", syncSize);
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
      className="pointer-events-none fixed inset-0 z-[9998] h-[100dvh] w-screen overflow-hidden yarn-trail-layer"
      aria-hidden
    >
      <canvas
        ref={canvasRef}
        className="yarn-trail-svg pointer-events-none h-full w-full"
        style={{ mixBlendMode: "normal" }}
        aria-hidden
      />

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
