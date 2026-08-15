import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  BrushFillIcon,
  CheckFillIcon,
  CopyFillIcon,
  EraserFillIcon,
  PatternsFillIcon,
  SelectFillIcon,
} from "./components/icons/FillIcons.tsx";
import AiPreviewNavigator from "./components/editor/AiPreviewNavigator.tsx";
import FinishedWorkScanPanel from "./components/editor/FinishedWorkScanPanel.tsx";
import EditorRightSidebar from "./components/editor/EditorRightSidebar.tsx";
import ColorPresetsSection from "./components/editor/ColorPresetsSection.tsx";
import EditorHeader from "./components/editor/EditorHeader.tsx";
import CastOnModal from "./components/editor/CastOnModal.tsx";
import NeedleSpecFields from "./components/editor/NeedleSpecFields.tsx";
import ChartTabs from "./components/editor/ChartTabs.tsx";
import ColorChipMenu from "./components/editor/ColorChipMenu.tsx";
import SelectionColorsPanel from "./components/editor/SelectionColorsPanel.tsx";
import WorkshopPalettePanel from "./components/editor/WorkshopPalettePanel.tsx";
import TteuniChatbot from "./components/editor/TteuniChatbot.tsx";
import YarnSearchPopover from "./components/editor/YarnSearchPopover.tsx";
import EditorOnboardingSpotlight from "./components/editor/EditorOnboardingSpotlight.tsx";
import GiftPackagingAnimation from "./components/ui/GiftPackagingAnimation.tsx";
import { applyAiPatternFromMessage, getTteuniReply } from "./utils/aiPatternApply.ts";
import { editorChromeBtn, editorChromeBtnActive, editorChromeTone, editorPanel } from "./components/ui/tabButtonStyles.ts";
import { STITCHES, stitchSymbol } from "./data/stitchSymbols.ts";
import type { EditorYarn } from "./types/editorYarn.ts";
import { symbolColorForBackground } from "./utils/colorContrast.ts";
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
  formatNeedleBadge,
  needleDetailLabel,
  type NeedleSpec,
} from "./data/knittingMetadataLibrary.ts";
import {
  newChartId,
  type ChartTargetPart,
  type KnittingChart,
} from "./types/knittingProject.ts";

const MAX_GRID = 50;
const PALETTE_PRESET_SLOTS = 4;

type Tool = "paint" | "eraser" | "checker" | "select";

const TOOLS: { id: Tool; Icon: typeof BrushFillIcon }[] = [
  { id: "paint", Icon: BrushFillIcon },
  { id: "eraser", Icon: EraserFillIcon },
  { id: "checker", Icon: PatternsFillIcon },
  { id: "select", Icon: SelectFillIcon },
];

