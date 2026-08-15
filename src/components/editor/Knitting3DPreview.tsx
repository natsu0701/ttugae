import { memo, Suspense, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { Html, OrbitControls, useGLTF } from "@react-three/drei";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import * as THREE from "three";
import { RotateFillIcon, SpinnerFillIcon, ZoomInFillIcon, ZoomOutFillIcon } from "../icons/FillIcons.tsx";
import type { EditorYarn } from "../../types/editorYarn.ts";
import type { EditorCell } from "../../utils/patternGrid.ts";
import type { KnittingChart } from "../../types/knittingProject.ts";

export type KnitItemType =
  | "sweater"
  | "vest"
  | "beanie"
  | "glove"
  | "socks";

const ITEM_TYPE_RULES: { type: KnitItemType; keywords: string[] }[] = [
  { type: "glove", keywords: ["장갑", "글러브", "glove", "mitten", "미튼"] },
  { type: "socks", keywords: ["양말", "삭스", "sock"] },
  { type: "beanie", keywords: ["비니", "털모자", "모자", "beanie", "hat"] },
  { type: "vest", keywords: ["조끼", "베스트", "vest"] },
  { type: "sweater", keywords: ["스웨터", "가디건", "sweater", "cardigan", "풀오버"] },
];

const ITEM_LOADING_NAME: Record<KnitItemType, string> = {
  sweater: "스웨터를",
  vest: "조끼를",
  beanie: "모자를",
  glove: "장갑을",
  socks: "양말을",
};

/** 도안 제목·설명에서 3D 미리보기 종류를 고릅니다. */
export function inferKnitItemType(...texts: Array<string | undefined>): KnitItemType {
  const hay = texts.filter(Boolean).join(" ").toLowerCase();
  for (const rule of ITEM_TYPE_RULES) {
    if (rule.keywords.some((kw) => hay.includes(kw))) return rule.type;
  }
  return "sweater";
}

function loadingCopy(itemType: KnitItemType) {
  return `뜨니가 실시간 3D ${ITEM_LOADING_NAME[itemType]} 준비하고 있어요...`;
}

export type KnitGauge = {
  stitches: number;
  rows: number;
};

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

let merinoNormalCanvas: HTMLCanvasElement | null = null;

function getMerinoNormalCanvas(): HTMLCanvasElement {
  if (!merinoNormalCanvas) merinoNormalCanvas = generateMerinoNormalMap();
  return merinoNormalCanvas;
}

function generateMerinoNormalMap(): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas;

  ctx.fillStyle = "rgb(128, 128, 255)";
  ctx.fillRect(0, 0, 512, 512);

  const stitchW = 8;
  const stitchH = 16;

  for (let y = 0; y < 512; y += stitchH) {
    for (let x = 0; x < 512; x += stitchW) {
      const isOffset = (y / stitchH) % 2 === 0;
      const px = x + (isOffset ? 0 : stitchW / 2);

      ctx.fillStyle = "rgb(165, 115, 240)";
      ctx.beginPath();
      ctx.moveTo(px, y);
      ctx.lineTo(px + stitchW / 2, y + stitchH);
      ctx.lineTo(px + stitchW / 2 - 2, y + stitchH);
      ctx.lineTo(px - 2, y);
      ctx.fill();

      ctx.fillStyle = "rgb(90, 115, 240)";
      ctx.beginPath();
      ctx.moveTo(px + stitchW / 2, y + stitchH);
      ctx.lineTo(px + stitchW, y);
      ctx.lineTo(px + stitchW - 2, y);
      ctx.lineTo(px + stitchW / 2 - 2, y + stitchH);
      ctx.fill();

      for (let i = 0; i < 4; i++) {
        const noiseX = px + Math.random() * stitchW;
        const noiseY = y + Math.random() * stitchH;
        const noiseVal = 128 + Math.floor(Math.random() * 20 - 10);
        ctx.fillStyle = `rgb(${noiseVal}, ${noiseVal}, 255)`;
        ctx.fillRect(noiseX, noiseY, 1, 1);
      }
    }
  }
  return canvas;
}

function cellHex(cell: EditorCell | undefined, colorMap: Record<string, string>): string {
  const id = cell?.colorId ?? "";
  if (id.startsWith("#")) return id;
  return colorMap[id] ?? "#FFFBF7";
}

