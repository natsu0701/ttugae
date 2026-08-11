import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Check,
  Copy,
  Eraser,
  Grid2x2,
  Paintbrush,
  SquareDashedMousePointer,
  type LucideIcon,
} from "lucide-react";
import AiPreviewNavigator from "./components/editor/AiPreviewNavigator.tsx";
import ColorPresetsSection from "./components/editor/ColorPresetsSection.tsx";
import EditorHeader from "./components/editor/EditorHeader.tsx";
import CastOnModal from "./components/editor/CastOnModal.tsx";
import ColorChipMenu from "./components/editor/ColorChipMenu.tsx";
import SelectionColorsPanel from "./components/editor/SelectionColorsPanel.tsx";
import TteuniChatbot from "./components/editor/TteuniChatbot.tsx";
import EditorOnboardingSpotlight from "./components/editor/EditorOnboardingSpotlight.tsx";
import YarnSearchPopover from "./components/editor/YarnSearchPopover.tsx";
import { applyAiPatternFromMessage, getTteuniReply } from "./utils/aiPatternApply.ts";
import Button from "./components/ui/Button.tsx";
import { BASE_EDITOR_YARNS } from "./data/baseEditorYarns.ts";
import type { EditorYarn } from "./types/editorYarn.ts";
import { symbolColorForBackground } from "./utils/colorContrast.ts";
import {
  createRealisticDemoGrid,
  emptyGrid,
  resizeGrid,
  type EditorCell,
} from "./utils/patternGrid.ts";

const STITCHES = [
  { id: "empty", symbol: "·" },
  { id: "knit", symbol: "—" },
  { id: "purl", symbol: "∪" },
  { id: "yo", symbol: "○" },
  { id: "k2tog", symbol: "∧" },
  { id: "ssk", symbol: "∨" },
  { id: "bobble", symbol: "●" },
  { id: "slip", symbol: "/" },
  { id: "twist", symbol: "×" },
  { id: "caston", symbol: "+" },
] as const;

const MAX_GRID = 50;
const PALETTE_PRESET_SLOTS = 4;

type Tool = "paint" | "eraser" | "checker" | "select";

const TOOLS: { id: Tool; Icon: LucideIcon }[] = [
  { id: "paint", Icon: Paintbrush },
  { id: "eraser", Icon: Eraser },
  { id: "checker", Icon: Grid2x2 },
  { id: "select", Icon: SquareDashedMousePointer },
];

