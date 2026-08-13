import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type MutableRefObject,
} from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import * as THREE from "three";
import { RotateCcw, Ruler, ZoomIn, ZoomOut } from "lucide-react";
import type { EditorYarn } from "../../types/editorYarn.ts";
import type { EditorCell } from "../../utils/patternGrid.ts";
import type {
  ChartTargetPart,
  KnittingChart,
} from "../../types/knittingProject.ts";

export type KnitItemType =
  | "sweater"
  | "vest"
  | "beanie"
  | "blanket"
  | "socks";

export type KnitGauge = {
  stitches: number;
  rows: number;
};

const DEFAULT_CAMERA = [0, 0.4, 15] as const;
const MIN_DISTANCE = 4;
const MAX_DISTANCE = 40;
const STITCH_WIDTH = 0.28;
const STITCH_HEIGHT = 0.26;
const DX = STITCH_WIDTH * 0.83;
const DY = STITCH_HEIGHT * 0.72;
const TARGET_SPAN = 8.2;
const SLEEVE_COL_RATIO = 0.22;
const DEFAULT_GAUGE_STITCHES = 20;
const DEFAULT_GAUGE_ROWS = 28;
const GAUGE_SWATCH_CM = 10;
const GAUGE_MAX = 200;

const overlayBtnClass =
  "flex h-8 w-8 items-center justify-center rounded-full border border-slate-200/80 bg-white/80 text-slate-600 shadow-sm backdrop-blur-sm transition-colors hover:bg-white hover:text-coral";

/**
 * 메리노울 V자 꼬임 요철을 오프스크린 캔버스로 합성한 노멀 맵.
 * 별도 텍스처 파일 없이 브라우저 메모리에서 한 번만 생성한다.
 */
function generateMerinoNormalMap(): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas;

  ctx.fillStyle = "rgb(128, 128, 255)";
  ctx.fillRect(0, 0, 512, 512);

  const stitchW = 16;
  const stitchH = 24;

  for (let y = 0; y < 512; y += stitchH) {
    for (let x = 0; x < 512; x += stitchW) {
      const isOffset = (y / stitchH) % 2 === 0;
      const px = x + (isOffset ? 0 : stitchW / 2);

      ctx.fillStyle = "rgb(165, 115, 240)";
      ctx.beginPath();
      ctx.moveTo(px, y);
      ctx.lineTo(px + stitchW / 2, y + stitchH);
      ctx.lineTo(px + stitchW / 2 - 3, y + stitchH);
      ctx.lineTo(px - 3, y);
      ctx.fill();

      ctx.fillStyle = "rgb(90, 115, 240)";
      ctx.beginPath();
      ctx.moveTo(px + stitchW / 2, y + stitchH);
      ctx.lineTo(px + stitchW, y);
      ctx.lineTo(px + stitchW - 3, y);
      ctx.lineTo(px + stitchW / 2 - 3, y + stitchH);
      ctx.fill();

      for (let i = 0; i < 8; i++) {
        const noiseX = px + Math.random() * stitchW;
        const noiseY = y + Math.random() * stitchH;
        const noiseVal = 128 + Math.floor(Math.random() * 30 - 15);
        ctx.fillStyle = `rgb(${noiseVal}, ${noiseVal}, 255)`;
        ctx.fillRect(noiseX, noiseY, 1.5, 1.5);
      }
    }
  }
  return canvas;
}

function createMerinoNormalTexture(): THREE.CanvasTexture {
  const texture = new THREE.CanvasTexture(generateMerinoNormalMap());
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(4, 4);
  texture.colorSpace = THREE.NoColorSpace;
  return texture;
}

const gaugeInputClass =
  "w-8 [appearance:textfield] rounded-md border border-pink-100 bg-white py-0.5 text-center font-sans text-xs font-semibold text-pink-deep outline-none transition-colors focus:border-coral focus:ring-1 focus:ring-coral/20 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none";

export type Knitting3DPreviewProps = {
  grid?: EditorCell[][];
  gridData?: EditorCell[][];
  colorMap?: Record<string, string>;
  stitchSymbols?: Record<string, string>;
  className?: string;
  itemType?: KnitItemType;
  gauge?: KnitGauge;
  yarnMeta?: EditorYarn[];
  active?: boolean;
  charts?: KnittingChart[];
};

type PreviewControls = {
  zoomIn: () => void;
  zoomOut: () => void;
  reset: () => void;
};

type ColumnSplit = {
  leftCount: number;
  bodyStart: number;
  bodyEnd: number;
};

type Placement = {
  index: number;
  cell: EditorCell;
  x: number;
  y: number;
  z: number;
  nx: number;
  ny: number;
  nz: number;
  tx: number;
  ty: number;
  tz: number;
  twist: number;
};

function createFallbackGrid(): EditorCell[][] {
  const rows = 24;
  const cols = 32;
  return Array.from({ length: rows }, (_, r) => {
    const t = rows <= 1 ? 0 : r / (rows - 1);
    return Array.from({ length: cols }, (_, c) => {
      if (t > 0.9) return { colorId: "#1E3A5F", stitchId: "purl" };
      if (t > 0.3 && t < 0.42) return { colorId: "#FC5F53", stitchId: "knit" };
      if (r % 2 === 1) return { colorId: "#E8DCC8", stitchId: "purl" };
      if ((c + r) % 7 === 0) return { colorId: "#FC5F53", stitchId: "yo" };
      return { colorId: "#E8DCC8", stitchId: "knit" };
    });
  });
}

