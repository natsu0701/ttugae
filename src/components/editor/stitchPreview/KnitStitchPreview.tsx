import { memo, useEffect, useMemo, useRef, useState, type PointerEvent } from "react";
import { useTranslation } from "react-i18next";
import type { EditorCell } from "../../../utils/patternGrid.ts";
import type { GaugeProfile } from "../../../utils/personalizationStorage.ts";
import { editorChromeBtn, editorChromeBtnActive } from "../../ui/tabButtonStyles.ts";
import {
  drawStitchSimulation,
  type StitchSimFabric,
  type StitchSimGeometry,
  type StitchSimHit,
  type StitchSimMode,
  type StitchSimOptions,
} from "./stitchSim.ts";

const PREFS_KEY = "ttugae.stitchPreview.opts.v1";

type SavedPrefs = {
  mode: StitchSimMode;
  fabric: StitchSimFabric;
  fuzz: number;
  peek: number;
};

const DEFAULT_PREFS: SavedPrefs = {
  mode: "knit",
  fabric: "flat",
  fuzz: 0.45,
  peek: 0.3,
};

function loadPrefs(): SavedPrefs {
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    if (!raw) return DEFAULT_PREFS;
    const parsed = JSON.parse(raw) as Partial<SavedPrefs>;
    return {
      mode: parsed.mode === "sc" || parsed.mode === "dc" || parsed.mode === "knit" ? parsed.mode : "knit",
      fabric: parsed.fabric === "round" ? "round" : "flat",
      fuzz: typeof parsed.fuzz === "number" ? parsed.fuzz : DEFAULT_PREFS.fuzz,
      peek: typeof parsed.peek === "number" ? parsed.peek : DEFAULT_PREFS.peek,
    };
  } catch {
    return DEFAULT_PREFS;
  }
}

function gaugeNumber(value: string | undefined, fallback: number) {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

type KnitStitchPreviewProps = {
  grid: EditorCell[][];
  colorMap: Record<string, string>;
  gauge?: GaugeProfile | null;
};

function KnitStitchPreview({ grid, colorMap, gauge }: KnitStitchPreviewProps) {
  const { t } = useTranslation();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const geoRef = useRef<StitchSimGeometry | null>(null);
  const [prefs, setPrefs] = useState<SavedPrefs>(loadPrefs);
  const [hit, setHit] = useState<StitchSimHit | null>(null);
  const [busy, setBusy] = useState(false);

  const options: StitchSimOptions = useMemo(
    () => ({
      mode: prefs.mode,
      fabric: prefs.fabric,
      stitchesPer10: gaugeNumber(gauge?.beforeSts, 20),
      rowsPer10: gaugeNumber(gauge?.beforeRows, 22),
      fuzz: prefs.fuzz,
      peek: prefs.peek,
    }),
    [prefs, gauge],
  );

  useEffect(() => {
    localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
  }, [prefs]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setBusy(true);
    const timer = window.setTimeout(() => {
      geoRef.current = drawStitchSimulation(canvas, grid, colorMap, options);
      setBusy(false);
    }, 80);
    return () => window.clearTimeout(timer);
  }, [grid, colorMap, options]);

  const patch = (next: Partial<SavedPrefs>) => setPrefs((prev) => ({ ...prev, ...next }));

  const onPointer = (e: PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    const geo = geoRef.current;
    if (!canvas || !geo) return;
    const rect = canvas.getBoundingClientRect();
    const px = ((e.clientX - rect.left) / rect.width) * canvas.width;
    const py = ((e.clientY - rect.top) / rect.height) * canvas.height;
    setHit(geo.hit(px, py));
  };

  const modes: { id: StitchSimMode; key: string }[] = [
    { id: "sc", key: "editor.stitchSim.sc" },
    { id: "dc", key: "editor.stitchSim.dc" },
    { id: "knit", key: "editor.stitchSim.knit" },
  ];
  const fabrics: { id: StitchSimFabric; key: string }[] = [
    { id: "flat", key: "editor.stitchSim.flat" },
    { id: "round", key: "editor.stitchSim.round" },
  ];

  return (
    <div>
      <p className="mb-1 font-sans text-sm font-normal uppercase tracking-wide text-stone-500">
        {t("editor.stitchSim.mode")}
      </p>
      <div className="mb-3 flex flex-wrap gap-1">
        {modes.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => patch({ mode: item.id })}
            className={`min-h-11 px-2.5 py-1.5 font-sans text-sm ${
              prefs.mode === item.id ? editorChromeBtnActive : editorChromeBtn
            }`}
          >
            {t(item.key)}
          </button>
        ))}
      </div>

      <p className="mb-1 font-sans text-sm font-normal uppercase tracking-wide text-stone-500">
        {t("editor.stitchSim.fabric")}
      </p>
      <div className="mb-3 flex flex-wrap gap-1">
        {fabrics.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => patch({ fabric: item.id })}
            className={`min-h-11 px-2.5 py-1.5 font-sans text-sm ${
              prefs.fabric === item.id ? editorChromeBtnActive : editorChromeBtn
            }`}
          >
            {t(item.key)}
          </button>
        ))}
      </div>

      <label className="mb-3 flex items-center gap-2">
        <span className="w-24 shrink-0 font-sans text-sm text-stone-500">{t("editor.stitchSim.fuzz")}</span>
        <input
          type="range"
          min={0}
          max={100}
          value={Math.round(prefs.fuzz * 100)}
          onChange={(e) => patch({ fuzz: Number(e.target.value) / 100 })}
          className="h-11 min-w-0 flex-1 accent-coral"
          aria-label={t("editor.stitchSim.fuzz")}
        />
      </label>
      <label className="mb-3 flex items-center gap-2">
        <span className="w-24 shrink-0 font-sans text-sm text-stone-500">{t("editor.stitchSim.peek")}</span>
        <input
          type="range"
          min={0}
          max={100}
          value={Math.round(prefs.peek * 100)}
          onChange={(e) => patch({ peek: Number(e.target.value) / 100 })}
          className="h-11 min-w-0 flex-1 accent-coral"
          aria-label={t("editor.stitchSim.peek")}
        />
      </label>

      <div className="relative overflow-hidden rounded-xl border border-stone-200 bg-[#f4f1ea]">
        <canvas
          ref={canvasRef}
          className="block h-auto w-full cursor-crosshair"
          onPointerMove={onPointer}
          onPointerDown={onPointer}
          onPointerLeave={() => setHit(null)}
        />
        {busy ? (
          <p className="pointer-events-none absolute inset-x-0 top-2 text-center font-sans text-sm text-stone-500">
            {t("editor.stitchSim.busy")}
          </p>
        ) : null}
        {hit ? (
          <p className="pointer-events-none absolute bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-stone-900/80 px-3 py-1 font-sans text-sm text-white">
            {t("editor.stitchSim.hover", { row: hit.knitRow, stitch: hit.knitStitch })}
          </p>
        ) : null}
      </div>
      <p className="mt-2 font-sans text-sm leading-snug text-stone-500">{t("editor.stitchSim.disclaimer")}</p>
    </div>
  );
}

export default memo(KnitStitchPreview);
