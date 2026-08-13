import {
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useTranslation } from "react-i18next";
import { animate, motion, useMotionValue, useTransform } from "framer-motion";
import BrandTextLogo from "../ui/BrandTextLogo.tsx";
import Button from "../ui/Button.tsx";
import { UserFillIcon } from "../icons/FillIcons.tsx";
import { softShadow } from "../ui/tabButtonStyles.ts";

export type AppNavPage = "landing" | "community" | "mypage";

type AppShellProps = {
  currentPage: AppNavPage;
  isLoggedIn: boolean;
  children: ReactNode;
  onGoHome: () => void;
  onGoCommunity: () => void;
  onGoMypage: () => void;
  onGoEditor: () => void;
  onLogin: () => void;
};

const YARN_CORAL = "#FC5F53";
/** 텍스트 바깥으로 털실 아웃라인이 그려질 여백 */
const OUTLINE_PAD_X = 10;
const OUTLINE_PAD_Y = 5;
const OUTLINE_RADIUS = 12;

/** 상단 중앙에서 시작해 시계 방향으로 한 바퀴 감기는 둥근 사각형 경로 */
function roundedRectPath(w: number, h: number, radius: number): string {
  const r = Math.min(radius, w / 2, h / 2);
  return [
    `M ${w / 2} 0`,
    `H ${w - r}`,
    `A ${r} ${r} 0 0 1 ${w} ${r}`,
    `V ${h - r}`,
    `A ${r} ${r} 0 0 1 ${w - r} ${h}`,
    `H ${r}`,
    `A ${r} ${r} 0 0 1 0 ${h - r}`,
    `V ${r}`,
    `A ${r} ${r} 0 0 1 ${r} 0`,
    "Z",
  ].join(" ");
}

/**
 * 호버 시 메뉴 둘레를 따라 스르륵 감기는 핑크 털실 아웃라인.
 * - 점선(홈질) 스타일을 유지하려고 framer의 pathLength 대신
 *   마스크(solid stroke)의 dashoffset을 직접 보간해 점선 경로를 드러낸다.
 * - 털실 뭉치 마커는 같은 진행률로 getPointAtLength를 따라 이동.
 */
function YarnHoverOutline({
  width,
  height,
  hovered,
}: {
  width: number;
  height: number;
  hovered: boolean;
}) {
  const rawId = useId();
  const maskId = `yarn-wrap-${rawId.replace(/:/g, "")}`;
  const pathRef = useRef<SVGPathElement>(null);
  const [length, setLength] = useState(0);

  const d = useMemo(
    () => roundedRectPath(width, height, OUTLINE_RADIUS),
    [width, height],
  );

  useLayoutEffect(() => {
    setLength(pathRef.current?.getTotalLength() ?? 0);
  }, [d]);

  const progress = useMotionValue(0);

  useEffect(() => {
    const controls = animate(progress, hovered ? 1 : 0, {
      duration: hovered ? 0.55 : 0.35,
      ease: "easeInOut",
    });
    return () => controls.stop();
  }, [hovered, progress]);

  const dashOffset = useTransform(progress, (p) => length * (1 - p));
  const visibleOpacity = useTransform(progress, [0, 0.02, 1], [0, 1, 1]);
  const markerX = useTransform(progress, (p) =>
    pathRef.current && length > 0
      ? pathRef.current.getPointAtLength(p * length).x
      : 0,
  );
  const markerY = useTransform(progress, (p) =>
    pathRef.current && length > 0
      ? pathRef.current.getPointAtLength(p * length).y
      : 0,
  );

  if (width <= 0 || height <= 0) return null;

  return (
    <svg
      className="pointer-events-none absolute overflow-visible drop-shadow-[0_0_3px_rgba(255,255,255,0.9)]"
      style={{
        left: -OUTLINE_PAD_X,
        top: -OUTLINE_PAD_Y,
        width,
        height,
      }}
      viewBox={`0 0 ${width} ${height}`}
      aria-hidden
    >
      <mask
        id={maskId}
        maskUnits="userSpaceOnUse"
        x={-6}
        y={-6}
        width={width + 12}
        height={height + 12}
      >
        <motion.path
          ref={pathRef}
          d={d}
          fill="none"
          stroke="#FFFFFF"
          strokeWidth={6}
          strokeLinecap="round"
          strokeDasharray={length || 1}
          style={{ strokeDashoffset: dashOffset }}
        />
      </mask>

      {/* 점선 홈질 스타일의 털실 라인 — 마스크로 진행률만큼 드러남 */}
      <motion.path
        d={d}
        fill="none"
        stroke={YARN_CORAL}
        strokeWidth={2}
        strokeLinecap="round"
        strokeDasharray="6 3"
        mask={`url(#${maskId})`}
        style={{ opacity: visibleOpacity }}
      />

      {/* 감겨 들어가는 끝점의 털실 뭉치 마커 */}
      <motion.g style={{ x: markerX, y: markerY, opacity: visibleOpacity }}>
        <circle r={3} fill={YARN_CORAL} />
      </motion.g>
    </svg>
  );
}