const FALLBACK_GRID = createFallbackGrid();

function isEmptyGrid(data: EditorCell[][] | undefined): boolean {
  return !data || data.length === 0 || !data[0] || data[0].length === 0;
}

function resolveGrid(
  gridData: EditorCell[][] | undefined,
  grid: EditorCell[][] | undefined,
): EditorCell[][] {
  if (!isEmptyGrid(gridData)) return gridData as EditorCell[][];
  if (!isEmptyGrid(grid)) return grid as EditorCell[][];
  return FALLBACK_GRID;
}

function designExtent(
  gridData: EditorCell[][] | undefined,
  grid: EditorCell[][] | undefined,
): { cols: number; rows: number } {
  const source = !isEmptyGrid(gridData)
    ? gridData
    : !isEmptyGrid(grid)
      ? grid
      : null;
  if (!source) return { cols: 0, rows: 0 };
  const rows = source.length;
  const cols = source[0]?.length ?? 0;
  return {
    cols: Number.isFinite(cols) && cols > 0 ? cols : 0,
    rows: Number.isFinite(rows) && rows > 0 ? rows : 0,
  };
}

function clampGauge(value: number, fallback: number): number {
  if (!Number.isFinite(value) || value <= 0) return fallback;
  return Math.min(Math.round(value), GAUGE_MAX);
}

function normalizeGauge(gauge?: KnitGauge): KnitGauge {
  return {
    stitches: clampGauge(gauge?.stitches ?? DEFAULT_GAUGE_STITCHES, DEFAULT_GAUGE_STITCHES),
    rows: clampGauge(gauge?.rows ?? DEFAULT_GAUGE_ROWS, DEFAULT_GAUGE_ROWS),
  };
}

function sizeCm(count: number, gauge: number, fallbackGauge: number): string {
  const safeCount = Number.isFinite(count) && count > 0 ? count : 0;
  const safeGauge = clampGauge(gauge, fallbackGauge);
  const cm = (safeCount * GAUGE_SWATCH_CM) / safeGauge;
  if (!Number.isFinite(cm)) return "0.0";
  return cm.toFixed(1);
}

function resolveColor(
  cell: EditorCell | undefined,
  colorMap: Record<string, string>,
): string {
  const id = cell?.colorId ?? "";
  if (id.startsWith("#")) return id;
  return colorMap[id] ?? "#F5EDE6";
}

function stitchScale(stitchId: string): number {
  if (stitchId === "empty") return 0;
  if (stitchId === "bobble") return 1.28;
  if (stitchId === "yo") return 1.12;
  if (stitchId === "k2tog" || stitchId === "ssk") return 0.84;
  if (stitchId === "purl") return 0.92;
  return 1;
}

function rowRadius(stitchCount: number): number {
  const count = Math.max(stitchCount, 1);
  return (count * DX) / (2 * Math.PI);
}

function yarnTwist(row: number, col: number): number {
  return ((row + col) % 2 === 0 ? 0.2 : -0.2) + row * 0.012;
}

function gridOfPart(
  charts: KnittingChart[] | undefined,
  part: ChartTargetPart,
): EditorCell[][] | undefined {
  if (!charts || charts.length === 0) return undefined;
  const found = charts.find((chart) => chart.targetPart === part);
  return found?.gridData && found.gridData.length > 0 ? found.gridData : undefined;
}

function splitColumns(cols: number): ColumnSplit {
  if (cols < 6) {
    return { leftCount: 0, bodyStart: 0, bodyEnd: cols };
  }
  const leftCount = Math.max(2, Math.round(cols * SLEEVE_COL_RATIO));
  return {
    leftCount,
    bodyStart: leftCount,
    bodyEnd: cols - leftCount,
  };
}

function liveCellsInRange(
  row: EditorCell[],
  start: number,
  end: number,
): { cell: EditorCell; col: number }[] {
  const live: { cell: EditorCell; col: number }[] = [];
  for (let c = start; c < end; c++) {
    const cell = row[c];
    if (!cell || cell.stitchId === "empty") continue;
    live.push({ cell, col: c });
  }
  return live;
}

function createKnitLoopGeometry(): THREE.BufferGeometry {
  const torus = new THREE.TorusGeometry(0.09, 0.05, 8, 16);
  torus.computeVertexNormals();
  return torus;
}

function applyBasis(
  dummy: THREE.Object3D,
  position: THREE.Vector3,
  normal: THREE.Vector3,
  tangent: THREE.Vector3,
  scale: number,
  xAxis: THREE.Vector3,
  yAxis: THREE.Vector3,
  zAxis: THREE.Vector3,
  twist = 0,
) {
  zAxis.copy(normal).normalize();
  yAxis.copy(tangent).normalize();
  xAxis.crossVectors(yAxis, zAxis);
  if (xAxis.lengthSq() < 1e-8) {
    xAxis.set(1, 0, 0);
  } else {
    xAxis.normalize();
  }
  yAxis.crossVectors(zAxis, xAxis).normalize();
  dummy.matrix.makeBasis(xAxis, yAxis, zAxis);
  if (Math.abs(twist) > 1e-6) {
    dummy.matrix.multiply(new THREE.Matrix4().makeRotationZ(twist));
  }
  dummy.matrix.scale(new THREE.Vector3(scale, scale, scale));
  dummy.matrix.setPosition(position);
}

