import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  CheckFillIcon,
  CopyFillIcon,
  PlusFillIcon,
} from "./components/icons/FillIcons.tsx";
import AiPreviewNavigator from "./components/editor/AiPreviewNavigator.tsx";
import FinishedWorkScanPanel from "./components/editor/FinishedWorkScanPanel.tsx";
import EditorRightSidebar from "./components/editor/EditorRightSidebar.tsx";
import EditorHeader from "./components/editor/EditorHeader.tsx";
import CastOnModal from "./components/editor/CastOnModal.tsx";
import NeedleSpecFields from "./components/editor/NeedleSpecFields.tsx";
import ChartTabs from "./components/editor/ChartTabs.tsx";
import EditorCanvasStage from "./components/editor/EditorCanvasStage.tsx";
import PatternGrid from "./components/editor/PatternGrid.tsx";
import ColorChipMenu from "./components/editor/ColorChipMenu.tsx";
import WorkshopPalettePanel from "./components/editor/WorkshopPalettePanel.tsx";
import TteuniChatbot from "./components/editor/TteuniChatbot.tsx";
import YarnSearchPopover from "./components/editor/YarnSearchPopover.tsx";
import EditorOnboardingSpotlight from "./components/editor/EditorOnboardingSpotlight.tsx";
import GiftPackagingAnimation from "./components/ui/GiftPackagingAnimation.tsx";
import { applyAiPatternFromMessage, getTteuniReply } from "./utils/aiPatternApply.ts";
import { editorChromeBtn, editorChromeBtnActive, editorChromeTone, editorPanel } from "./components/ui/tabButtonStyles.ts";
import { STITCHES, stitchSymbol } from "./data/stitchSymbols.ts";
import type { EditorYarn } from "./types/editorYarn.ts";
import {
  createRealisticDemoGrid,
  emptyGrid,
  paletteYarnsForGrid,
  resizeGrid,
  type EditorCell,
} from "./utils/patternGrid.ts";
import {
  buildPatternMetadata,
  DEFAULT_NEEDLE,
  type NeedleSpec,
} from "./data/knittingMetadataLibrary.ts";
import {
  backBodyChart,
  CHART_PART_LABELS,
  frontBodyChart,
  newChartId,
  type ChartTargetPart,
  type KnittingChart,
} from "./types/knittingProject.ts";
import { persistCurrentProgressRow } from "./utils/editorProgressStorage.ts";
import { formatNeedleBadgeI18n } from "./utils/i18nContent.ts";
import { useUnsavedChanges } from "./context/UnsavedChangesContext.tsx";
import {
  assignPatternCollection,
  collectionIdForPattern,
  loadCollections,
} from "./utils/collectionStorage.ts";

const MAX_GRID = 50;

type Tool = "paint" | "eraser" | "checker" | "select" | "pan";

type PatternEditorProps = {
  initialPattern: {
    id: string;
    title: string;
    updatedAt: number;
    gridSize: number;
    grid: EditorCell[][];
    backGrid?: EditorCell[][];
    facesIndependent?: boolean;
    colorMap?: Record<string, string>;
    needle?: NeedleSpec;
  } | null;
  onSave: (pattern: {
    id: string;
    title: string;
    updatedAt: number;
    gridSize: number;
    grid: EditorCell[][];
    backGrid?: EditorCell[][];
    facesIndependent?: boolean;
    needle?: NeedleSpec;
    metadata?: ReturnType<typeof buildPatternMetadata>;
  }) => void;
  onShare: (payload: {
    pattern: {
      id: string;
      title: string;
      updatedAt: number;
      gridSize: number;
      grid: EditorCell[][];
    };
    yarns: EditorYarn[];
    colorMap: Record<string, string>;
    gridRows: number;
    gridCols: number;
    needle?: NeedleSpec;
  }) => void;
  onExit: () => void;
  onGoDashboard: () => void;
};

function initGrid(initial: PatternEditorProps["initialPattern"]) {
  if (initial?.grid?.length) {
    const rows = initial.grid.length;
    const cols = initial.grid[0]?.length ?? initial.gridSize;
    return { rows, cols, grid: initial.grid };
  }
  const rows = 14;
  const cols = 14;
  return {
    rows,
    cols,
    grid: createRealisticDemoGrid(rows, cols, "editor-new"),
  };
}