/**
 * 내비 텍스트 링크
 * - 색상: duration-300으로 코랄(#FC5F53)까지 페이드
 * - 호버: 텍스트 둘레를 따라 점선 털실이 한 바퀴 감기는 드로잉 모션
 * - 현재 페이지는 털실 밑줄을 항상 표시
 */
function NavTextItem({
  label,
  active = false,
  overlay = false,
  onClick,
}: {
  label: string;
  active?: boolean;
  /** 투명 헤더(비디오 배경 위)에서 시인성 확보용 진한 글자색 */
  overlay?: boolean;
  onClick: () => void;
}) {
  const btnRef = useRef<HTMLButtonElement>(null);
  const [hovered, setHovered] = useState(false);
  const [box, setBox] = useState({ w: 0, h: 0 });

  useLayoutEffect(() => {
    const el = btnRef.current;
    if (!el) return;
    const measure = () =>
      setBox({
        w: el.offsetWidth + OUTLINE_PAD_X * 2,
        h: el.offsetHeight + OUTLINE_PAD_Y * 2,
      });
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <button
      ref={btnRef}
      type="button"
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
      className={[
        "relative inline-block py-1 font-sans text-sm font-normal",
        "transition-colors duration-300 ease-out",
        active
          ? "text-coral"
          : overlay
            ? "text-stone-800 hover:text-coral"
            : "text-gray-600 hover:text-coral",
        // 비디오 배경 위 시인성: 은은한 흰색 텍스트 그림자
        overlay ? "[text-shadow:0_1px_6px_rgba(255,255,255,0.9)]" : "",
        // 현재 페이지 표시용 털실 밑줄 (호버 효과는 YarnHoverOutline이 담당)
        "after:pointer-events-none after:absolute after:-bottom-0.5 after:left-0",
        "after:h-[3px] after:w-full after:origin-left after:rounded-full after:bg-coral",
        "after:transition-transform after:duration-300 after:ease-out",
        active ? "after:scale-x-100" : "after:scale-x-0",
      ].join(" ")}
    >
      <YarnHoverOutline width={box.w} height={box.h} hovered={hovered} />
      <span className="relative z-10">{label}</span>
    </button>
  );
}

const profileBtnClass = (active: boolean) =>
  `flex h-11 w-11 items-center justify-center rounded-full transition-colors duration-300 ${softShadow} ${
    active
      ? "bg-coral text-white"
      : "bg-white text-gray-700 hover:bg-coral hover:text-white"
  }`;

export default function AppShell({
  currentPage,
  isLoggedIn,
  children,
  onGoHome,
  onGoCommunity,
  onGoMypage,
  onGoEditor,
  onLogin,
}: AppShellProps) {
  const { t } = useTranslation();

  // 랜딩: 투명 헤더를 히어로 비디오 위에 오버레이 / 그 외: 흰 배경 sticky 헤더
  const isOverlayHeader = currentPage === "landing";

  return (
    <div className="relative min-h-screen bg-white font-sans text-gray-900">
      <header
        className={
          isOverlayHeader
            ? "absolute left-0 top-0 z-50 w-full border-none bg-transparent"
            : "sticky top-0 z-50 bg-white/95 backdrop-blur-sm"
        }
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 md:px-8">
          <button
            type="button"
            onClick={onGoHome}
            className="flex items-center transition-opacity duration-300 ease-out hover:opacity-80"
            aria-label={t("nav.brand")}
          >
            <BrandTextLogo className="h-7 w-auto object-contain md:h-8" />
          </button>

          <nav className="hidden items-center gap-6 md:flex">
            <NavTextItem
              label={t("nav.home")}
              active={currentPage === "landing"}
              overlay={isOverlayHeader}
              onClick={onGoHome}
            />
            <NavTextItem
              label={t("nav.community")}
              active={currentPage === "community"}
              overlay={isOverlayHeader}
              onClick={onGoCommunity}
            />
            <Button onClick={onGoEditor} className="px-5 py-2 text-sm">
              {t("nav.startEditor")}
            </Button>

            {isLoggedIn ? (
              <button
                type="button"
                onClick={onGoMypage}
                className={profileBtnClass(currentPage === "mypage")}
                aria-label={t("nav.mypageAria")}
              >
                <UserFillIcon className="h-6 w-6" />
              </button>
            ) : (
              <Button onClick={onLogin} className="px-4 py-2 text-sm">
                {t("nav.login")}
              </Button>
            )}
          </nav>

          <div className="flex items-center gap-4 md:hidden">
            <NavTextItem
              label={t("nav.community")}
              active={currentPage === "community"}
              overlay={isOverlayHeader}
              onClick={onGoCommunity}
            />
            {isLoggedIn ? (
              <button
                type="button"
                onClick={onGoMypage}
                className={profileBtnClass(currentPage === "mypage")}
                aria-label={t("nav.mypageAria")}
              >
                <UserFillIcon className="h-5 w-5" />
              </button>
            ) : (
              <Button onClick={onLogin} className="px-3 py-2 text-sm">
                {t("nav.login")}
              </Button>
            )}
          </div>
        </div>
      </header>

      {children}
    </div>
  );
}