function pushPlacement(
  placements: Placement[],
  index: number,
  cell: EditorCell,
  pos: THREE.Vector3,
  nrm: THREE.Vector3,
  tan: THREE.Vector3,
  twist = 0,
) {
  placements.push({
    index: index >= 0 ? index : placements.length,
    twist,
    cell,
    x: pos.x,
    y: pos.y,
    z: pos.z,
    nx: nrm.x,
    ny: nrm.y,
    nz: nrm.z,
    tx: tan.x,
    ty: tan.y,
    tz: tan.z,
  });
}

function placeBlanket(
  gridData: EditorCell[][],
  rows: number,
  cols: number,
  position: THREE.Vector3,
  normal: THREE.Vector3,
  tangent: THREE.Vector3,
  placements: Placement[],
) {
  const width = Math.max(cols - 1, 1) * DX;
  const depth = Math.max(rows - 1, 1) * DY;

  for (let r = 0; r < rows; r++) {
    const row = gridData[r] ?? [];
    const v = rows <= 1 ? 0.5 : r / (rows - 1);
    for (let c = 0; c < cols; c++) {
      const cell = row[c];
      if (!cell || cell.stitchId === "empty") continue;
      const u = cols <= 1 ? 0.5 : c / (cols - 1);
      const x = (u - 0.5) * width;
      const z = (v - 0.5) * depth;
      const y =
        Math.sin(u * Math.PI * 2.2) * 0.16 + Math.sin(v * Math.PI * 1.8) * 0.12;
      const dydx =
        (Math.cos(u * Math.PI * 2.2) * 0.16 * Math.PI * 2.2) / Math.max(width, 0.001);
      const dydz =
        (Math.cos(v * Math.PI * 1.8) * 0.12 * Math.PI * 1.8) / Math.max(depth, 0.001);
      position.set(x, y, z);
      normal.set(-dydx, 1, -dydz);
      tangent.set(0, 0, 1);
      pushPlacement(
        placements,
        -1,
        cell,
        position,
        normal,
        tangent,
        yarnTwist(r, c),
      );
    }
  }
}

function placeBeanie(
  gridData: EditorCell[][],
  rows: number,
  cols: number,
  position: THREE.Vector3,
  normal: THREE.Vector3,
  tangent: THREE.Vector3,
  placements: Placement[],
) {
  let brimCount = 1;
  const brimFrom = Math.floor(rows * 0.72);
  for (let r = brimFrom; r < rows; r++) {
    brimCount = Math.max(
      brimCount,
      liveCellsInRange(gridData[r] ?? [], 0, cols).length,
    );
  }
  const brimR = rowRadius(brimCount);

  for (let r = 0; r < rows; r++) {
    const row = gridData[r] ?? [];
    const live = liveCellsInRange(row, 0, cols);
    const v = rows <= 1 ? 1 : r / (rows - 1);
    const phi = THREE.MathUtils.lerp(0.1, Math.PI * 0.52, v);
    const ringR = Math.min(brimR * Math.sin(phi), rowRadius(live.length));
    const y = brimR * Math.cos(phi);
    const n = live.length;
    for (let i = 0; i < live.length; i++) {
      const { cell, col } = live[i];
      const theta = n <= 1 ? 0 : (i / n) * Math.PI * 2;
      position.set(Math.sin(theta) * ringR, y, Math.cos(theta) * ringR);
      normal.set(Math.sin(theta) * Math.sin(phi), Math.cos(phi), Math.cos(theta) * Math.sin(phi));
      tangent.set(
        Math.cos(phi) * Math.sin(theta),
        -Math.sin(phi),
        Math.cos(phi) * Math.cos(theta),
      );
      pushPlacement(
        placements,
        -1,
        cell,
        position,
        normal,
        tangent,
        yarnTwist(r, col),
      );
    }
  }
}