function initCharts(initial: PatternEditorProps["initialPattern"]): {
  charts: KnittingChart[];
  activeChartId: string;
  facesIndependent: boolean;
} {
  const seeded = initGrid(initial);
  const frontId = newChartId();
  const charts: KnittingChart[] = [
    {
      id: frontId,
      name: CHART_PART_LABELS.body,
      targetPart: "body",
      gridData: seeded.grid,
    },
  ];
  const hasBack = Boolean(initial?.backGrid?.length);
  const facesIndependent = Boolean(initial?.facesIndependent && hasBack);
  if (hasBack && initial?.backGrid) {
    charts.push({
      id: newChartId(),
      name: CHART_PART_LABELS.bodyBack,
      targetPart: "bodyBack",
      gridData: initial.backGrid,
    });
  }
  return {
    activeChartId: frontId,
    charts,
    facesIndependent,
  };
}

function isCheckerCell(r: number, c: number) {
  return (r + c) % 2 === 0;
}

export default function PatternEditor({
  initialPattern,
  onSave,
  onShare,
  onExit,
  onGoDashboard,
}: PatternEditorProps) {
  const { t } = useTranslation();
  const { setDirty, registerSaver, requestLeave } = useUnsavedChanges();
  const seeded = initCharts(initialPattern);
  const defaultTitle = t("editor.defaultTitle");
  const [patternId] = useState<string>(
    initialPattern?.id ?? (crypto.randomUUID?.() ?? String(Date.now())),
  );
  const [title, setTitle] = useState<string>(initialPattern?.title ?? defaultTitle);
  const [charts, setCharts] = useState<KnittingChart[]>(seeded.charts);
  const [activeChartId, setActiveChartId] = useState(seeded.activeChartId);
  const [facesIndependent] = useState(seeded.facesIndependent);
  const [paletteYarns, setPaletteYarns] = useState<EditorYarn[]>(() =>
    paletteYarnsForGrid(initGrid(initialPattern).grid, initialPattern?.colorMap),
  );
  const [yarnSearchOpen, setYarnSearchOpen] = useState(false);
  const [patternCopyDone, setPatternCopyDone] = useState(false);
  const [activeWorkshopPaletteId, setActiveWorkshopPaletteId] = useState<string | null>(null);
  const [castOnOpen, setCastOnOpen] = useState(false);
  const [castOnMode, setCastOnMode] = useState<"replace" | "add" | "gauge">("replace");
  const [needle, setNeedle] = useState<NeedleSpec>(
    () => initialPattern?.needle ?? DEFAULT_NEEDLE,
  );
  const [isPackOpen, setIsPackOpen] = useState(false);
  const [activeColor, setActiveColor] = useState<string>("coral");
  const [activeStitch, setActiveStitch] = useState<string>("knit");
  const [tool, setTool] = useState<Tool>("paint");
  const [spacePan, setSpacePan] = useState(false);
  const [saveCollectionId, setSaveCollectionId] = useState(() =>
    collectionIdForPattern(initialPattern?.id ?? ""),
  );
  const [selection, setSelection] = useState<{
    r0: number;
    c0: number;
    r1: number;
    c1: number;
  } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [toolHintOpen, setToolHintOpen] = useState(true);
  const [sizeMenuOpen, setSizeMenuOpen] = useState(false);
  const [customW, setCustomW] = useState(
    String(seeded.charts[0]?.gridData[0]?.length ?? 14),
  );
  const [customH, setCustomH] = useState(String(seeded.charts[0]?.gridData.length ?? 14));
  const dragStart = useRef<{ r: number; c: number } | null>(null);
  const leftToolbarRef = useRef<HTMLElement>(null);
  const chatbotPanelRef = useRef<HTMLDivElement>(null);
  const sizeMenuRef = useRef<HTMLDivElement>(null);
  const yarnPaletteRef = useRef<HTMLDivElement>(null);

  const activeChart =
    charts.find((chart) => chart.id === activeChartId) ?? charts[0];
  const grid = activeChart?.gridData ?? emptyGrid(14, 14);
  const gridRows = grid.length;
  const gridCols = grid[0]?.length ?? 0;

  const markDirty = useCallback(() => setDirty(true), [setDirty]);

  const patchActiveGrid = useCallback(
    (updater: (prev: EditorCell[][]) => EditorCell[][]) => {
      setCharts((prev) =>
        prev.map((chart) =>
          chart.id === activeChartId
            ? { ...chart, gridData: updater(chart.gridData) }
            : chart,
        ),
      );
      setDirty(true);
    },
    [activeChartId, setDirty],
  );

  const paletteYarnIds = useMemo(
    () => new Set(paletteYarns.map((y) => y.id)),
    [paletteYarns],
  );

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      const target = e.target as Node;
      if (sizeMenuRef.current && !sizeMenuRef.current.contains(target)) {
        setSizeMenuOpen(false);
      }
      if (yarnPaletteRef.current && !yarnPaletteRef.current.contains(target)) {
        setYarnSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space" && !e.repeat) {
        const tag = (e.target as HTMLElement | null)?.tagName;
        if (tag === "INPUT" || tag === "TEXTAREA") return;
        e.preventDefault();
        setSpacePan(true);
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code === "Space") setSpacePan(false);
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, []);

  const colorMap = useMemo(
    () => Object.fromEntries(paletteYarns.map((y) => [y.id, y.hex])),
    [paletteYarns],
  );

  const stitchSymbols = useMemo(
    () => Object.fromEntries(STITCHES.map((s) => [s.id, s.symbol])) as Record<string, string>,
    [],
  );

  const usedYarns = useMemo(() => {
    const ids = new Set<string>();
    charts.forEach((chart) => {
      chart.gridData.flat().forEach((cell) => {
        if (cell.stitchId !== "empty") ids.add(cell.colorId);
      });
    });
    return [...ids]
      .map((id) => paletteYarns.find((y) => y.id === id))
      .filter((y): y is EditorYarn => Boolean(y));
  }, [charts, paletteYarns]);

  const changeYarnColor = useCallback((colorId: string, hex: string) => {
    const normalized = hex.toUpperCase();
    setPaletteYarns((prev) =>
      prev.map((y) => (y.id === colorId ? { ...y, hex: normalized } : y)),
    );
  }, []);

  const deleteColorFromCanvas = useCallback((colorId: string) => {
    patchActiveGrid((prev) =>
      prev.map((row) =>
        row.map((cell) =>
          cell.colorId === colorId
            ? { colorId: "white", stitchId: "empty" }
            : cell,
        ),
      ),
    );
    if (activeColor === colorId) setActiveColor("white");
  }, [activeColor, patchActiveGrid]);

  const applyWorkshopPalette = useCallback(
    (paletteId: string, colors: [string, string, string]) => {
      setActiveWorkshopPaletteId(paletteId);
      setPaletteYarns((prev) =>
        prev.map((yarn, index) =>
          index < colors.length
            ? { ...yarn, hex: colors[index].toUpperCase() }
            : yarn,
        ),
      );
    },
    [],
  );

  const applySize = useCallback((w: number, h: number) => {
    const cols = Math.min(MAX_GRID, Math.max(4, w));
    const rows = Math.min(MAX_GRID, Math.max(4, h));
    setCustomW(String(cols));
    setCustomH(String(rows));
    patchActiveGrid((prev) => resizeGrid(prev, rows, cols));
    setSelection(null);
    setSizeMenuOpen(false);
  }, [patchActiveGrid]);

  const handleCastOnCanvas = useCallback((cols: number, rows: number) => {
    const c = Math.min(MAX_GRID, Math.max(4, cols));
    const r = Math.min(MAX_GRID, Math.max(4, rows));
    setCustomW(String(c));
    setCustomH(String(r));
    patchActiveGrid(() => emptyGrid(r, c));
    setSelection(null);
  }, [patchActiveGrid]);

  const handleAddChart = useCallback(
    (payload: {
      cols: number;
      rows: number;
      name: string;
      targetPart: ChartTargetPart;
    }) => {
      const c = Math.min(MAX_GRID, Math.max(4, payload.cols));
      const r = Math.min(MAX_GRID, Math.max(4, payload.rows));
      const id = newChartId();
      const chart: KnittingChart = {
        id,
        name: payload.name,
        targetPart: payload.targetPart,
        gridData: emptyGrid(r, c),
      };
      setCharts((prev) => [...prev, chart]);
      setActiveChartId(id);
      setCustomW(String(c));
      setCustomH(String(r));
      setSelection(null);
    },
    [],
  );

  const handleSelectChart = useCallback(
    (id: string) => {
      setActiveChartId(id);
      setSelection(null);
      const found = charts.find((chart) => chart.id === id);
      if (found) {
        setCustomW(String(found.gridData[0]?.length ?? 14));
        setCustomH(String(found.gridData.length));
      }
    },
    [charts],
  );

  const applyCell = useCallback(
    (r: number, c: number) => {
      patchActiveGrid((prev) => {
        const next = prev.map((row) => row.map((cell) => ({ ...cell })));
        if (tool === "eraser") {
          next[r][c] = { colorId: "white", stitchId: "empty" };
          return next;
        }
        if (tool === "checker" && !isCheckerCell(r, c)) {
          return prev;
        }
        next[r][c] = { colorId: activeColor, stitchId: activeStitch };
        return next;
      });
      persistCurrentProgressRow(r);
    },
    [tool, activeColor, activeStitch, patchActiveGrid],
  );

  const fillSelection = useCallback(() => {
    if (!selection) return;
    const { r0, c0, r1, c1 } = selection;
    const rMin = Math.min(r0, r1);
    const rMax = Math.max(r0, r1);
    const cMin = Math.min(c0, c1);
    const cMax = Math.max(c0, c1);
    patchActiveGrid((prev) => {
      const next = prev.map((row) => row.map((cell) => ({ ...cell })));
      for (let r = rMin; r <= rMax; r++) {
        for (let c = cMin; c <= cMax; c++) {
          if (tool === "checker" && !isCheckerCell(r, c)) continue;
          if (tool === "eraser") {
            next[r][c] = { colorId: "white", stitchId: "empty" };
          } else {
            next[r][c] = { colorId: activeColor, stitchId: activeStitch };
          }
        }
      }
      return next;
    });
  }, [selection, activeColor, activeStitch, tool, patchActiveGrid]);

  const handlePointerDown = useCallback((r: number, c: number) => {
    if (tool === "pan" || spacePan) return;
    if (tool === "paint" || tool === "eraser" || tool === "checker") {
      setIsDragging(true);
      applyCell(r, c);
      return;
    }
    dragStart.current = { r, c };
    setSelection({ r0: r, c0: c, r1: r, c1: c });
    setIsDragging(true);
  }, [tool, spacePan, applyCell]);

  const handlePointerEnter = useCallback((r: number, c: number) => {
    if ((tool === "paint" || tool === "eraser" || tool === "checker") && isDragging) {
      applyCell(r, c);
    }
    if (tool === "select" && isDragging && dragStart.current) {
      setSelection({
        r0: dragStart.current.r,
        c0: dragStart.current.c,
        r1: r,
        c1: c,
      });
    }
  }, [tool, isDragging, applyCell]);

  const endDrag = useCallback(() => {
    setIsDragging(false);
    dragStart.current = null;
  }, []);

  const handleToolChange = useCallback((next: Tool) => {
    setTool(next);
    setToolHintOpen(true);
  }, []);

  const dismissToolHint = useCallback(() => {
    setToolHintOpen(false);
  }, []);

  const addYarnToPalette = (yarn: EditorYarn) => {
    setPaletteYarns((prev) => {
      if (prev.some((y) => y.id === yarn.id)) return prev;
      return [...prev, yarn];
    });
    setActiveColor(yarn.id);
  };

  const frontGrid = frontBodyChart(charts)?.gridData ?? grid;
  const backGrid = backBodyChart(charts)?.gridData;
  const faceHint = facesIndependent
    ? activeChart?.targetPart === "bodyBack"
      ? t("editor.facesEditingBack")
      : activeChart?.targetPart === "body"
        ? t("editor.facesEditingFront")
        : t("editor.facesHintDifferent")
    : t("editor.facesHintSame");

  const buildPatternPayload = () => {
    const front = frontBodyChart(charts);
    const back = backBodyChart(charts);
    const savedGrid = front?.gridData ?? grid;
    const savedRows = savedGrid.length;
    const savedCols = savedGrid[0]?.length ?? 0;
    return {
      id: patternId,
      title: title.trim() || t("editor.defaultTitle"),
      updatedAt: Date.now(),
      gridSize: Math.max(savedRows, savedCols),
      grid: savedGrid,
      facesIndependent,
      backGrid: back?.gridData,
      needle,
      metadata: buildPatternMetadata({
        title: title.trim() || t("editor.defaultTitle"),
        author: "나",
        needle,
        totalStitches: savedCols,
        totalRows: savedRows,
      }),
    };
  };

  const handleSave = () => {
    onSave(buildPatternPayload());
    assignPatternCollection(patternId, saveCollectionId);
    setDirty(false);
    setIsPackOpen(true);
  };

  useEffect(() => {
    registerSaver(() => {
      onSave(buildPatternPayload());
      assignPatternCollection(patternId, saveCollectionId);
      setDirty(false);
    });
    return () => registerSaver(() => undefined);
  }, [registerSaver, onSave, patternId, saveCollectionId, setDirty, title, charts, needle]);

  const handleShareToCommunity = () => {
    const payload = buildPatternPayload();
    onSave(payload);
    assignPatternCollection(patternId, saveCollectionId);
    setDirty(false);
    onShare({
      pattern: payload,
      yarns: paletteYarns,
      colorMap,
      gridRows: payload.grid.length,
      gridCols: payload.grid[0]?.length ?? payload.gridSize,
      needle,
    });
  };

  const handleGoVault = () => {
    onSave(buildPatternPayload());
    assignPatternCollection(patternId, saveCollectionId);
    setDirty(false);
    setIsPackOpen(false);
    onGoDashboard();
  };

  const handleAiMessage = useCallback(
    (message: string) => {
      const colorIds = paletteYarns.map((y) => y.id);
      patchActiveGrid((prev) => applyAiPatternFromMessage(prev, message, colorIds));
      const lower = message.toLowerCase();
      const untitled = t("editor.defaultTitle");
      if (lower.includes("가디건") || lower.includes("cardigan") || lower.includes("カーディガン")) {
        setTitle((prev) => (prev === untitled ? t("editor.itemSweater") : prev));
      } else if (lower.includes("가을") || lower.includes("autumn") || lower.includes("fall") || lower.includes("秋")) {
        setTitle((prev) => (prev === untitled ? t("editor.titleAutumn") : prev));
      }
      return getTteuniReply(message, t);
    },
    [paletteYarns, t, patchActiveGrid],
  );

  const patternText = useMemo(() => {
    const lines: string[] = [];
    lines.push(
      t("editor.copyHeader", {
        brand: t("nav.brand"),
        cols: gridCols,
        rows: gridRows,
      }),
    );
    lines.push(t("editor.copyNeedle", { needle: formatNeedleBadgeI18n(t, needle) }));
    lines.push(
      t("editor.copyYarn", {
        yarns: usedYarns.map((y) => `${y.label}(${y.fiberType})`).join(", "),
      }),
    );
    lines.push("");
    grid.forEach((row, ri) => {
      const rowText = row
        .map((cell) => {
          const yarn = paletteYarns.find((y) => y.id === cell.colorId);
          return `${stitchSymbol(cell.stitchId)}(${yarn?.label.slice(0, 2) ?? ""})`;
        })
        .join(" ");
      lines.push(`R${ri + 1}: ${rowText}`);
    });
    return lines.join("\n");
  }, [grid, usedYarns, gridCols, gridRows, paletteYarns, needle, t]);

  const copyPatternText = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(patternText);
      setPatternCopyDone(true);
      window.setTimeout(() => setPatternCopyDone(false), 2000);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = patternText;
      textarea.setAttribute("readonly", "");
      textarea.style.position = "fixed";
      textarea.style.left = "-9999px";
      document.body.appendChild(textarea);
      textarea.select();
      try {
        document.execCommand("copy");
        setPatternCopyDone(true);
        window.setTimeout(() => setPatternCopyDone(false), 2000);
      } catch {
        // ignore
      }
      document.body.removeChild(textarea);
    }
  }, [patternText]);

  const toolHint = t(`editor.toolHints.${tool}`);
  const panEnabled = tool === "pan" || spacePan;

  return (
    <div
      className="flex h-screen flex-col overflow-hidden bg-stone-800 font-sans text-stone-100"
      onPointerUp={endDrag}
      onPointerLeave={endDrag}
    >
      <EditorHeader
        title={title}
        onTitleChange={(next) => {
          setTitle(next);
          markDirty();
        }}
        gridCols={gridCols}
        gridRows={gridRows}
        sizeMenuOpen={sizeMenuOpen}
        onToggleSizeMenu={() => setSizeMenuOpen((o) => !o)}
        customW={customW}
        customH={customH}
        onCustomWChange={setCustomW}
        onCustomHChange={setCustomH}
        onApplySize={applySize}
        onSave={handleSave}
        onShare={handleShareToCommunity}
        onExit={() => requestLeave(onExit)}
        onAddChart={() => {
          setCastOnMode("add");
          setCastOnOpen(true);
        }}
        sizeMenuRef={sizeMenuRef}
        needleLabel={formatNeedleBadgeI18n(t, needle)}
        yarnLabel={usedYarns.map((y) => y.label).join(", ") || t("editor.yarnUnset")}
        chartTabs={
          <ChartTabs
            charts={charts}
            activeChartId={activeChartId}
            facesIndependent={facesIndependent}
            onSelect={handleSelectChart}
          />
        }
      />

      <CastOnModal
        open={castOnOpen}
        mode={castOnMode}
        onClose={() => setCastOnOpen(false)}
        onApply={handleCastOnCanvas}
        onAddChart={handleAddChart}
        needle={needle}
        onNeedleChange={setNeedle}
      />

      <EditorOnboardingSpotlight
        toolbarRef={leftToolbarRef}
        chatbotRef={chatbotPanelRef}
      />

      <div className="flex min-h-0 flex-1 overflow-hidden">
        <aside
          ref={leftToolbarRef}
          className="scrollbar-thin flex h-[calc(100vh-4rem)] w-[200px] shrink-0 flex-col gap-4 overflow-y-auto border-r border-stone-800/80 bg-stone-800 p-3 pb-8 md:p-5 md:pb-8"
        >
          <div>
            <p className="mb-2 font-sans text-sm font-normal uppercase tracking-wide text-stone-400">
              {t("editor.symbolPalette")}
            </p>
            <div className="grid grid-cols-2 gap-1.5">
              {STITCHES.filter((s) => s.id !== "caston").map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setActiveStitch(s.id)}
                  className={`flex flex-col items-center px-1.5 py-2 font-sans text-sm font-normal ${
                    activeStitch === s.id ? editorChromeBtnActive : editorChromeBtn
                  }`}
                >
                  <span className="flex h-6 items-center justify-center text-base leading-none">{s.symbol}</span>
                  <span className="mt-0.5 truncate text-2xs">
                    {t(`editor.stitches.${s.id}`)}
                  </span>
                </button>
              ))}
              <button
                type="button"
                onClick={() => {
                  setCastOnMode("replace");
                  setCastOnOpen(true);
                }}
                className="flex flex-col items-center rounded-xl border border-stone-500 bg-transparent px-1.5 py-2 font-sans text-sm font-normal text-stone-100 transition-colors hover:border-stone-400 hover:bg-stone-700/40"
                aria-label={t("editor.castOnButton")}
                title={t("editor.castOnButton")}
              >
                <span className="flex h-6 items-center justify-center text-2xl leading-none">+</span>
                <span className="mt-0.5 truncate text-2xs">
                  {t("editor.stitches.caston")}
                </span>
              </button>
            </div>
            <button
              type="button"
              onClick={() => {
                setCastOnMode("gauge");
                setCastOnOpen(true);
              }}
              className={`mt-2 w-full px-3 py-2.5 font-sans text-sm font-normal ${editorChromeBtn}`}
            >
              {t("editor.gaugeButton")}
            </button>

            <WorkshopPalettePanel
              activePaletteId={activeWorkshopPaletteId}
              onSelectPalette={applyWorkshopPalette}
            />
          </div>

          <div ref={yarnPaletteRef} className="relative">
            <p className="mb-2 font-sans text-sm font-normal uppercase tracking-wide text-stone-400">
              {t("editor.yarnColors")}
            </p>
            <div className="grid grid-cols-3 gap-1.5">
              {paletteYarns.map((yarn) => (
                <ColorChipMenu
                  key={yarn.id}
                  yarn={yarn}
                  variant="palette"
                  isActive={activeColor === yarn.id}
                  onSelect={() => setActiveColor(yarn.id)}
                  onChangeColor={changeYarnColor}
                  onDeleteFromCanvas={deleteColorFromCanvas}
                />
              ))}
              <button
                type="button"
                onClick={() => setYarnSearchOpen((o) => !o)}
                className={`flex aspect-square w-full items-center justify-center ${editorChromeBtn}`}
                aria-label={t("editor.addYarn")}
                title={t("editor.addYarn")}
              >
                <PlusFillIcon className="h-5 w-5" />
              </button>
            </div>
            <YarnSearchPopover
              open={yarnSearchOpen}
              onClose={() => setYarnSearchOpen(false)}
              onSelect={addYarnToPalette}
              existingIds={paletteYarnIds}
            />
          </div>
        </aside>

        <main className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-[#F7F5F0]">
        <EditorCanvasStage
          panEnabled={panEnabled}
          dock={{
            tool,
            onToolChange: handleToolChange,
            showFillSelection: tool === "select" && Boolean(selection),
            onFillSelection: fillSelection,
            hint: toolHint,
            hintOpen: toolHintOpen,
            onDismissHint: dismissToolHint,
          }}
        >
          <PatternGrid
            grid={grid}
            colorMap={colorMap}
            selection={selection}
            pointerDisabled={panEnabled}
            onCellPointerDown={handlePointerDown}
            onCellPointerEnter={handlePointerEnter}
          />
          {facesIndependent ? (
            <p className="mt-3 font-seoyun text-base font-normal text-stone-400">{faceHint}</p>
          ) : null}
        </EditorCanvasStage>
        </main>

        <EditorRightSidebar>
          <div className="scrollbar-thin flex h-full min-h-0 flex-col gap-4 overflow-x-hidden overflow-y-auto p-4 md:p-5">
            <AiPreviewNavigator
              title={title}
              grid={grid}
              frontGrid={frontGrid}
              backGrid={backGrid}
              facesIndependent={facesIndependent}
              charts={charts}
              colorMap={colorMap}
              stitchSymbols={stitchSymbols}
              yarnMeta={usedYarns}
            />
            <div ref={chatbotPanelRef}>
              <TteuniChatbot onUserMessage={handleAiMessage} />
            </div>
            <div className={`${editorPanel} p-4`}>
              <p className="mb-1 font-sans text-base font-bold text-white">{t("editor.needlePanelTitle")}</p>
              <p className="mb-3 font-seoyun text-sm font-normal text-stone-400">
                {t("editor.needlePanelHint")}
              </p>
              <NeedleSpecFields
                value={needle}
                onChange={(next) => {
                  setNeedle(next);
                  markDirty();
                }}
                tone="dark"
              />
            </div>
            <FinishedWorkScanPanel
              grid={grid}
              colorMap={colorMap}
              onApply={(nextGrid, yarns) => {
                patchActiveGrid(() => nextGrid);
                setPaletteYarns(yarns);
              }}
            />
            <div className={`relative min-w-0 p-4 ${editorPanel}`}>
              <div className="mb-2 flex shrink-0 items-center justify-between gap-2">
                <p className="font-sans text-sm font-normal uppercase tracking-wide text-stone-400">
                  {t("editor.narrativePreview")}
                </p>
                <button
                  type="button"
                  onClick={() => void copyPatternText()}
                  className={`relative flex h-8 w-8 items-center justify-center rounded-full ${editorChromeTone}`}
                  aria-label={t("editor.copyNarrative")}
                  title={patternCopyDone ? t("editor.copied") : t("editor.copy")}
                >
                  {patternCopyDone ? (
                    <CheckFillIcon className="h-3.5 w-3.5 text-coral" />
                  ) : (
                    <CopyFillIcon className="h-3.5 w-3.5" />
                  )}
                  {patternCopyDone ? (
                    <span className="absolute -bottom-8 right-0 z-10 whitespace-nowrap rounded-full bg-stone-800 px-2.5 py-1 font-sans text-sm font-medium text-white shadow-md">
                      {t("editor.copied")}
                    </span>
                  ) : null}
                </button>
              </div>
              <pre className="scrollbar-thin max-h-[200px] min-w-0 overflow-x-hidden overflow-y-auto break-keep break-words whitespace-pre-wrap font-sans text-sm font-normal leading-relaxed text-stone-200 md:max-h-[240px]">
                {patternText}
              </pre>
            </div>
          </div>
        </EditorRightSidebar>
      </div>

      <GiftPackagingAnimation
        isOpen={isPackOpen}
        onClose={() => setIsPackOpen(false)}
        patternTitle={title}
        onTitleChange={(next) => {
          setTitle(next);
          markDirty();
        }}
        collections={loadCollections()}
        collectionId={saveCollectionId}
        onCollectionChange={setSaveCollectionId}
        onGoVault={handleGoVault}
      />
    </div>
  );
}
