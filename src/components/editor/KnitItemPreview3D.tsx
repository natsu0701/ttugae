import {
  memo,
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type MutableRefObject,
  type ReactNode,
} from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { ContactShadows, OrbitControls } from "@react-three/drei";
import {
  CanvasTexture,
  CatmullRomCurve3,
  DoubleSide,
  NearestFilter,
  RepeatWrapping,
  SRGBColorSpace,
  Vector3,
} from "three";
import type { Group, Texture } from "three";

/**
 * 뜨개 아이템 3D 미리보기.
 * - 2D 도안 그리드(20×20 hex 배열) → 숨겨진 HTML5 Canvas → THREE.CanvasTexture
 *   실시간 변환 후 MeshStandardMaterial.map에 적용
 * - 코 수/단 수 슬라이더로 크기 조절 (감쇠 보간)
 * - 조명은 로컬 라이트만 사용 (CDN HDRI 의존성 제거 — 오프라인에서도 렌더 보장)
 */

export type KnitItemId = "blanket" | "beanie" | "sock" | "sweater";

const ITEMS: { id: KnitItemId; label: string }[] = [
  { id: "blanket", label: "블랭킷" },
  { id: "beanie", label: "비니" },
  { id: "sock", label: "양말" },
  { id: "sweater", label: "스웨터" },
];

/* ─────────────────── 2D 도안 그리드 (모의 데이터) ─────────────────── */

const GRID_SIZE = 20;
const BASE_COLOR = "#F5E9DA"; // 베이지
const ACCENT_COLORS = ["#FC5F53", "#FFB7C5", "#7EC8E3", "#A8C99B", "#C4B5FD"];

/** 베이지 바탕 + 핑크 하트 포인트가 들어간 초기 도안 */
function createInitialGrid(): string[][] {
  const grid = Array.from({ length: GRID_SIZE }, () =>
    Array.from({ length: GRID_SIZE }, () => BASE_COLOR),
  );
  // 단순 하트 모양 (행, 열) 좌표
  const heart: [number, number][] = [
    [6, 7], [6, 8], [6, 11], [6, 12],
    [7, 6], [7, 9], [7, 10], [7, 13],
    [8, 6], [8, 13],
    [9, 7], [9, 12],
    [10, 8], [10, 11],
    [11, 9], [11, 10],
  ];
  for (const [r, c] of heart) grid[r][c] = "#FC5F53";
  return grid;
}

/** 무작위 셀 일부를 포인트 컬러로 변경 (테스트용) */
function shuffleGrid(prev: string[][]): string[][] {
  const next = prev.map((row) => [...row]);
  const changes = 24;
  for (let i = 0; i < changes; i++) {
    const r = Math.floor(Math.random() * GRID_SIZE);
    const c = Math.floor(Math.random() * GRID_SIZE);
    next[r][c] =
      Math.random() < 0.35
        ? BASE_COLOR
        : ACCENT_COLORS[Math.floor(Math.random() * ACCENT_COLORS.length)];
  }
  return next;
}

/* ─────────────── HTML5 Canvas → THREE.CanvasTexture 변환 ─────────────── */

const CELL_PX = 8;

/** 아이템 형태별 텍스처 반복 횟수 */
const TEXTURE_REPEAT: Record<KnitItemId, [number, number]> = {
  blanket: [1, 1],
  beanie: [3, 1.2],
  sock: [2.5, 1],
  sweater: [2, 1],
};

/**
 * 2D 도안 배열을 숨겨진 캔버스에 그려 CanvasTexture로 변환하는 훅.
 * - 에디터 드래그처럼 grid가 연속 갱신돼도 requestAnimationFrame으로
 *   프레임당 1회로 스로틀링 (이전 예약은 취소하고 최신 grid만 그림)
 * - 그리기 완료 후 onDrawnRef를 호출해 on-demand 캔버스에 프레임을 요청
 */