function placeBodyCylinder(
  gridData: EditorCell[][],
  rows: number,
  _cols: number,
  startCol: number,
  endCol: number,
  position: THREE.Vector3,
  normal: THREE.Vector3,
  tangent: THREE.Vector3,
  placements: Placement[],
  options?: { roundNeck?: boolean; hemRib?: boolean },
) {
  const bodyHeight = Math.max(rows - 1, 1) * DY;
  const yTop = bodyHeight / 2;
  const roundNeck = options?.roundNeck ?? true;
  const hemRib = options?.hemRib ?? true;

  for (let r = 0; r < rows; r++) {
    const row = gridData[r] ?? [];
    const live = liveCellsInRange(row, startCol, endCol);
    const n = live.length;
    const v = rows <= 1 ? 0 : r / (rows - 1);
    let radius = rowRadius(n);
    if (hemRib && v > 0.86) {
      const rib = (v - 0.86) / 0.14;
      radius *= 1 - 0.16 * rib * rib;
    }
    for (let i = 0; i < live.length; i++) {
      const { cell, col } = live[i];
      const theta = n <= 1 ? 0 : (i / n) * Math.PI * 2 - Math.PI;
      let y = yTop - r * DY;
      let ring = radius;
      if (roundNeck && v < 0.22) {
        const neckT = 1 - v / 0.22;
        const front = Math.max(0, Math.cos(theta));
        y -= front * neckT * DY * 2.4;
        ring *= 1 - front * neckT * 0.14;
      }
      position.set(Math.sin(theta) * ring, y, Math.cos(theta) * ring);
      normal.set(Math.sin(theta), 0, Math.cos(theta));
      tangent.set(0, 1, 0);
      pushPlacement(
        placements,
        -1,
        cell,
        position,
        normal,
        tangent,
        yarnTwist(r, col),
      );
    }
  }
}

function placeSleeveChart(
  gridData: EditorCell[][],
  sign: 1 | -1,
  attachRadius: number,
  shoulderY: number,
  sleeveLength: number,
  position: THREE.Vector3,
  normal: THREE.Vector3,
  tangent: THREE.Vector3,
  placements: Placement[],
) {
  const rows = Math.max(1, gridData.length);
  const drop = 0.32;
  const ax = Math.cos(drop);
  const ay = -Math.sin(drop);

  for (let r = 0; r < rows; r++) {
    const row = gridData[r] ?? [];
    const live = liveCellsInRange(row, 0, row.length);
    const n = live.length;
    const rowT = rows <= 1 ? 0 : r / (rows - 1);
    const dist = rowT * sleeveLength + attachRadius * 0.08;
    let radius = rowRadius(n);
    if (rowT > 0.84) {
      const cuff = (rowT - 0.84) / 0.16;
      radius *= 1 - 0.22 * cuff;
    }
    for (let i = 0; i < live.length; i++) {
      const { cell, col } = live[i];
      const phi = n <= 1 ? 0 : (i / n) * Math.PI * 2;
      position.set(
        sign * (attachRadius * 0.9 + dist * ax),
        shoulderY + dist * ay + Math.sin(phi) * radius,
        Math.cos(phi) * radius,
      );
      normal.set(0, Math.sin(phi), Math.cos(phi));
      tangent.set(sign * ax, ay, 0);
      pushPlacement(
        placements,
        -1,
        cell,
        position,
        normal,
        tangent,
        yarnTwist(r, col),
      );
    }
  }
}

function placeSweaterSleeves(
  gridData: EditorCell[][],
  rows: number,
  cols: number,
  split: ColumnSplit,
  position: THREE.Vector3,
  normal: THREE.Vector3,
  tangent: THREE.Vector3,
  placements: Placement[],
) {
  if (split.leftCount <= 0) return;

  const bodyHeight = Math.max(rows - 1, 1) * DY;
  const yTop = bodyHeight / 2;
  const sleeveLength = bodyHeight * 0.88;
  const armholeRow = Math.min(rows - 1, Math.round(rows * 0.12));
  const attachLive = liveCellsInRange(
    gridData[armholeRow] ?? [],
    split.bodyStart,
    split.bodyEnd,
  );
  const attachRadius = rowRadius(Math.max(attachLive.length, 8));
  const shoulderY = yTop - armholeRow * DY;
  const drop = 0.32;
  const ax = Math.cos(drop);
  const ay = -Math.sin(drop);

  for (let r = 0; r < rows; r++) {
    const row = gridData[r] ?? [];
    const rowT = rows <= 1 ? 0 : r / (rows - 1);
    const dist = rowT * sleeveLength + attachRadius * 0.08;

    const placeSleeve = (
      live: { cell: EditorCell; col: number }[],
      sign: 1 | -1,
    ) => {
      const n = live.length;
      let radius = rowRadius(n);
      if (rowT > 0.84) {
        const cuff = (rowT - 0.84) / 0.16;
        radius *= 1 - 0.22 * cuff;
      }
      for (let i = 0; i < live.length; i++) {
        const { cell, col } = live[i];
        const phi = n <= 1 ? 0 : (i / n) * Math.PI * 2;
        position.set(
          sign * (attachRadius * 0.9 + dist * ax),
          shoulderY + dist * ay + Math.sin(phi) * radius,
          Math.cos(phi) * radius,
        );
        normal.set(0, Math.sin(phi), Math.cos(phi));
        tangent.set(sign * ax, ay, 0);
        pushPlacement(
          placements,
          -1,
          cell,
          position,
          normal,
          tangent,
          yarnTwist(r, col),
        );
      }
    };

    placeSleeve(liveCellsInRange(row, 0, split.bodyStart), -1);
    placeSleeve(liveCellsInRange(row, split.bodyEnd, cols), 1);
  }
}

