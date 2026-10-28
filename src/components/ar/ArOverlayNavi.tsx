import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { stitchSymbol } from "../../data/stitchSymbols.ts";
import { symbolColorForBackground } from "../../utils/colorContrast.ts";
import {
  buildStitchPath,
  loadStitchIndex,
  nextStitchIndex,
  persistStitchIndex,
} from "../../utils/arStitchGuide.ts";
import { EDITOR_COLOR_HEX, type EditorCell } from "../../utils/patternGrid.ts";
import BackButton from "../ui/BackButton.tsx";
import { CameraFillIcon } from "../icons/FillIcons.tsx";

export type ArOverlayNaviProps = {
  title: string;
  grid: EditorCell[][];
  colorMap?: Record<string, string>;
  patternId?: string;
  onExit: () => void;
};

type CameraStatus = "starting" | "live" | "blocked" | "missing" | "insecure" | "unsupported";

const DEFAULT_OPACITY = 0.55;

function cameraErrorStatus(error: unknown): CameraStatus {
  const name =
    error && typeof error === "object" && "name" in error
      ? String((error as { name?: string }).name)
      : "";
  if (name === "NotAllowedError" || name === "SecurityError") return "blocked";
  if (name === "NotFoundError" || name === "OverconstrainedError") return "missing";
  return "missing";
}

function paintPatternOverlay(
  canvas: HTMLCanvasElement,
  cells: EditorCell[][],
  colorMap: Record<string, string>,
) {
  const rows = cells.length;
  const cols = cells[0]?.length ?? 0;
  if (rows === 0 || cols === 0) return;

  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const cssW = Math.max(1, canvas.clientWidth);
  const cssH = Math.max(1, canvas.clientHeight);
  const pixelW = Math.round(cssW * dpr);
  const pixelH = Math.round(cssH * dpr);
  if (canvas.width !== pixelW) canvas.width = pixelW;
  if (canvas.height !== pixelH) canvas.height = pixelH;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, cssW, cssH);

  const cellW = cssW / cols;
  const cellH = cssH / rows;
  const line = cellW > 10 ? 1 : 0.5;
  const fontPx = Math.min(cellW * 0.62, cellH * 0.62, 14);

  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = `600 ${fontPx}px ui-sans-serif, system-ui, sans-serif`;

  for (let r = 0; r < rows; r += 1) {
    for (let c = 0; c < cols; c += 1) {
      const cell = cells[r][c];
      const x = c * cellW;
      const y = r * cellH;
      const empty = cell.stitchId === "empty";
      const bg = colorMap[cell.colorId] ?? "#FFFFFF";

      if (!empty) {
        ctx.globalAlpha = 0.92;
        ctx.fillStyle = bg;
        ctx.fillRect(x, y, cellW, cellH);
        ctx.globalAlpha = 1;
        const symbol = stitchSymbol(cell.stitchId);
        if (symbol && fontPx >= 5) {
          ctx.fillStyle = symbolColorForBackground(bg);
          ctx.fillText(symbol, x + cellW / 2, y + cellH / 2 + 0.2);
        }
      }

      ctx.strokeStyle = "rgba(255,255,255,0.38)";
      ctx.lineWidth = line;
      ctx.strokeRect(x + line / 2, y + line / 2, cellW - line, cellH - line);
    }
  }
}