function usePatternTexture(
  grid: string[][],
  item: KnitItemId,
  onDrawnRef: MutableRefObject<() => void>,
): CanvasTexture {
  const { canvas, ctx, texture } = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = GRID_SIZE * CELL_PX;
    canvas.height = GRID_SIZE * CELL_PX;
    const ctx = canvas.getContext("2d")!;

    const texture = new CanvasTexture(canvas);
    texture.colorSpace = SRGBColorSpace;
    texture.wrapS = RepeatWrapping;
    texture.wrapT = RepeatWrapping;
    // 도트(픽셀) 도안 느낌 유지 — 보간 없이 또렷하게
    texture.magFilter = NearestFilter;
    texture.minFilter = NearestFilter;
    texture.generateMipmaps = false;

    return { canvas, ctx, texture };
  }, []);

  // 그리드 변경 감지 → rAF 스로틀링된 캔버스 다시 그리기 → 텍스처 갱신
  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      for (let r = 0; r < grid.length; r++) {
        for (let c = 0; c < grid[r].length; c++) {
          ctx.fillStyle = grid[r][c] || BASE_COLOR;
          ctx.fillRect(c * CELL_PX, r * CELL_PX, CELL_PX, CELL_PX);
        }
      }
      texture.needsUpdate = true;
      onDrawnRef.current();
    });
    return () => cancelAnimationFrame(raf);
  }, [grid, ctx, canvas, texture, onDrawnRef]);

  // 아이템 형태에 맞춰 반복 횟수 조정
  useEffect(() => {
    const [rx, ry] = TEXTURE_REPEAT[item];
    texture.repeat.set(rx, ry);
    texture.needsUpdate = true;
    onDrawnRef.current();
  }, [item, texture, onDrawnRef]);

  useEffect(() => () => texture.dispose(), [texture]);

  return texture;
}

/* ─────────────────── 메쉬 ─────────────────── */

/** 발 모양 'L'자 곡선 — 모듈 로드 시 1회만 생성 */
const SOCK_CURVE = new CatmullRomCurve3([
  new Vector3(0, 1.05, 0),
  new Vector3(0, 0.4, 0),
  new Vector3(0, -0.25, 0.05),
  new Vector3(0.06, -0.62, 0.38),
  new Vector3(0.08, -0.68, 0.95),
]);

type MaterialProps = { wireframe: boolean; map: Texture };

function KnitMaterial({ wireframe, map }: MaterialProps) {
  return (
    <meshStandardMaterial
      color="#FFFFFF"
      map={map}
      roughness={0.85}
      metalness={0.02}
      wireframe={wireframe}
      side={DoubleSide}
    />
  );
}

function BlanketMesh(props: MaterialProps) {
  return (
    <mesh rotation={[-Math.PI / 2.6, 0, 0]} castShadow receiveShadow>
      <planeGeometry args={[2.4, 1.8, 20, 20]} />
      <KnitMaterial {...props} />
    </mesh>
  );
}