function placeCollar(
  gridData: EditorCell[][],
  yJoin: number,
  neckRadius: number,
  position: THREE.Vector3,
  normal: THREE.Vector3,
  tangent: THREE.Vector3,
  placements: Placement[],
) {
  const rows = Math.max(1, gridData.length);
  const collarH = Math.max(rows - 1, 1) * DY * 0.9;
  for (let r = 0; r < rows; r++) {
    const row = gridData[r] ?? [];
    const live = liveCellsInRange(row, 0, row.length);
    const n = live.length;
    const v = rows <= 1 ? 1 : r / (rows - 1);
    const yBase = yJoin + (1 - v) * collarH;
    for (let i = 0; i < live.length; i++) {
      const { cell, col } = live[i];
      const theta = n <= 1 ? 0 : (i / n) * Math.PI * 2;
      const front = Math.max(0, Math.cos(theta));
      const ring = neckRadius * (0.7 + 0.3 * v) * (1 - front * (1 - v) * 0.1);
      const y = yBase - front * (1 - v) * collarH * 0.5;
      position.set(Math.sin(theta) * ring, y, Math.cos(theta) * ring);
      normal.set(Math.sin(theta), 0.25, Math.cos(theta));
      tangent.set(0, 1, 0);
      pushPlacement(
        placements,
        -1,
        cell,
        position,
        normal,
        tangent,
        yarnTwist(r, col),
      );
    }
  }
}

function placeSocks(
  gridData: EditorCell[][],
  rows: number,
  cols: number,
  position: THREE.Vector3,
  normal: THREE.Vector3,
  tangent: THREE.Vector3,
  placements: Placement[],
) {
  const curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 2.55, 0),
    new THREE.Vector3(0, 1.25, 0),
    new THREE.Vector3(0, 0.42, 0.06),
    new THREE.Vector3(0, 0.12, 0.52),
    new THREE.Vector3(0, 0.14, 1.45),
    new THREE.Vector3(0, 0.16, 2.1),
  ]);
  const center = new THREE.Vector3();
  const binormal = new THREE.Vector3();
  const radial = new THREE.Vector3();
  const upHint = new THREE.Vector3();

  for (let r = 0; r < rows; r++) {
    const row = gridData[r] ?? [];
    const live = liveCellsInRange(row, 0, cols);
    const v = rows <= 1 ? 0 : r / (rows - 1);
    const toeTaper = v > 0.8 ? 1 - ((v - 0.8) / 0.2) * 0.42 : 1;
    const radius = rowRadius(live.length) * toeTaper;
    curve.getPointAt(v, center);
    curve.getTangentAt(v, tangent);
    upHint.set(0, Math.abs(tangent.y) > 0.92 ? 0 : 1, Math.abs(tangent.y) > 0.92 ? 1 : 0);
    normal.crossVectors(upHint, tangent);
    if (normal.lengthSq() < 1e-8) normal.set(1, 0, 0);
    else normal.normalize();
    binormal.crossVectors(tangent, normal).normalize();

    const n = live.length;
    for (let i = 0; i < live.length; i++) {
      const { cell, col } = live[i];
      const phi = n <= 1 ? 0 : (i / n) * Math.PI * 2;
      radial.copy(normal).multiplyScalar(Math.cos(phi) * radius);
      radial.addScaledVector(binormal, Math.sin(phi) * radius);
      position.copy(center).add(radial);
      const nrm = radial.clone().normalize();
      if (nrm.lengthSq() < 1e-8) nrm.copy(normal);
      pushPlacement(
        placements,
        -1,
        cell,
        position,
        nrm,
        tangent,
        yarnTwist(r, col),
      );
    }
  }
}