export default function ArOverlayNavi({
  title,
  grid,
  colorMap,
  patternId = "ar-demo",
  onExit,
}: ArOverlayNaviProps) {
  const { t } = useTranslation();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [cameraStatus, setCameraStatus] = useState<CameraStatus>("starting");
  const [overlayOpacity, setOverlayOpacity] = useState(DEFAULT_OPACITY);

  const mergedColorMap = useMemo(
    () => ({ ...EDITOR_COLOR_HEX, ...colorMap }),
    [colorMap],
  );
  const path = useMemo(() => buildStitchPath(grid), [grid]);
  const rows = grid.length;
  const cols = grid[0]?.length ?? 0;
  const [stitchIndex, setStitchIndex] = useState(() =>
    loadStitchIndex(patternId, path.length),
  );

  useEffect(() => {
    setStitchIndex(loadStitchIndex(patternId, path.length));
  }, [patternId, path.length]);

  const active = path[stitchIndex] ?? null;
  const displayTitle = title.trim() || t("ar.demoTitle");

  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    const video = videoRef.current;
    if (video) video.srcObject = null;
  }, []);

  const startCamera = useCallback(async () => {
    if (typeof window === "undefined") return;
    if (!window.isSecureContext) {
      setCameraStatus("insecure");
      return;
    }
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraStatus("unsupported");
      return;
    }

    stopStream();
    setCameraStatus("starting");

    const video = videoRef.current;
    if (video) {
      video.setAttribute("playsinline", "true");
      video.setAttribute("webkit-playsinline", "true");
      video.muted = true;
      video.playsInline = true;
      video.autoplay = true;
    }

    try {
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          audio: false,
          video: { facingMode: { ideal: "environment" } },
        });
      } catch {
        stream = await navigator.mediaDevices.getUserMedia({
          audio: false,
          video: true,
        });
      }

      streamRef.current = stream;
      if (video) {
        video.srcObject = stream;
        try {
          await video.play();
        } catch {
          // iPad Safari may wait for a tap; the retry button covers that.
        }
      }
      setCameraStatus("live");
    } catch (error) {
      stopStream();
      setCameraStatus(cameraErrorStatus(error));
    }
  }, [stopStream]);

  useEffect(() => {
    void startCamera();
    return () => stopStream();
  }, [startCamera, stopStream]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || rows === 0 || cols === 0) return;

    const draw = () => paintPatternOverlay(canvas, grid, mergedColorMap);
    draw();
    const observer = new ResizeObserver(draw);
    observer.observe(canvas);
    return () => observer.disconnect();
  }, [grid, mergedColorMap, rows, cols]);

  const advanceStitch = useCallback(() => {
    if (path.length === 0) return;
    setStitchIndex((current) => {
      const next = nextStitchIndex(current, path.length);
      persistStitchIndex(patternId, next);
      return next;
    });
  }, [path.length, patternId]);

  const cameraMessage =
    cameraStatus === "insecure"
      ? t("ar.cameraInsecure")
      : cameraStatus === "unsupported"
        ? t("ar.cameraUnsupported")
        : cameraStatus === "blocked"
          ? t("ar.cameraBlocked")
          : cameraStatus === "missing"
            ? t("ar.cameraMissing")
            : cameraStatus === "starting"
              ? t("ar.cameraStarting")
              : "";

  const knitRow = active ? rows - active.row : 0;
  const stitchLabel = active
    ? t("ar.stitchCoord", { row: knitRow, col: active.col + 1 })
    : t("ar.noStitches");

  return (
    <div className="fixed inset-0 z-[90] h-[100dvh] w-full overflow-hidden bg-black text-white">
      <video
        ref={videoRef}
        className="absolute inset-0 h-full w-full object-cover"
        autoPlay
        muted
        playsInline
        disablePictureInPicture
        controls={false}
        aria-label={t("ar.cameraLabel")}
      />
      {cameraStatus !== "live" ? (
        <div className="absolute inset-0 bg-stone-950" aria-hidden />
      ) : null}

      <div className="pointer-events-none absolute inset-0 flex items-center justify-center px-4 pb-[10.5rem] pt-20">
        <div
          className="relative max-h-full max-w-full"
          style={{
            opacity: overlayOpacity,
            aspectRatio: `${Math.max(1, cols)} / ${Math.max(1, rows)}`,
            width: `min(100%, calc((100dvh - 14rem) * ${Math.max(1, cols)} / ${Math.max(1, rows)}))`,
            height: "auto",
          }}
        >
          <canvas ref={canvasRef} className="block h-full w-full" aria-hidden />
          {active ? (
            <div
              className="ar-stitch-blink pointer-events-none absolute rounded-[3px]"
              style={{
                left: `${(active.col / cols) * 100}%`,
                top: `${(active.row / rows) * 100}%`,
                width: `${100 / cols}%`,
                height: `${100 / rows}%`,
              }}
              aria-hidden
            />
          ) : null}
        </div>
      </div>

      <header className="absolute inset-x-0 top-0 z-10 flex items-center gap-2 bg-gradient-to-b from-black/70 to-transparent px-3 pb-6 pt-[max(0.75rem,env(safe-area-inset-top))]">
        <BackButton onClick={onExit} tone="dark" className="text-white hover:bg-white/10" />
        <div className="min-w-0 flex-1">
          <p className="truncate font-sans text-base font-semibold text-white">{displayTitle}</p>
          <p className="truncate font-sans text-sm text-white/70">{t("ar.subtitle")}</p>
        </div>
        <span className="shrink-0 rounded-full bg-white/12 px-3 py-1 font-sans text-sm text-white/80">
          {t("ar.progress", { current: path.length ? stitchIndex + 1 : 0, total: path.length })}
        </span>
      </header>

      {cameraStatus !== "live" ? (
        <div className="absolute inset-x-0 top-24 z-10 mx-auto max-w-md px-6 text-center">
          <CameraFillIcon className="mx-auto h-8 w-8 text-white/80" />
          <p className="mt-3 font-sans text-base text-white/90">{cameraMessage}</p>
          {cameraStatus !== "starting" ? (
            <button
              type="button"
              onClick={() => void startCamera()}
              className="pointer-events-auto mt-4 rounded-full bg-coral px-5 py-2.5 font-sans text-base font-semibold text-white hover:bg-white hover:text-gray-900"
            >
              {t("ar.enableCamera")}
            </button>
          ) : null}
        </div>
      ) : null}

      <div className="absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-black/80 via-black/55 to-transparent px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-8">
        <label className="block">
          <div className="mb-2 flex items-center justify-between font-sans text-sm text-white/80">
            <span>{t("ar.opacity")}</span>
            <span>{Math.round(overlayOpacity * 100)}%</span>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            step={1}
            value={Math.round(overlayOpacity * 100)}
            onChange={(event) => setOverlayOpacity(Number(event.target.value) / 100)}
            className="ar-opacity-slider w-full"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(overlayOpacity * 100)}
            aria-label={t("ar.opacity")}
          />
          <div className="mt-1 flex justify-between font-sans text-sm text-white/55">
            <span>{t("ar.opacityFaint")}</span>
            <span>{t("ar.opacitySolid")}</span>
          </div>
        </label>

        <div className="mt-4 flex items-center gap-3">
          <p className="min-w-0 flex-1 truncate font-sans text-sm text-white/80">{stitchLabel}</p>
          <button
            type="button"
            onClick={advanceStitch}
            disabled={path.length === 0}
            className="shrink-0 rounded-full bg-coral px-6 py-3 font-sans text-base font-bold text-white hover:bg-white hover:text-gray-900 disabled:opacity-40"
          >
            {t("ar.nextStitch")}
          </button>
        </div>
      </div>
    </div>
  );
}