function drawVLoop(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
) {
  const strokeW = Math.max(1.05, w * 0.16);
  const hiW = Math.max(0.55, w * 0.07);
  const left = x + w * 0.16;
  const right = x + w * 0.84;
  const top = y + h * 0.14;
  const midX = x + w * 0.5;
  const bot = y + h * 0.88;
  const ctrlY = y + h * 0.62;

  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  ctx.strokeStyle = "rgba(0,0,0,0.15)";
  ctx.lineWidth = strokeW;
  ctx.beginPath();
  ctx.moveTo(left, top);
  ctx.quadraticCurveTo(x + w * 0.34, ctrlY, midX, bot);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(right, top);
  ctx.quadraticCurveTo(x + w * 0.66, ctrlY, midX, bot);
  ctx.stroke();

  ctx.strokeStyle = "rgba(255,255,255,0.22)";
  ctx.lineWidth = hiW;
  ctx.beginPath();
  ctx.moveTo(left + w * 0.08, top + h * 0.05);
  ctx.quadraticCurveTo(x + w * 0.36, ctrlY - h * 0.04, midX - w * 0.04, bot - h * 0.08);
  ctx.stroke();
}

function drawVTripletCell(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  fill: string,
) {
  ctx.fillStyle = fill;
  ctx.fillRect(x, y, w, h);
  const subW = w / 3;
  for (let i = 0; i < 3; i++) {
    drawVLoop(ctx, x + i * subW, y, subW, h);
  }
}

function isFilledCell(cell: EditorCell | undefined): cell is EditorCell {
  return Boolean(cell && cell.stitchId && cell.stitchId !== "empty");
}

function filledBounds(cells: EditorCell[][]) {
  const rows = cells.length;
  const cols = cells[0]?.length ?? 0;
  let r0 = rows;
  let r1 = -1;
  let c0 = cols;
  let c1 = -1;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (!isFilledCell(cells[r]?.[c])) continue;
      r0 = Math.min(r0, r);
      r1 = Math.max(r1, r);
      c0 = Math.min(c0, c);
      c1 = Math.max(c1, c);
    }
  }
  if (r1 < 0) {
    return { r0: 0, r1: Math.max(0, rows - 1), c0: 0, c1: Math.max(0, cols - 1) };
  }
  return { r0, r1, c0, c1 };
}

function paintSymbolChart(
  ctx: CanvasRenderingContext2D,
  cells: EditorCell[][],
  colorMap: Record<string, string>,
  _stitchSymbols: Record<string, string>,
  canvasW: number,
  canvasH: number,
) {
  const rows = cells.length;
  const cols = cells[0]?.length ?? 0;
  if (rows === 0 || cols === 0) return;

  ctx.fillStyle = "#FFFBF7";
  ctx.fillRect(0, 0, canvasW, canvasH);

  const { r0, r1, c0, c1 } = filledBounds(cells);
  const usedRows = r1 - r0 + 1;
  const usedCols = c1 - c0 + 1;
  const cellW = canvasW / usedCols;
  const cellH = canvasH / usedRows;

  for (let r = r0; r <= r1; r++) {
    for (let c = c0; c <= c1; c++) {
      const cell = cells[r]?.[c];
      const cx = (c - c0) * cellW;
      const cy = (r - r0) * cellH;
      const filled = isFilledCell(cell);
      const color = filled ? cellHex(cell, colorMap) : "#FFFBF7";
      drawVTripletCell(ctx, cx, cy, cellW, cellH, color);
    }
  }
}

const GARMENT_MODELS: Record<KnitItemType, { url: string }> = {
  sweater: { url: "/models/sweater.glb" },
  vest: { url: "/models/vest.glb" },
  beanie: { url: "/models/beanie.glb" },
  glove: { url: "/models/glove.glb" },
  socks: { url: "/models/sock.glb" },
};

const TARGET_GARMENT_SIZE = 5.2;
const SWEATER_FIT_SCALE: [number, number, number] = [1.15, 1.0, 0.52];