type PatternEditorProps = {
  initialPattern: {
    id: string;
    title: string;
    updatedAt: number;
    gridSize: number;
    grid: EditorCell[][];
  } | null;
  aiPreviewImage?: string;
  onSave: (pattern: {
    id: string;
    title: string;
    updatedAt: number;
    gridSize: number;
    grid: EditorCell[][];
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

function isCheckerCell(r: number, c: number) {
  return (r + c) % 2 === 0;
}

export default function PatternEditor({
  initialPattern,
  aiPreviewImage,
  onSave,
  onShare,
  onExit,
  onGoDashboard,
}: PatternEditorProps) {
  const { t } = useTranslation();
  const initial = initGrid(initialPattern);
  const defaultTitle = t("editor.defaultTitle");
  const [patternId] = useState<string>(
    initialPattern?.id ?? (crypto.randomUUID?.() ?? String(Date.now())),
  );
  const [title, setTitle] = useState<string>(initialPattern?.title ?? defaultTitle);
  const [gridRows, setGridRows] = useState(initial.rows);
  const [gridCols, setGridCols] = useState(initial.cols);
  const [grid, setGrid] = useState<EditorCell[][]>(initial.grid);
  const [paletteYarns, setPaletteYarns] = useState<EditorYarn[]>(() => [...BASE_EDITOR_YARNS]);
  const [yarnSearchOpen, setYarnSearchOpen] = useState(false);
  const [patternCopyDone, setPatternCopyDone] = useState(false);
  const [activePresetId, setActivePresetId] = useState<string | null>(null);
  const [castOnOpen, setCastOnOpen] = useState(false);
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
  const [customW, setCustomW] = useState(String(initial.cols));
  const [customH, setCustomH] = useState(String(initial.rows));
  const dragStart = useRef<{ r: number; c: number } | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const leftToolbarRef = useRef<HTMLElement>(null);
  const chatbotPanelRef = useRef<HTMLDivElement>(null);
  const sizeMenuRef = useRef<HTMLDivElement>(null);
  const yarnPaletteRef = useRef<HTMLDivElement>(null);

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

  const usedYarns = useMemo(() => {
    const ids = new Set<string>();
    grid.flat().forEach((cell) => {
      if (cell.stitchId !== "empty") ids.add(cell.colorId);
    });
    return [...ids]
      .map((id) => paletteYarns.find((y) => y.id === id))
      .filter((y): y is EditorYarn => Boolean(y));
  }, [grid, paletteYarns]);

  const changeYarnColor = useCallback((colorId: string, hex: string) => {
    const normalized = hex.toUpperCase();
    setPaletteYarns((prev) =>
      prev.map((y) => (y.id === colorId ? { ...y, hex: normalized } : y)),
    );
  }, []);

  const deleteColorFromCanvas = useCallback((colorId: string) => {
    setGrid((prev) =>
      prev.map((row) =>
        row.map((cell) =>
          cell.colorId === colorId
            ? { colorId: "white", stitchId: "empty" }
            : cell,
        ),
      ),
    );
    if (activeColor === colorId) setActiveColor("white");
  }, [activeColor]);

  const applyColorPreset = useCallback(
    (presetId: string, colors: [string, string, string, string]) => {
      setActivePresetId(presetId);
      setPaletteYarns((prev) =>
        prev.map((yarn, index) =>
          index < PALETTE_PRESET_SLOTS ? { ...yarn, hex: colors[index] } : yarn,
        ),
      );
    },
    [],
  );

  const applySize = useCallback((w: number, h: number) => {
    const cols = Math.min(MAX_GRID, Math.max(4, w));
    const rows = Math.min(MAX_GRID, Math.max(4, h));
    setGridCols(cols);
    setGridRows(rows);
    setCustomW(String(cols));
    setCustomH(String(rows));
    setGrid((prev) => resizeGrid(prev, rows, cols));
    setSelection(null);
    setSizeMenuOpen(false);
  }, []);

  const handleCastOnCanvas = useCallback((cols: number, rows: number) => {
    const c = Math.min(MAX_GRID, Math.max(4, cols));
    const r = Math.min(MAX_GRID, Math.max(4, rows));
    setGridCols(c);
    setGridRows(r);
    setCustomW(String(c));
    setCustomH(String(r));
    setGrid(emptyGrid(r, c));
    setSelection(null);
    setTitle(t("editor.defaultTitle"));
  }, [t]);

  const applyCell = useCallback(
    (r: number, c: number) => {
      setGrid((prev) => {
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
    [tool, activeColor, activeStitch],
  );

  const fillSelection = useCallback(() => {
    if (!selection) return;
    const { r0, c0, r1, c1 } = selection;
    const rMin = Math.min(r0, r1);
    const rMax = Math.max(r0, r1);
    const cMin = Math.min(c0, c1);
    const cMax = Math.max(c0, c1);
    setGrid((prev) => {
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
  }, [selection, activeColor, activeStitch, tool]);

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
  });

  const handleSave = () => {
    onSave(buildPatternPayload());
  };

  const handleShareToCommunity = () => {
    onShare({
      pattern: buildPatternPayload(),
      yarns: usedYarns.length > 0 ? usedYarns : paletteYarns.slice(0, 3),
      colorMap,
      gridRows,
      gridCols,
    });
  };

  const handleAiMessage = useCallback(
    (message: string) => {
      const colorIds = paletteYarns.map((y) => y.id);
      setGrid((prev) => applyAiPatternFromMessage(prev, message, colorIds));
      const lower = message.toLowerCase();
      const untitled = t("editor.defaultTitle");
      if (lower.includes("가디건") || lower.includes("cardigan")) {
        setTitle((prev) => (prev === untitled ? "Cardigan" : prev));
      } else if (lower.includes("가을") || lower.includes("autumn")) {
        setTitle((prev) => (prev === untitled ? "Autumn" : prev));
      }
      return getTteuniReply(message);
    },
    [paletteYarns, t],
  );

  const patternText = useMemo(() => {
    const lines: string[] = [];
    lines.push(`[뜨개러투게더 도안] ${gridCols}×${gridRows} 격자`);
    lines.push(
      `사용 실: ${usedYarns.map((y) => `${y.label}(${y.fiberType})`).join(", ")}`,
    );
    lines.push("");
    grid.forEach((row, ri) => {
      const rowText = row
        .map((cell) => {
          const stitch = STITCHES.find((s) => s.id === cell.stitchId);
          const yarn = paletteYarns.find((y) => y.id === cell.colorId);
          return `${stitch?.symbol ?? "·"}(${yarn?.label.slice(0, 2) ?? ""})`;
        })
        .join(" ");
      lines.push(`R${ri + 1}: ${rowText}`);
    });
    return lines.join("\n");
  }, [grid, usedYarns, gridCols, gridRows, paletteYarns]);

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

  const aiImageSrc = aiPreviewImage
    ? aiPreviewImage.startsWith("/")
      ? aiPreviewImage
      : `/images/${aiPreviewImage}`
    : undefined;

  const toolHint = t(`editor.toolHints.${tool}`);

  return (
    <div
      className="flex h-screen flex-col overflow-hidden bg-white font-sans text-gray-900"
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

      <CastOnModal
        open={castOnOpen}
        onClose={() => setCastOnOpen(false)}
        onApply={handleCastOnCanvas}
      />

      <EditorOnboardingSpotlight
        toolbarRef={leftToolbarRef}
        chatbotRef={chatbotPanelRef}
      />

      <div className="flex min-h-0 flex-1 overflow-hidden">
        <aside
          ref={leftToolbarRef}
          className="flex h-[calc(100vh-64px)] w-[200px] shrink-0 flex-col gap-4 overflow-y-auto bg-gray-50 p-3 md:p-4"
        >
          <div>
            <p className="mb-2 font-sans text-xs font-normal uppercase tracking-wide text-gray-500">
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
                    className={`flex items-center gap-2 rounded-full px-3 py-2 font-sans text-sm font-normal transition-colors duration-200 ${
                      isActive
                        ? "bg-coral text-white"
                        : "bg-white text-gray-700 hover:bg-black hover:text-white"
                    }`}
                  >
                    <ToolIcon className="h-5 w-5 shrink-0" strokeWidth={2} aria-hidden />
                    <span className="truncate">{t(`editor.tools.${toolItem.id}`)}</span>
                  </button>
                );
              })}
            </div>
            {tool === "select" && selection && (
              <Button variant="primary" fullWidth onClick={fillSelection} className="mt-2 px-3 py-2 text-sm">
                {t("editor.fillSelection")}
              </Button>
            )}
          </div>

          <div>
            <p className="mb-2 font-sans text-xs font-normal uppercase tracking-wide text-gray-500">
              {t("editor.symbolPalette")}
            </p>
            <div className="grid grid-cols-2 gap-1.5">
              {STITCHES.filter((s) => s.id !== "caston").map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setActiveStitch(s.id)}
                  className={`flex flex-col items-center rounded-xl px-1.5 py-2 font-sans text-xs font-normal transition-colors duration-200 ${
                    activeStitch === s.id
                      ? "bg-coral text-white"
                      : "bg-white text-gray-700 hover:bg-black hover:text-white"
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
              onClick={() => setCastOnOpen(true)}
              className="mt-2 w-full rounded-xl bg-white px-3 py-2.5 font-sans text-xs font-normal text-gray-700 transition-colors hover:bg-black hover:text-white"
            >
              {t("editor.castOnButton")}
            </button>
          </div>

          <div ref={yarnPaletteRef} className="relative">
            <p className="mb-2 font-sans text-xs font-normal uppercase tracking-wide text-gray-500">
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
              className="mt-2 w-full rounded-xl bg-white px-3 py-2 font-sans text-xs font-normal text-gray-700 transition-colors hover:bg-black hover:text-white"
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

        <main className="flex min-h-0 min-w-0 flex-1 flex-col items-center justify-center overflow-auto bg-white p-4 md:p-6">
        <div className="flex w-full max-w-full justify-center px-1">
          <div
            ref={canvasRef}
            className="w-full max-w-[min(100%,32rem)] rounded-2xl bg-gray-50 p-3"
          >
            <div
              className="w-full max-h-[min(70vh,32rem)]"
              style={{ aspectRatio: `${gridCols} / ${gridRows}` }}
            >
              <div
                className="grid h-full w-full gap-px rounded-xl bg-gray-200 p-1"
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
                      {STITCHES.find((s) => s.id === cell.stitchId)?.symbol}
                    </span>
                  </button>
                );
                  }),
                )}
              </div>
            </div>
          </div>
        </div>
        <p className="mt-3 font-rounded text-sm font-normal text-gray-500">{toolHint}</p>
        </main>

        <aside className="flex h-[calc(100vh-64px)] w-[280px] shrink-0 flex-col overflow-hidden bg-gray-50 md:w-[300px]">
          <div className="flex shrink-0 flex-col gap-4 overflow-y-auto p-4 md:p-5">
            <AiPreviewNavigator imageSrc={aiImageSrc} yarnMeta={usedYarns} />
            <div ref={chatbotPanelRef}>
              <TteuniChatbot onUserMessage={handleAiMessage} />
            </div>
          </div>

          <div className="flex min-h-0 flex-1 flex-col px-4 pb-4 md:px-5 md:pb-5">
            <div className="mb-2 flex shrink-0 items-center justify-between gap-2">
              <p className="font-sans text-xs font-normal uppercase tracking-wide text-gray-500">
                {t("editor.narrativePreview")}
              </p>
              <button
                type="button"
                onClick={() => void copyPatternText()}
                className={`flex items-center gap-1 rounded-full px-2.5 py-1.5 font-sans text-xs font-normal transition-colors duration-200 ${
                  patternCopyDone
                    ? "bg-coral/10 text-coral"
                    : "bg-white text-gray-600 hover:bg-black hover:text-white"
                }`}
                aria-label="서술형 텍스트 복사"
                title={patternCopyDone ? "복사 완료!" : "복사"}
              >
                {patternCopyDone ? (
                  <>
                    <Check className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden />
                    <span>복사 완료!</span>
                  </>
                ) : (
                  <Copy className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden />
                )}
              </button>
            </div>
            <pre className="min-h-[10rem] max-h-80 flex-1 overflow-y-auto rounded-2xl bg-white p-4 font-sans text-xs font-normal leading-relaxed text-gray-600 whitespace-pre-wrap">
              {patternText}
            </pre>
          </div>
        </aside>
      </div>
    </div>
  );
}