function buildPlacements(
  itemType: KnitItemType,
  gridData: EditorCell[][],
  charts?: KnittingChart[],
): Placement[] {
  const placements: Placement[] = [];
  const position = new THREE.Vector3();
  const normal = new THREE.Vector3();
  const tangent = new THREE.Vector3();
  const rows = Math.max(1, gridData.length);
  const cols = Math.max(1, gridData[0]?.length ?? 1);

  if (itemType === "blanket") {
    placeBlanket(gridData, rows, cols, position, normal, tangent, placements);
    return placements;
  }
  if (itemType === "beanie") {
    placeBeanie(gridData, rows, cols, position, normal, tangent, placements);
    return placements;
  }
  if (itemType === "socks") {
    placeSocks(gridData, rows, cols, position, normal, tangent, placements);
    return placements;
  }

  const bodyGrid = gridOfPart(charts, "body") ?? gridData;
  const sleeveL = gridOfPart(charts, "sleeveLeft");
  const sleeveR = gridOfPart(charts, "sleeveRight");
  const collarGrid = gridOfPart(charts, "collar");
  const bodyRows = Math.max(1, bodyGrid.length);
  const bodyCols = Math.max(1, bodyGrid[0]?.length ?? 1);
  const dedicatedSleeves = Boolean(sleeveL || sleeveR);
  const withSleeves = itemType === "sweater";

  if (dedicatedSleeves || itemType === "vest") {
    placeBodyCylinder(
      bodyGrid,
      bodyRows,
      bodyCols,
      0,
      bodyCols,
      position,
      normal,
      tangent,
      placements,
      { roundNeck: true, hemRib: true },
    );
  } else {
    const split = splitColumns(bodyCols);
    placeBodyCylinder(
      bodyGrid,
      bodyRows,
      bodyCols,
      split.bodyStart,
      split.bodyEnd,
      position,
      normal,
      tangent,
      placements,
      { roundNeck: true, hemRib: true },
    );
    if (withSleeves) {
      placeSweaterSleeves(
        bodyGrid,
        bodyRows,
        bodyCols,
        split,
        position,
        normal,
        tangent,
        placements,
      );
    }
  }

  if (withSleeves && dedicatedSleeves) {
    const bodyHeight = Math.max(bodyRows - 1, 1) * DY;
    const yTop = bodyHeight / 2;
    const armholeRow = Math.min(bodyRows - 1, Math.round(bodyRows * 0.12));
    const attachLive = liveCellsInRange(bodyGrid[armholeRow] ?? [], 0, bodyCols);
    const attachRadius = rowRadius(Math.max(attachLive.length, 8));
    const shoulderY = yTop - armholeRow * DY;
    const sleeveLength = bodyHeight * 0.88;
    const left = sleeveL ?? sleeveR;
    const right = sleeveR ?? sleeveL;
    if (left) {
      placeSleeveChart(
        left,
        -1,
        attachRadius,
        shoulderY,
        sleeveLength,
        position,
        normal,
        tangent,
        placements,
      );
    }
    if (right) {
      placeSleeveChart(
        right,
        1,
        attachRadius,
        shoulderY,
        sleeveLength,
        position,
        normal,
        tangent,
        placements,
      );
    }
  }

  if (collarGrid) {
    const bodyHeight = Math.max(bodyRows - 1, 1) * DY;
    const yTop = bodyHeight / 2;
    const neckLive = liveCellsInRange(bodyGrid[0] ?? [], 0, bodyCols);
    const neckRadius = rowRadius(Math.max(neckLive.length, 8)) * 0.72;
    placeCollar(
      collarGrid,
      yTop,
      neckRadius,
      position,
      normal,
      tangent,
      placements,
    );
  }

  return placements;
}

function KnitSurface({
  itemType,
  gridData,
  charts,
  colorMap,
}: {
  itemType: KnitItemType;
  gridData: EditorCell[][];
  charts?: KnittingChart[];
  colorMap: Record<string, string>;
}) {
  const instancedMeshRef = useRef<THREE.InstancedMesh>(null);
  const geometry = useMemo(() => createKnitLoopGeometry(), []);
  const merinoNormal = useMemo(() => createMerinoNormalTexture(), []);
  const invalidate = useThree((state) => state.invalidate);
  const placements = useMemo(
    () => buildPlacements(itemType, gridData, charts),
    [itemType, gridData, charts],
  );
  const count = Math.max(placements.length, 1);

  useEffect(() => {
    const mesh = instancedMeshRef.current;
    if (!mesh) return;

    const dummy = new THREE.Object3D();
    dummy.matrixAutoUpdate = false;
    const color = new THREE.Color();
    const position = new THREE.Vector3();
    const normal = new THREE.Vector3();
    const tangent = new THREE.Vector3();
    const xAxis = new THREE.Vector3();
    const yAxis = new THREE.Vector3();
    const zAxis = new THREE.Vector3();
    const hidden = new THREE.Matrix4().makeScale(0, 0, 0);

    let minX = 0;
    let maxX = 0;
    let minY = 0;
    let maxY = 0;
    let minZ = 0;
    let maxZ = 0;
    if (placements.length > 0) {
      minX = maxX = placements[0].x;
      minY = maxY = placements[0].y;
      minZ = maxZ = placements[0].z;
      for (const p of placements) {
        minX = Math.min(minX, p.x);
        maxX = Math.max(maxX, p.x);
        minY = Math.min(minY, p.y);
        maxY = Math.max(maxY, p.y);
        minZ = Math.min(minZ, p.z);
        maxZ = Math.max(maxZ, p.z);
      }
    }

    const span = Math.max(maxX - minX, maxY - minY, maxZ - minZ, 1);
    const fit = TARGET_SPAN / span;
    const ox = -(minX + maxX) / 2;
    const oy = -(minY + maxY) / 2;
    const oz = -(minZ + maxZ) / 2;

    for (let i = 0; i < count; i++) {
      mesh.setMatrixAt(i, hidden);
      color.set("#F5EDE6");
      mesh.setColorAt(i, color);
    }

    for (const p of placements) {
      position.set((p.x + ox) * fit, (p.y + oy) * fit, (p.z + oz) * fit);
      normal.set(p.nx, p.ny, p.nz);
      tangent.set(p.tx, p.ty, p.tz);
      const scale = stitchScale(p.cell.stitchId) * STITCH_WIDTH * 1.2 * fit;
      applyBasis(
        dummy,
        position,
        normal,
        tangent,
        scale,
        xAxis,
        yAxis,
        zAxis,
        p.twist,
      );
      mesh.setMatrixAt(p.index, dummy.matrix);
      color.set(resolveColor(p.cell, colorMap));
      mesh.setColorAt(p.index, color);
    }

    instancedMeshRef.current.instanceMatrix.needsUpdate = true;
    if (instancedMeshRef.current.instanceColor) {
      instancedMeshRef.current.instanceColor.needsUpdate = true;
    }
    mesh.computeBoundingSphere();
    // frameloop="demand": 도안·배색 데이터가 바뀐 프레임만 다시 그리기 요청
    invalidate();
  }, [placements, colorMap, count, invalidate]);

  useEffect(() => {
    return () => {
      geometry.dispose();
      merinoNormal.dispose();
    };
  }, [geometry, merinoNormal]);

  return (
    <instancedMesh
      key={`${itemType}-${count}`}
      ref={instancedMeshRef}
      args={[geometry, undefined, count]}
      frustumCulled={false}
    >
      <meshStandardMaterial
        roughness={0.95}
        metalness={0.05}
        normalMap={merinoNormal}
        normalScale={new THREE.Vector2(1.5, 1.5)}
      />
    </instancedMesh>
  );
}