function PreviewLoadingFallback({ itemType }: { itemType: KnitItemType }) {
  return (
    <Html center>
      <div className="flex flex-col items-center gap-3">
        <SpinnerFillIcon className="h-6 w-6 animate-spin text-coral" />
        <span className="whitespace-nowrap font-sans text-xs font-light text-stone-400">
          {loadingCopy(itemType)}
        </span>
      </div>
    </Html>
  );
}

type GarmentModelProps = {
  modelUrl: string;
  fitScale?: [number, number, number];
  cells: EditorCell[][];
  colorMap: Record<string, string>;
  stitchSymbols: Record<string, string>;
  chartKey: string;
  normalTexture: THREE.CanvasTexture;
};

function applyCoveringUVs(root: THREE.Object3D) {
  root.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(root);
  const size = box.getSize(new THREE.Vector3());
  const min = box.min;
  size.x = Math.max(size.x, 1e-4);
  size.y = Math.max(size.y, 1e-4);
  size.z = Math.max(size.z, 1e-4);

  const worldPos = new THREE.Vector3();
  const worldNrm = new THREE.Vector3();
  const normalMatrix = new THREE.Matrix3();

  root.traverse((child) => {
    if (!(child as THREE.Mesh).isMesh) return;
    const mesh = child as THREE.Mesh;
    let geometry = mesh.geometry.clone();
    if (geometry.index) {
      geometry = geometry.toNonIndexed();
    }
    if (!geometry.attributes.normal) {
      geometry.computeVertexNormals();
    }

    const position = geometry.attributes.position;
    const normal = geometry.attributes.normal;
    const uv = new Float32Array(position.count * 2);
    normalMatrix.getNormalMatrix(mesh.matrixWorld);

    for (let i = 0; i < position.count; i++) {
      worldPos.fromBufferAttribute(position, i).applyMatrix4(mesh.matrixWorld);
      worldNrm.fromBufferAttribute(normal, i).applyMatrix3(normalMatrix);
      const ax = Math.abs(worldNrm.x);
      const ay = Math.abs(worldNrm.y);
      const az = Math.abs(worldNrm.z);

      let u: number;
      let v: number;
      if (ax >= ay && ax >= az) {
        u = (worldPos.z - min.z) / size.z;
        v = (worldPos.y - min.y) / size.y;
      } else if (ay >= ax && ay >= az) {
        u = (worldPos.x - min.x) / size.x;
        v = (worldPos.z - min.z) / size.z;
      } else {
        u = (worldPos.x - min.x) / size.x;
        v = (worldPos.y - min.y) / size.y;
      }
      uv[i * 2] = THREE.MathUtils.clamp(u, 0, 1);
      uv[i * 2 + 1] = THREE.MathUtils.clamp(v, 0, 1);
    }

    geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
    if (geometry.hasAttribute("color")) geometry.deleteAttribute("color");
    mesh.geometry = geometry;
  });
}

function bindPatternMaterial(root: THREE.Object3D, normalMap: THREE.Texture) {
  applyCoveringUVs(root);

  root.traverse((child) => {
    if (!(child as THREE.Mesh).isMesh) return;
    const mesh = child as THREE.Mesh;
    mesh.frustumCulled = false;
    mesh.material = new THREE.MeshStandardMaterial({
      color: "#ffffff",
      roughness: 0.95,
      metalness: 0.04,
      side: THREE.DoubleSide,
      normalMap,
      normalScale: new THREE.Vector2(1.4, 1.4),
      envMapIntensity: 0.2,
    });
  });
}

function applyPatternMap(root: THREE.Object3D, map: THREE.Texture) {
  root.traverse((child) => {
    if (!(child as THREE.Mesh).isMesh) return;
    const mesh = child as THREE.Mesh;
    const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    for (const mat of materials) {
      if (!(mat instanceof THREE.MeshStandardMaterial)) continue;
      mat.map = map;
      mat.color.set("#ffffff");
      mat.emissive.set("#000000");
      mat.vertexColors = false;
      mat.aoMap = null;
      mat.metalnessMap = null;
      mat.roughnessMap = null;
      mat.emissiveMap = null;
      mat.alphaMap = null;
      mat.lightMap = null;
      mat.needsUpdate = true;
    }
  });
}