function BeanieMesh(props: MaterialProps) {
  return (
    <group position={[0, -0.35, 0]}>
      <mesh castShadow receiveShadow>
        <sphereGeometry args={[1, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <KnitMaterial {...props} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} castShadow receiveShadow>
        <torusGeometry args={[1, 0.12, 12, 32]} />
        <KnitMaterial {...props} />
      </mesh>
    </group>
  );
}

function SockMesh(props: MaterialProps) {
  return (
    <mesh position={[0, 0, -0.25]} castShadow receiveShadow>
      <tubeGeometry args={[SOCK_CURVE, 48, 0.3, 12, false]} />
      <KnitMaterial {...props} />
    </mesh>
  );
}

function SweaterMesh(props: MaterialProps) {
  return (
    <group position={[0, -0.1, 0]}>
      <mesh castShadow receiveShadow>
        <cylinderGeometry args={[0.62, 0.75, 1.5, 18]} />
        <KnitMaterial {...props} />
      </mesh>
      <mesh
        position={[-0.88, 0.42, 0]}
        rotation={[0, 0, Math.PI / 3.1]}
        castShadow
        receiveShadow
      >
        <cylinderGeometry args={[0.2, 0.26, 1.15, 12]} />
        <KnitMaterial {...props} />
      </mesh>
      <mesh
        position={[0.88, 0.42, 0]}
        rotation={[0, 0, -Math.PI / 3.1]}
        castShadow
        receiveShadow
      >
        <cylinderGeometry args={[0.2, 0.26, 1.15, 12]} />
        <KnitMaterial {...props} />
      </mesh>
    </group>
  );
}

function ItemMesh({
  item,
  ...materialProps
}: { item: KnitItemId } & MaterialProps) {
  switch (item) {
    case "blanket":
      return <BlanketMesh {...materialProps} />;
    case "beanie":
      return <BeanieMesh {...materialProps} />;
    case "sock":
      return <SockMesh {...materialProps} />;
    case "sweater":
      return <SweaterMesh {...materialProps} />;
  }
}

/* ─────────────────── 크기 보간 ─────────────────── */

const SIZE_BASE = 30;
const SIZE_MIN = 12;
const SIZE_MAX = 54;

/** 코 수(둘레/폭)·단 수(길이/높이) → 아이템별 축 스케일 */
function scaleTarget(
  item: KnitItemId,
  stitchScale: number,
  rowScale: number,
): [number, number, number] {
  switch (item) {
    case "blanket":
      return [stitchScale, rowScale, rowScale];
    case "beanie":
      return [stitchScale, rowScale, stitchScale];
    case "sock":
      return [stitchScale, rowScale, rowScale];
    case "sweater":
      return [stitchScale, rowScale, stitchScale];
  }
}

/** 목표 스케일로 감쇠 보간 — 슬라이더·아이템 전환 모두 부드럽게 */
function DampedGroup({
  target,
  children,
}: {
  target: [number, number, number];
  children: ReactNode;
}) {
  const ref = useRef<Group>(null);
  const targetRef = useRef(target);
  targetRef.current = target;
  const invalidate = useThree((state) => state.invalidate);

  useFrame((_, delta) => {
    if (!ref.current) return;
    const s = ref.current.scale;
    const [tx, ty, tz] = targetRef.current;
    const k = Math.min(1, delta * 7);
    s.x += (tx - s.x) * k;
    s.y += (ty - s.y) * k;
    s.z += (tz - s.z) * k;

    // frameloop="demand": 목표에 수렴할 때까지만 다음 프레임을 요청하고,
    // 수렴하면 요청을 멈춰 유휴 시 GPU/CPU 사용량 0%를 보장
    const error =
      Math.abs(tx - s.x) + Math.abs(ty - s.y) + Math.abs(tz - s.z);
    if (error > 0.001) invalidate();
  });

  return (
    <group
      ref={ref}
      scale={[target[0] * 0.55, target[1] * 0.55, target[2] * 0.55]}
    >
      {children}
    </group>
  );
}

/* ─────────────────── 씬 ─────────────────── */

/**
 * Canvas 바깥(usePatternTexture)에서 프레임을 요청할 수 있도록
 * R3F의 invalidate를 ref에 연결해 주는 브리지.
 */
function DemandInvalidateBridge({
  invalidateRef,
}: {
  invalidateRef: MutableRefObject<() => void>;
}) {
  const invalidate = useThree((state) => state.invalidate);

  useEffect(() => {
    invalidateRef.current = () => invalidate();
    invalidate();
    return () => {
      invalidateRef.current = () => {};
    };
  }, [invalidate, invalidateRef]);

  return null;
}

function PreviewScene({
  item,
  wireframe,
  target,
  patternTexture,
}: {
  item: KnitItemId;
  wireframe: boolean;
  target: [number, number, number];
  patternTexture: Texture;
}) {
  const invalidate = useThree((state) => state.invalidate);

  // 아이템·와이어프레임·슬라이더 등 props가 바뀌어 리렌더될 때마다 프레임 1회 요청
  useEffect(() => {
    invalidate();
  });

  return (
    <>
      {/* 따뜻한 스튜디오 느낌의 로컬 조명 (네트워크 HDRI 불필요) */}
      <hemisphereLight args={["#FFF6EC", "#D8CDC2", 0.65]} />
      <ambientLight intensity={0.25} />
      <directionalLight
        position={[3, 5, 4]}
        intensity={1.25}
        color="#FFF3E4"
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-near={1}
        shadow-camera-far={14}
        shadow-camera-left={-4}
        shadow-camera-right={4}
        shadow-camera-top={4}
        shadow-camera-bottom={-4}
      />
      <directionalLight position={[-4, 2, -3]} intensity={0.35} color="#E8F0FF" />

      <DampedGroup key={item} target={target}>
        <ItemMesh item={item} wireframe={wireframe} map={patternTexture} />
      </DampedGroup>

      <ContactShadows
        position={[0, -1.45, 0]}
        opacity={0.38}
        scale={9}
        blur={2.6}
        far={3.5}
        resolution={256}
        frames={Infinity}
      />

      {/* drei OrbitControls는 demand 모드에서 change 이벤트마다 자동 invalidate —
          드래그·줌 시에만 프레임이 그려지고 유휴 시 연산 0%가 되도록 autoRotate 제거 */}
      <OrbitControls
        enableDamping
        dampingFactor={0.08}
        minDistance={2}
        maxDistance={12}
      />
    </>
  );
}

/* ─────────────────── UI ─────────────────── */

function SizeSlider({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <label className="flex items-center gap-2">
      <span className="w-9 shrink-0 font-sans text-[11px] font-normal text-gray-600">
        {label}
      </span>
      <input
        type="range"
        min={SIZE_MIN}
        max={SIZE_MAX}
        step={1}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-1.5 min-w-0 flex-1 cursor-pointer accent-coral"
        aria-label={label}
      />
      <span className="w-7 shrink-0 text-right font-sans text-[11px] font-normal tabular-nums text-gray-500">
        {value}
      </span>
    </label>
  );
}

function KnitItemPreview3D() {
  const [item, setItem] = useState<KnitItemId>("blanket");
  const [wireframe, setWireframe] = useState(false);
  const [stitchCount, setStitchCount] = useState(SIZE_BASE);
  const [rowCount, setRowCount] = useState(SIZE_BASE);
  const [grid, setGrid] = useState<string[][]>(createInitialGrid);

  /** Canvas 내부의 invalidate가 브리지를 통해 연결됨 (연결 전엔 no-op) */
  const invalidateRef = useRef<() => void>(() => {});
  const patternTexture = usePatternTexture(grid, item, invalidateRef);

  const handleShuffle = useCallback(() => {
    setGrid((prev) => shuffleGrid(prev));
  }, []);

  const target = scaleTarget(item, stitchCount / SIZE_BASE, rowCount / SIZE_BASE);

  return (
    <div className="flex w-full flex-col gap-2">
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-2">
        <div
          className="inline-flex gap-0.5 rounded-full bg-gray-100 p-0.5"
          role="group"
          aria-label="아이템 선택"
        >
          {ITEMS.map((entry) => (
            <button
              key={entry.id}
              type="button"
              onClick={() => setItem(entry.id)}
              className={`rounded-full px-2 py-0.5 font-sans text-[11px] font-normal transition-colors duration-200 ${
                item === entry.id
                  ? "bg-coral text-white"
                  : "text-gray-600 hover:bg-black hover:text-white"
              }`}
              aria-pressed={item === entry.id}
            >
              {entry.label}
            </button>
          ))}
        </div>

        <label className="flex cursor-pointer select-none items-center gap-1.5">
          <span className="font-sans text-[11px] font-normal text-gray-600">
            와이어프레임
          </span>
          <button
            type="button"
            role="switch"
            aria-checked={wireframe}
            onClick={() => setWireframe((w) => !w)}
            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200 ${
              wireframe ? "bg-coral" : "bg-gray-300"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200 ${
                wireframe ? "translate-x-[18px]" : "translate-x-0.5"
              }`}
            />
          </button>
        </label>
      </div>

      <div className="flex shrink-0 flex-col gap-1.5 rounded-xl bg-gray-50 px-3 py-2">
        <SizeSlider label="코 수" value={stitchCount} onChange={setStitchCount} />
        <SizeSlider label="단 수" value={rowCount} onChange={setRowCount} />
      </div>

      <button
        type="button"
        onClick={handleShuffle}
        className="shrink-0 rounded-full bg-coral px-3 py-1.5 font-sans text-xs font-normal text-white transition-colors duration-200 hover:bg-black"
      >
        테스트용 도안 변경 (랜덤)
      </button>

      {/* Canvas 부모에 명시적 높이 필수 — 높이 0 붕괴 방지 */}
      <div className="h-[260px] w-full overflow-hidden rounded-xl bg-gray-100">
        <Canvas
          shadows
          frameloop="demand"
          dpr={[1, 1.5]}
          gl={{
            antialias: true,
            alpha: true,
            powerPreference: "low-power",
            stencil: false,
          }}
          camera={{ position: [0, 2.5, 6], fov: 50 }}
        >
          <DemandInvalidateBridge invalidateRef={invalidateRef} />
          <Suspense fallback={null}>
            <PreviewScene
              item={item}
              wireframe={wireframe}
              target={target}
              patternTexture={patternTexture}
            />
          </Suspense>
        </Canvas>
      </div>
    </div>
  );
}

export default memo(KnitItemPreview3D);