function CameraControls({
  apiRef,
}: {
  apiRef: MutableRefObject<PreviewControls | null>;
}) {
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const { camera, invalidate } = useThree();
  const animRef = useRef<number | null>(null);

  useEffect(() => {
    const cancelAnim = () => {
      if (animRef.current != null) {
        cancelAnimationFrame(animRef.current);
        animRef.current = null;
      }
    };

    const animateDistance = (targetDist: number) => {
      cancelAnim();
      const controls = controlsRef.current;
      if (!controls) return;

      const start = camera.position.clone();
      const target = controls.target.clone();
      const startOffset = start.clone().sub(target);
      const startDist = startOffset.length();
      const clamped = THREE.MathUtils.clamp(
        targetDist,
        MIN_DISTANCE,
        MAX_DISTANCE,
      );
      const t0 = performance.now();
      const duration = 220;

      const tick = (now: number) => {
        const t = Math.min(1, (now - t0) / duration);
        const eased = 1 - (1 - t) ** 3;
        const dist = THREE.MathUtils.lerp(startDist, clamped, eased);
        const offset = startOffset.clone().setLength(dist);
        camera.position.copy(target).add(offset);
        controls.update();
        invalidate();
        if (t < 1) {
          animRef.current = requestAnimationFrame(tick);
        } else {
          animRef.current = null;
        }
      };

      animRef.current = requestAnimationFrame(tick);
    };

    apiRef.current = {
      zoomIn: () => {
        const controls = controlsRef.current;
        if (!controls) return;
        const dist = camera.position.distanceTo(controls.target);
        animateDistance(dist * 0.72);
      },
      zoomOut: () => {
        const controls = controlsRef.current;
        if (!controls) return;
        const dist = camera.position.distanceTo(controls.target);
        animateDistance(dist * 1.32);
      },
      reset: () => {
        cancelAnim();
        camera.position.set(...DEFAULT_CAMERA);
        camera.up.set(0, 1, 0);
        const controls = controlsRef.current;
        if (controls) {
          controls.target.set(0, 0, 0);
          controls.update();
        }
        invalidate();
      },
    };

    return () => {
      cancelAnim();
      apiRef.current = null;
    };
  }, [apiRef, camera]);

  return (
    <OrbitControls
      ref={controlsRef}
      enableZoom={true}
      makeDefault
      enableDamping
      dampingFactor={0.08}
      minDistance={MIN_DISTANCE}
      maxDistance={MAX_DISTANCE}
    />
  );
}

function widthLabel(itemType: KnitItemType): string {
  if (itemType === "beanie") return "머리 둘레";
  return "가로";
}

function heightLabel(itemType: KnitItemType): string {
  if (itemType === "beanie") return "깊이";
  return "세로";
}

function SizeGuidePanel({
  itemType,
  cols,
  rows,
  gaugeStitches,
  gaugeRows,
  yarnMeta,
  onGaugeStitches,
  onGaugeRows,
}: {
  itemType: KnitItemType;
  cols: number;
  rows: number;
  gaugeStitches: number;
  gaugeRows: number;
  yarnMeta: EditorYarn[];
  onGaugeStitches: (value: number) => void;
  onGaugeRows: (value: number) => void;
}) {
  const widthCm = sizeCm(cols, gaugeStitches, DEFAULT_GAUGE_STITCHES);
  const heightCm = sizeCm(rows, gaugeRows, DEFAULT_GAUGE_ROWS);
  const fibers =
    yarnMeta.length > 0
      ? [...new Set(yarnMeta.map((y) => y.fiberType))].join(" · ")
      : "—";
  const textures =
    yarnMeta.length > 0
      ? [...new Set(yarnMeta.map((y) => y.texture))].join(", ")
      : "";

  return (
    <div className="border-t border-pink-100 bg-white/90 p-3">
      <div className="mb-2 flex flex-wrap items-center gap-1.5">
        <Ruler
          className="h-3.5 w-3.5 shrink-0 text-pink-deep"
          strokeWidth={2}
          aria-hidden
        />
        <p className="font-sans text-xs font-bold text-pink-deep">
          완성 예상 사이즈
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="min-w-0">
          <p className="break-words font-sans text-xs font-semibold text-stone-700 sm:text-sm">
            {widthLabel(itemType)}: {widthCm}cm
          </p>
          <p className="font-sans text-[10px] font-normal text-stone-400">
            {cols}코
          </p>
        </div>
        <div className="min-w-0">
          <p className="break-words font-sans text-xs font-semibold text-stone-700 sm:text-sm">
            {heightLabel(itemType)}: {heightCm}cm
          </p>
          <p className="font-sans text-[10px] font-normal text-stone-400">
            {rows}단
          </p>
        </div>

        <div className="col-span-2 min-w-0">
          <p className="flex flex-wrap gap-x-2 gap-y-0.5 font-sans text-[10px] font-normal leading-snug text-stone-500">
            <span>실: {fibers}</span>
            {textures ? <span>질감: {textures}</span> : null}
            <span>바늘: —</span>
          </p>
        </div>

        <div className="col-span-2 flex flex-wrap items-center gap-1 font-sans text-[10px] font-normal text-stone-700">
          <span>게이지: 10cm당</span>
          <input
            type="number"
            min={1}
            max={GAUGE_MAX}
            value={gaugeStitches}
            onChange={(e) =>
              onGaugeStitches(
                clampGauge(Number(e.target.value), DEFAULT_GAUGE_STITCHES),
              )
            }
            className={gaugeInputClass}
            aria-label="10cm당 코 수"
          />
          <span>코 /</span>
          <input
            type="number"
            min={1}
            max={GAUGE_MAX}
            value={gaugeRows}
            onChange={(e) =>
              onGaugeRows(clampGauge(Number(e.target.value), DEFAULT_GAUGE_ROWS))
            }
            className={gaugeInputClass}
            aria-label="10cm당 단 수"
          />
          <span>단</span>
        </div>
      </div>
    </div>
  );
}