function GarmentModel({
  modelUrl,
  fitScale = [1, 1, 1],
  cells,
  colorMap,
  stitchSymbols,
  chartKey,
  normalTexture,
}: GarmentModelProps) {
  const wrapRef = useRef<THREE.Group>(null);
  const { scene } = useGLTF(modelUrl);
  const clonedScene = useMemo(() => {
    const clone = scene.clone(true);
    bindPatternMaterial(clone, normalTexture);
    return clone;
  }, [scene, normalTexture]);
  const invalidate = useThree((state) => state.invalidate);
  const [colorTexture, setColorTexture] = useState<THREE.CanvasTexture | null>(null);

  useLayoutEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;

    wrap.position.set(0, 0, 0);
    wrap.scale.set(1, 1, 1);
    wrap.rotation.set(0, 0, 0);
    wrap.updateWorldMatrix(true, true);

    const box = new THREE.Box3().setFromObject(wrap);
    if (box.isEmpty()) return;

    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z, 1e-4);
    const s = TARGET_GARMENT_SIZE / maxDim;

    wrap.scale.setScalar(s);
    wrap.position.set(-center.x * s, -center.y * s, -center.z * s);
    wrap.updateWorldMatrix(true, true);
    invalidate();
  }, [clonedScene, invalidate]);

  useEffect(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext("2d");
    if (!ctx || cells.length === 0) return;

    paintSymbolChart(ctx, cells, colorMap, stitchSymbols, canvas.width, canvas.height);

    const next = new THREE.CanvasTexture(canvas);
    next.colorSpace = THREE.SRGBColorSpace;
    next.minFilter = THREE.LinearFilter;
    next.magFilter = THREE.LinearFilter;
    next.wrapS = THREE.ClampToEdgeWrapping;
    next.wrapT = THREE.ClampToEdgeWrapping;
    next.needsUpdate = true;
    setColorTexture(next);

    return () => {
      next.dispose();
    };
  }, [cells, colorMap, stitchSymbols, chartKey]);

  useEffect(() => {
    if (!clonedScene || !colorTexture) return;
    applyPatternMap(clonedScene, colorTexture);
    invalidate();
  }, [clonedScene, colorTexture, invalidate]);

  return (
    <group ref={wrapRef}>
      <primitive object={clonedScene} scale={fitScale} />
    </group>
  );
}

function InvalidateOnChange({ value }: { value: string }) {
  const invalidate = useThree((state) => state.invalidate);
  useEffect(() => {
    invalidate();
  }, [value, invalidate]);
  return null;
}