type PatternEditorProps = {
  initialPattern: {
    id: string;
    title: string;
    updatedAt: number;
    gridSize: number;
    grid: EditorCell[][];
    colorMap?: Record<string, string>;
    needle?: NeedleSpec;
  } | null;
  onSave: (pattern: {
    id: string;
    title: string;
    updatedAt: number;
    gridSize: number;
    grid: EditorCell[][];
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
} {
  const seeded = initGrid(initial);
  const id = newChartId();
  return {
    activeChartId: id,
    charts: [
      {
        id,
        name: "앞판 몸통",
        targetPart: "body",
        gridData: seeded.grid,
      },
    ],
  };
}

function isCheckerCell(r: number, c: number) {
  return (r + c) % 2 === 0;
}

export default function PatternEditor({
  initialPattern,
  onSave,
  onShare: _onShare,
  onExit,
  onGoDashboard,
}: PatternEditorProps) {
  const { t } = useTranslation();
  const seeded = initCharts(initialPattern);
  const defaultTitle = t("editor.defaultTitle");
  const [patternId] = useState<string>(
    initialPattern?.id ?? (crypto.randomUUID?.() ?? String(Date.now())),
  );
  const [title, setTitle] = useState<string>(initialPattern?.title ?? defaultTitle);
  const [charts, setCharts] = useState<KnittingChart[]>(seeded.charts);
  const [activeChartId, setActiveChartId] = useState(seeded.activeChartId);
  const [paletteYarns, setPaletteYarns] = useState<EditorYarn[]>(() =>
    paletteYarnsForGrid(initGrid(initialPattern).grid, initialPattern?.colorMap),
  );
  const [yarnSearchOpen, setYarnSearchOpen] = useState(false);
  const [patternCopyDone, setPatternCopyDone] = useState(false);
  const [activePresetId, setActivePresetId] = useState<string | null>(null);
  const [activeWorkshopPaletteId, setActiveWorkshopPaletteId] = useState<string | null>(null);
  const [castOnOpen, setCastOnOpen] = useState(false);
  const [castOnMode, setCastOnMode] = useState<"replace" | "add">("replace");
  const [needle, setNeedle] = useState<NeedleSpec>(
    () => initialPattern?.needle ?? DEFAULT_NEEDLE,
  );
  const [isPackOpen, setIsPackOpen] = useState(false);
  const [activeColor, setActiveColor] = useState<string>("coral");
  const [activeStitch, setActiveStitch] = useState<string>("knit");
  const [tool, setTool] = useState<Tool>("paint");
  const [selection, setSelection] = useState<{
    r0: number;
    c0: number;
    r1: number;
    c1: number;
  } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [sizeMenuOpen, setSizeMenuOpen] = useState(false);
  const [customW, setCustomW] = useState(
    String(seeded.charts[0]?.gridData[0]?.length ?? 14),
  );
  const [customH, setCustomH] = useState(String(seeded.charts[0]?.gridData.length ?? 14));
  const dragStart = useRef<{ r: number; c: number } | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const leftToolbarRef = useRef<HTMLElement>(null);
  const chatbotPanelRef = useRef<HTMLDivElement>(null);
  const sizeMenuRef = useRef<HTMLDivElement>(null);
  const yarnPaletteRef = useRef<HTMLDivElement>(null);

  const activeChart =
    charts.find((chart) => chart.id === activeChartId) ?? charts[0];
  const grid = activeChart?.gridData ?? emptyGrid(14, 14);
  const gridRows = grid.length;
  const gridCols = grid[0]?.length ?? 0;

  const patchActiveGrid = useCallback(
    (updater: (prev: EditorCell[][]) => EditorCell[][]) => {
      setCharts((prev) =>
        prev.map((chart) =>
          chart.id === activeChartId
            ? { ...chart, gridData: updater(chart.gridData) }
            : chart,
        ),
      );
    },
    [activeChartId],
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

  const applyColorPreset = useCallback(
    (presetId: string, colors: [string, string, string, string]) => {
      setActivePresetId(presetId);
      setActiveWorkshopPaletteId(null);
      setPaletteYarns((prev) =>
        prev.map((yarn, index) =>
          index < PALETTE_PRESET_SLOTS ? { ...yarn, hex: colors[index] } : yarn,
        ),
      );
    },
    [],
  );

  /** 공방 추천 팔레트 원터치 매핑 — 실 색상 3종을 한꺼번에 자동 전환 */
  const applyWorkshopPalette = useCallback(
    (paletteId: string, colors: [string, string, string]) => {
      setActiveWorkshopPaletteId(paletteId);
      setActivePresetId(null);
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

  const handlePointerDown = (r: number, c: number) => {
    if (tool === "paint" || tool === "eraser" || tool === "checker") {
      setIsDragging(true);
      applyCell(r, c);
      return;
    }
    dragStart.current = { r, c };
    setSelection({ r0: r, c0: c, r1: r, c1: c });
    setIsDragging(true);
  };

  const handlePointerEnter = (r: number, c: number) => {
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
  };

  const endDrag = () => {
    setIsDragging(false);
    dragStart.current = null;
  };

  const addYarnToPalette = (yarn: EditorYarn) => {
    setPaletteYarns((prev) => {
      if (prev.some((y) => y.id === yarn.id)) return prev;
      return [...prev, yarn];
    });
    setActiveColor(yarn.id);
  };

  const buildPatternPayload = () => ({
    id: patternId,
    title: title.trim() || t("editor.defaultTitle"),
    updatedAt: Date.now(),
    gridSize: Math.max(gridRows, gridCols),
    grid,
    needle,
    metadata: buildPatternMetadata({
      title: title.trim() || t("editor.defaultTitle"),
      author: "나",
      needle,
      totalStitches: gridCols,
      totalRows: gridRows,
    }),
  });

  const handleSave = () => {
    onSave(buildPatternPayload());
    setIsPackOpen(true);
  };

  const handleShareToCommunity = () => {
    onSave(buildPatternPayload());
    setIsPackOpen(true);
  };

  const handleGoVault = () => {
    onSave(buildPatternPayload());
    setIsPackOpen(false);
    onGoDashboard();
  };

  const handleAiMessage = useCallback(
    (message: string) => {
      const colorIds = paletteYarns.map((y) => y.id);
      patchActiveGrid((prev) => applyAiPatternFromMessage(prev, message, colorIds));
      const lower = message.toLowerCase();
      const untitled = t("editor.defaultTitle");
      if (lower.includes("가디건") || lower.includes("cardigan")) {
        setTitle((prev) => (prev === untitled ? "Cardigan" : prev));
      } else if (lower.includes("가을") || lower.includes("autumn")) {
        setTitle((prev) => (prev === untitled ? "Autumn" : prev));
      }
      return getTteuniReply(message);
    },
    [paletteYarns, t, patchActiveGrid],
  );

  const patternText = useMemo(() => {
    const lines: string[] = [];
    lines.push(`[뜨개러투게더 도안] ${gridCols}×${gridRows} 격자`);
    lines.push(`사용 바늘: ${formatNeedleBadge(needle)}${needleDetailLabel(needle) ? ` · ${needleDetailLabel(needle)}` : ""}`);
    lines.push(
      `사용 실: ${usedYarns.map((y) => `${y.label}(${y.fiberType})`).join(", ")}`,
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
  }, [grid, usedYarns, gridCols, gridRows, paletteYarns, needle]);

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

  const inSelection = (r: number, c: number) => {
    if (!selection) return false;
    const rMin = Math.min(selection.r0, selection.r1);
    const rMax = Math.max(selection.r0, selection.r1);
    const cMin = Math.min(selection.c0, selection.c1);
    const cMax = Math.max(selection.c0, selection.c1);
    return r >= rMin && r <= rMax && c >= cMin && c <= cMax;
  };

  const toolHint = t(`editor.toolHints.${tool}`);

  return (
    <div
      className="flex h-screen flex-col overflow-hidden bg-stone-800 font-sans text-stone-100"
      onPointerUp={endDrag}
      onPointerLeave={endDrag}
    >
      <EditorHeader
        title={title}
        onTitleChange={setTitle}
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
        onExit={onExit}
        onGoMypage={onGoDashboard}
        sizeMenuRef={sizeMenuRef}
      />

      <ChartTabs
        charts={charts}
        activeChartId={activeChartId}
        onSelect={handleSelectChart}
        onAdd={() => {
          setCastOnMode("add");
          setCastOnOpen(true);
        }}
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
            <p className="mb-2 font-sans text-xs font-normal uppercase tracking-wide text-stone-400">
              {t("editor.drawingTools")}
            </p>
            <div className="flex flex-col gap-2">
              {TOOLS.map((toolItem) => {
                const ToolIcon = toolItem.Icon;
                const isActive = tool === toolItem.id;
                return (
                  <button
                    key={toolItem.id}
                    type="button"
                    onClick={() => setTool(toolItem.id)}
                    title={t(`editor.tools.${toolItem.id}`)}
                    className={`flex items-center gap-2 px-3 py-2 font-sans text-sm font-normal ${
                      isActive ? editorChromeBtnActive : editorChromeBtn
                    }`}
                  >
                    <ToolIcon className="h-5 w-5 shrink-0" />
                    <span className="truncate">{t(`editor.tools.${toolItem.id}`)}</span>
                  </button>
                );
              })}
            </div>
            {tool === "select" && selection && (
              <button
                type="button"
                onClick={fillSelection}
                className={`mt-2 w-full px-3 py-2 font-sans text-sm font-normal ${editorChromeBtn}`}
              >
                {t("editor.fillSelection")}
              </button>
            )}
          </div>

          <div>
            <p className="mb-2 font-sans text-xs font-normal uppercase tracking-wide text-stone-400">
              {t("editor.symbolPalette")}
            </p>
            <div className="grid grid-cols-2 gap-1.5">
              {STITCHES.filter((s) => s.id !== "caston").map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setActiveStitch(s.id)}
                  className={`flex flex-col items-center px-1.5 py-2 font-sans text-xs font-normal ${
                    activeStitch === s.id ? editorChromeBtnActive : editorChromeBtn
                  }`}
                >
                  <span className="text-base">{s.symbol}</span>
                  <span className="mt-0.5 truncate text-[9px]">
                    {t(`editor.stitches.${s.id}`)}
                  </span>
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => {
                setCastOnMode("replace");
                setCastOnOpen(true);
              }}
              className={`mt-2 w-full px-3 py-2.5 font-sans text-xs font-normal ${editorChromeBtn}`}
            >
              {t("editor.castOnButton")}
            </button>
            <button
              type="button"
              onClick={() => {
                setCastOnMode("replace");
                setCastOnOpen(true);
              }}
              className={`mt-1.5 w-full px-3 py-2.5 font-sans text-xs font-normal ${editorChromeBtn}`}
            >
              {t("editor.gaugeButton")}
            </button>

            {/* 기호 팔레트 바로 아랫단 — 전문 공방 매칭 내추럴 컬러 추천 칩 */}
            <WorkshopPalettePanel
              activePaletteId={activeWorkshopPaletteId}
              onSelectPalette={applyWorkshopPalette}
            />
          </div>

          <div ref={yarnPaletteRef} className="relative">
            <p className="mb-2 font-sans text-xs font-normal uppercase tracking-wide text-stone-400">
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
            </div>
            <button
              type="button"
              onClick={() => setYarnSearchOpen((o) => !o)}
              className={`mt-2 w-full px-3 py-2 font-sans text-xs font-normal ${editorChromeBtn}`}
            >
              {t("editor.addYarn")}
            </button>
            <YarnSearchPopover
              open={yarnSearchOpen}
              onClose={() => setYarnSearchOpen(false)}
              onSelect={addYarnToPalette}
              existingIds={paletteYarnIds}
            />
          </div>

          <SelectionColorsPanel
            usedYarns={usedYarns}
            activeColorId={activeColor}
            onSelectColor={setActiveColor}
            onChangeColor={changeYarnColor}
            onDeleteFromCanvas={deleteColorFromCanvas}
          />

          <ColorPresetsSection
            activePresetId={activePresetId}
            onApply={applyColorPreset}
          />
        </aside>

        <main className="flex min-h-0 min-w-0 flex-1 flex-col items-center justify-center overflow-auto bg-[#F7F5F0] p-4 md:p-8">
        <div className="flex w-full max-w-full justify-center px-1">
          <div
            ref={canvasRef}
            className="flex aspect-square w-full max-w-[min(100%,32rem)] items-center justify-center rounded-3xl bg-white p-6 shadow-[0_20px_50px_rgba(0,0,0,0.06)]"
          >
            <div
              className="max-h-full max-w-full"
              style={{
                aspectRatio: `${gridCols} / ${gridRows}`,
                width: gridCols >= gridRows ? "100%" : "auto",
                height: gridRows > gridCols ? "100%" : "auto",
              }}
            >
              <div
                className="grid h-full w-full gap-px rounded-xl bg-stone-200/70 p-1"
                style={{
                  gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))`,
                }}
              >
                {grid.map((row, r) =>
                  row.map((cell, c) => {
                const selected = inSelection(r, c);
                const bgHex = colorMap[cell.colorId] ?? "#FFFFFF";
                const symbolColor = symbolColorForBackground(bgHex);
                return (
                  <button
                    key={`${r}-${c}`}
                    type="button"
                    className={`relative aspect-square w-full min-w-0 rounded-sm transition-colors ${
                      gridCols > 30
                        ? "text-[6px]"
                        : gridCols > 20
                          ? "text-[7px]"
                          : "text-[10px]"
                    }`}
                    style={{ backgroundColor: bgHex }}
                    onPointerDown={(e) => {
                      e.preventDefault();
                      handlePointerDown(r, c);
                    }}
                    onPointerEnter={() => handlePointerEnter(r, c)}
                  >
                    {selected && (
                      <span
                        className="pointer-events-none absolute inset-0 rounded-sm bg-coral/40"
                        aria-hidden
                      />
                    )}
                    <span
                      className="pointer-events-none relative z-[1] font-sans font-normal"
                      style={{ color: symbolColor }}
                    >
                      {stitchSymbol(cell.stitchId)}
                    </span>
                  </button>
                );
                  }),
                )}
              </div>
            </div>
          </div>
        </div>
        <p className="mt-3 font-seoyun text-sm font-normal text-stone-500">{toolHint}</p>
        </main>

        <EditorRightSidebar>
          <div className="scrollbar-thin flex h-full min-h-0 flex-col gap-4 overflow-x-hidden overflow-y-auto p-4 md:p-5">
            <div className={`${editorPanel} p-4`}>
              <p className="mb-1 font-sans text-sm font-bold text-white">바늘 사양 설정</p>
              <p className="mb-3 font-seoyun text-[11px] font-normal text-stone-400">
                코·단 수와 함께 도안에 묶이는 사용 바늘입니다.
              </p>
              <NeedleSpecFields value={needle} onChange={setNeedle} tone="dark" />
            </div>
            <FinishedWorkScanPanel
              grid={grid}
              colorMap={colorMap}
              onApply={(nextGrid, yarns) => {
                patchActiveGrid(() => nextGrid);
                setPaletteYarns(yarns);
              }}
            />
            <AiPreviewNavigator
              title={title}
              grid={grid}
              charts={charts}
              colorMap={colorMap}
              stitchSymbols={stitchSymbols}
              yarnMeta={usedYarns}
            />
            <div ref={chatbotPanelRef}>
              <TteuniChatbot onUserMessage={handleAiMessage} />
            </div>
            <div className={`relative min-w-0 p-4 ${editorPanel}`}>
              <div className="mb-2 flex shrink-0 items-center justify-between gap-2">
                <p className="font-sans text-xs font-normal uppercase tracking-wide text-stone-400">
                  {t("editor.narrativePreview")}
                </p>
                <button
                  type="button"
                  onClick={() => void copyPatternText()}
                  className={`relative flex h-8 w-8 items-center justify-center rounded-full ${editorChromeTone}`}
                  aria-label="서술형 텍스트 복사"
                  title={patternCopyDone ? "복사 완료!" : "복사하기"}
                >
                  {patternCopyDone ? (
                    <CheckFillIcon className="h-3.5 w-3.5 text-coral" />
                  ) : (
                    <CopyFillIcon className="h-3.5 w-3.5" />
                  )}
                  {patternCopyDone ? (
                    <span className="absolute -bottom-8 right-0 z-10 whitespace-nowrap rounded-full bg-stone-800 px-2.5 py-1 font-sans text-[10px] font-medium text-white shadow-md">
                      복사 완료!
                    </span>
                  ) : null}
                </button>
              </div>
              <pre className="scrollbar-thin max-h-[200px] min-w-0 overflow-x-hidden overflow-y-auto break-keep break-words whitespace-pre-wrap font-sans text-xs font-normal leading-relaxed text-stone-200 md:max-h-[240px]">
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
        onGoVault={handleGoVault}
      />
    </div>
  );
}