export default function Knitting3DPreview({
  grid,
  gridData,
  colorMap = {},
  itemType = "sweater",
  gauge,
  yarnMeta = [],
  charts = [],
  active = true,
}: Knitting3DPreviewProps) {
  const apiRef = useRef<PreviewControls | null>(null);
  const [gaugeState, setGaugeState] = useState<KnitGauge>(() =>
    normalizeGauge(gauge),
  );
  const pattern = useMemo(
    () => resolveGrid(gridData, grid),
    [gridData, grid],
  );
  const { cols, rows } = useMemo(
    () => designExtent(gridData, grid),
    [gridData, grid],
  );

  useEffect(() => {
    if (!gauge) return;
    setGaugeState(normalizeGauge(gauge));
  }, [gauge, gauge?.stitches, gauge?.rows]);

  useEffect(() => {
    apiRef.current?.reset();
  }, [itemType]);

  return (
    <div className="flex w-full min-w-0 flex-col overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
      <div className="relative h-[300px] w-full min-h-[220px] min-w-0 shrink-0 overflow-hidden">
        {active ? (
          <Canvas
            className="absolute inset-0 block h-full w-full"
            style={{ width: "100%", height: "100%", display: "block" }}
            frameloop="demand"
            resize={{ offsetSize: true, debounce: 0, scroll: false }}
            dpr={[1, 2]}
            gl={{ antialias: true, alpha: true }}
            camera={{ position: [0, 0.4, 15], fov: 50 }}
          >
            <ambientLight intensity={1.1} />
            <directionalLight position={[5, 6, 8]} intensity={1.6} />
            <directionalLight position={[-6, 3, -8]} intensity={0.35} />
            <pointLight position={[-10, 10, -10]} intensity={0.5} />
            <KnitSurface
              itemType={itemType}
              gridData={pattern}
              charts={charts}
              colorMap={colorMap}
            />
            <CameraControls apiRef={apiRef} />
          </Canvas>
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-slate-50 text-[11px] text-stone-400">
            미리보기 일시 정지
          </div>
        )}

        {active && (
          <div className="absolute right-3 top-3 z-20 flex flex-col gap-2">
            <button
              type="button"
              className={overlayBtnClass}
              onClick={() => apiRef.current?.zoomIn()}
              aria-label="Zoom in"
              title="Zoom in"
            >
              <ZoomIn className="h-4 w-4" strokeWidth={1.75} aria-hidden />
            </button>
            <button
              type="button"
              className={overlayBtnClass}
              onClick={() => apiRef.current?.zoomOut()}
              aria-label="Zoom out"
              title="Zoom out"
            >
              <ZoomOut className="h-4 w-4" strokeWidth={1.75} aria-hidden />
            </button>
            <button
              type="button"
              className={overlayBtnClass}
              onClick={() => apiRef.current?.reset()}
              aria-label="Reset camera"
              title="Reset camera"
            >
              <RotateCcw className="h-4 w-4" strokeWidth={1.75} aria-hidden />
            </button>
          </div>
        )}
      </div>

      <SizeGuidePanel
        itemType={itemType}
        cols={cols}
        rows={rows}
        yarnMeta={yarnMeta}
        gaugeStitches={gaugeState.stitches}
        gaugeRows={gaugeState.rows}
        onGaugeStitches={(stitches) =>
          setGaugeState((prev) => ({ ...prev, stitches }))
        }
        onGaugeRows={(nextRows) =>
          setGaugeState((prev) => ({ ...prev, rows: nextRows }))
        }
      />
    </div>
  );
}