function Knitting3DCanvas({
  cells,
  colorMap,
  stitchSymbols,
  chartKey,
  itemType,
  active,
}: {
  cells: EditorCell[][];
  colorMap: Record<string, string>;
  stitchSymbols: Record<string, string>;
  chartKey: string;
  itemType: KnitItemType;
  active: boolean;
}) {
  const garment = GARMENT_MODELS[itemType];
  const orbitRef = useRef<OrbitControlsImpl>(null);
  const [normalTexture, setNormalTexture] = useState<THREE.CanvasTexture | null>(null);

  useEffect(() => {
    const canvas = getMerinoNormalCanvas();
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(32, 32);
    texture.colorSpace = THREE.NoColorSpace;
    setNormalTexture(texture);
    return () => texture.dispose();
  }, []);

  const handleZoomIn = () => {
    const controls = orbitRef.current;
    if (!controls) return;
    controls.object.position.multiplyScalar(0.85);
    controls.update();
  };

  const handleZoomOut = () => {
    const controls = orbitRef.current;
    if (!controls) return;
    controls.object.position.multiplyScalar(1.15);
    controls.update();
  };

  useEffect(() => {
    orbitRef.current?.reset();
  }, [itemType]);

  const handleReset = () => {
    orbitRef.current?.reset();
  };

  return (
    <div className="relative h-[300px] min-h-[220px] w-full min-w-0 overflow-hidden bg-stone-700">
      {active ? (
        <Canvas
          className="absolute inset-0 block h-full w-full"
          camera={{ position: [0, 0, 8.5], fov: 45 }}
          frameloop="demand"
          dpr={[1, 2]}
          gl={{ antialias: true, alpha: true }}
        >
          <ambientLight intensity={1.45} />
          <pointLight position={[-10, 10, -10]} intensity={0.7} />
          <directionalLight position={[5, 6, 8]} intensity={1.9} />
          <Suspense fallback={<PreviewLoadingFallback itemType={itemType} />}>
            <InvalidateOnChange value={garment.url} />
            {normalTexture ? (
              <GarmentModel
                key={garment.url}
                modelUrl={garment.url}
                fitScale={itemType === "sweater" ? SWEATER_FIT_SCALE : [1, 1, 1]}
                cells={cells}
                colorMap={colorMap}
                stitchSymbols={stitchSymbols}
                chartKey={chartKey}
                normalTexture={normalTexture}
              />
            ) : null}
            <OrbitControls
              ref={orbitRef}
              enableZoom
              target={[0, 0, 0]}
              maxDistance={18}
              minDistance={1.4}
              makeDefault
            />
          </Suspense>
        </Canvas>
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-stone-700 text-[11px] text-stone-300">
          미리보기 일시 정지
        </div>
      )}

      {!normalTexture && active ? (
        <div className="absolute inset-0 z-[5] flex flex-col items-center justify-center gap-3 bg-stone-700 text-stone-300">
          <SpinnerFillIcon className="h-6 w-6 animate-spin text-coral" />
          <span className="font-sans text-xs font-light">
            {loadingCopy(itemType)}
          </span>
        </div>
      ) : null}

      {active ? (
        <div className="absolute right-3.5 top-3.5 z-10 flex flex-col gap-1.5">
          <button
            type="button"
            onClick={handleZoomIn}
            title="확대"
            className="rounded-xl border border-stone-600/80 bg-stone-700 p-2 text-stone-100 transition-colors hover:border-stone-500 hover:bg-stone-600 hover:text-white"
          >
            <ZoomInFillIcon className="h-[15px] w-[15px]" />
          </button>
          <button
            type="button"
            onClick={handleZoomOut}
            title="축소"
            className="rounded-xl border border-stone-600/80 bg-stone-700 p-2 text-stone-100 transition-colors hover:border-stone-500 hover:bg-stone-600 hover:text-white"
          >
            <ZoomOutFillIcon className="h-[15px] w-[15px]" />
          </button>
          <button
            type="button"
            onClick={handleReset}
            title="초기화"
            className="rounded-xl border border-stone-600/80 bg-stone-700 p-2 text-stone-100 transition-colors hover:border-stone-500 hover:bg-stone-600 hover:text-white"
          >
            <RotateFillIcon className="h-[15px] w-[15px]" />
          </button>
        </div>
      ) : null}
    </div>
  );
}

const EMPTY_CELL: EditorCell = { colorId: "white", stitchId: "empty" };

function Knitting3DPreview({
  grid,
  gridData,
  colorMap = {},
  stitchSymbols = {},
  itemType = "sweater",
  active = true,
}: Knitting3DPreviewProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  const pattern = useMemo(() => {
    const source = gridData && gridData.length > 0 ? gridData : grid;
    return source && source.length > 0 ? source : [[EMPTY_CELL]];
  }, [grid, gridData]);

  const chartKey = useMemo(
    () =>
      pattern
        .map((row) => row.map((cell) => `${cell.colorId}:${cell.stitchId}`).join(","))
        .join("|") +
      "|" +
      JSON.stringify(colorMap) +
      "|" +
      JSON.stringify(stitchSymbols),
    [pattern, colorMap, stitchSymbols],
  );

  useEffect(() => {
    const el = hostRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        setInView(true);
        io.disconnect();
      },
      { rootMargin: "120px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={hostRef}
      className="flex w-full min-w-0 flex-col overflow-hidden rounded-xl bg-stone-700"
    >
      {inView ? (
        <Knitting3DCanvas
          cells={pattern}
          colorMap={colorMap}
          stitchSymbols={stitchSymbols}
          chartKey={chartKey}
          itemType={itemType}
          active={active}
        />
      ) : (
        <div className="flex h-[300px] min-h-[220px] items-center justify-center">
          <SpinnerFillIcon className="h-6 w-6 animate-spin text-coral" />
        </div>
      )}
    </div>
  );
}

export default memo(Knitting3DPreview);
