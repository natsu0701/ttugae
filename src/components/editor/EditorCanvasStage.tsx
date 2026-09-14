import { memo, useCallback, useEffect, useRef, useState, type PointerEvent, type ReactNode } from "react";
import CanvasToolDock from "./CanvasToolDock.tsx";

const MIN_ZOOM = 0.4;
const MAX_ZOOM = 3;
const WHEEL_STEP = 0.1;
const DOCK_STEP = 0.15;

type DockProps = {
  tool: "paint" | "eraser" | "checker" | "select" | "pan";
  onToolChange: (tool: "paint" | "eraser" | "checker" | "select" | "pan") => void;
  showFillSelection: boolean;
  onFillSelection: () => void;
  hint: string;
  hintOpen: boolean;
  onDismissHint: () => void;
};

type EditorCanvasStageProps = {
  children: ReactNode;
  panEnabled: boolean;
  dock: DockProps;
};

function EditorCanvasStage({ children, panEnabled, dock }: EditorCanvasStageProps) {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const panDrag = useRef<{ x: number; y: number; panX: number; panY: number } | null>(null);
  const stageRef = useRef<HTMLDivElement>(null);

  const onZoomIn = useCallback(() => {
    setZoom((z) => Math.min(MAX_ZOOM, Number((z + DOCK_STEP).toFixed(2))));
  }, []);

  const onZoomOut = useCallback(() => {
    setZoom((z) => Math.max(MIN_ZOOM, Number((z - DOCK_STEP).toFixed(2))));
  }, []);

  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -WHEEL_STEP : WHEEL_STEP;
      setZoom((z) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, Number((z + delta).toFixed(2)))));
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  const onPanPointerDown = useCallback((e: PointerEvent<HTMLDivElement>) => {
    if (!panEnabled) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    setIsPanning(true);
    panDrag.current = { x: e.clientX, y: e.clientY, panX: pan.x, panY: pan.y };
  }, [panEnabled, pan.x, pan.y]);

  const onPanPointerMove = useCallback((e: PointerEvent<HTMLDivElement>) => {
    const drag = panDrag.current;
    if (!drag) return;
    setPan({
      x: drag.panX + (e.clientX - drag.x),
      y: drag.panY + (e.clientY - drag.y),
    });
  }, []);

  const onPanPointerUp = useCallback(() => {
    panDrag.current = null;
    setIsPanning(false);
  }, []);

  return (
    <>
      <div
        ref={stageRef}
        className={`flex min-h-0 flex-1 items-center justify-center overflow-hidden p-4 md:p-8 ${
          panEnabled ? (isPanning ? "cursor-grabbing" : "cursor-grab") : ""
        }`}
        onPointerDown={onPanPointerDown}
        onPointerMove={onPanPointerMove}
        onPointerUp={onPanPointerUp}
        onPointerCancel={onPanPointerUp}
      >
        <div
          className="flex h-full w-full items-center justify-center will-change-transform"
          style={{
            transform: `translate3d(${pan.x}px, ${pan.y}px, 0) scale(${zoom})`,
            transformOrigin: "center center",
            backfaceVisibility: "hidden",
          }}
        >
          {children}
        </div>
      </div>
      <CanvasToolDock
        {...dock}
        zoom={zoom}
        onZoomIn={onZoomIn}
        onZoomOut={onZoomOut}
      />
    </>
  );
}

export default memo(EditorCanvasStage);
