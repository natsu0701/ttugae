import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
} from "react";
import { useTranslation } from "react-i18next";
import { ChevronLeftFillIcon, ChevronRightFillIcon } from "../icons/FillIcons.tsx";

const SIDEBAR_MIN = 240;
const SIDEBAR_MAX = 600;
const SIDEBAR_DEFAULT = 320;
const COLLAPSE_BELOW = 200;
const RESIZE_SYNC_MS = 300;

type EditorRightSidebarProps = {
  children: ReactNode;
};

function dispatchCanvasResize() {
  window.dispatchEvent(new Event("resize"));
}

export default function EditorRightSidebar({
  children,
}: EditorRightSidebarProps) {
  const { t } = useTranslation();
  const [sidebarWidth, setSidebarWidth] = useState(SIDEBAR_DEFAULT);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [contentMounted, setContentMounted] = useState(true);
  const dragRef = useRef<{ startX: number; startWidth: number } | null>(null);
  const rafLoopRef = useRef<number | null>(null);

  const stopResizeLoop = useCallback(() => {
    if (rafLoopRef.current != null) {
      cancelAnimationFrame(rafLoopRef.current);
      rafLoopRef.current = null;
    }
  }, []);

  const startResizeLoop = useCallback(
    (durationMs = RESIZE_SYNC_MS) => {
      stopResizeLoop();
      const startedAt = performance.now();
      const tick = (now: number) => {
        dispatchCanvasResize();
        if (now - startedAt < durationMs) {
          rafLoopRef.current = requestAnimationFrame(tick);
          return;
        }
        rafLoopRef.current = null;
        dispatchCanvasResize();
      };
      rafLoopRef.current = requestAnimationFrame(tick);
    },
    [stopResizeLoop],
  );

  const onMouseDown = useCallback(
    (e: ReactMouseEvent<HTMLDivElement>) => {
      e.preventDefault();
      dragRef.current = {
        startX: e.clientX,
        startWidth: isCollapsed ? 0 : sidebarWidth,
      };
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    },
    [isCollapsed, sidebarWidth],
  );

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const drag = dragRef.current;
      if (!drag) return;
      const next = drag.startWidth + (drag.startX - e.clientX);
      if (next < COLLAPSE_BELOW) {
        setIsCollapsed(true);
        return;
      }
      setIsCollapsed(false);
      setSidebarWidth(Math.min(SIDEBAR_MAX, Math.max(SIDEBAR_MIN, next)));
    };

    const onUp = () => {
      if (!dragRef.current) return;
      dragRef.current = null;
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      dispatchCanvasResize();
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, []);

  useEffect(() => {
    if (!isCollapsed) {
      setContentMounted(true);
      return;
    }
    const timer = window.setTimeout(() => setContentMounted(false), RESIZE_SYNC_MS + 50);
    return () => window.clearTimeout(timer);
  }, [isCollapsed]);

  useEffect(() => () => stopResizeLoop(), [stopResizeLoop]);

  const toggle = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      if (!next) setContentMounted(true);
      return next;
    });
    startResizeLoop(RESIZE_SYNC_MS);
  };

  return (
    <div className="relative flex h-full max-h-[calc(100vh-6rem)] shrink-0 flex-col">
      <button
        type="button"
        onClick={toggle}
        className="absolute -left-3 top-1/2 z-30 -translate-y-1/2 cursor-pointer rounded-full border border-stone-600/80 bg-stone-700 p-1 text-stone-100 transition-all hover:border-stone-500 hover:bg-stone-600 hover:text-white"
        aria-label={isCollapsed ? t("editor.sidebarOpen") : t("editor.sidebarClose")}
        title={isCollapsed ? t("editor.sidebarOpen") : t("editor.sidebarClose")}
      >
        {isCollapsed ? (
          <ChevronRightFillIcon className="h-4 w-4" />
        ) : (
          <ChevronLeftFillIcon className="h-4 w-4" />
        )}
      </button>

      <div
        role="separator"
        aria-orientation="vertical"
        aria-label={t("editor.sidebarResize")}
        onMouseDown={onMouseDown}
        className="absolute left-0 top-0 z-20 h-full w-1 cursor-col-resize transition-colors hover:bg-coral/40"
      />

      <aside
        className="relative h-full overflow-hidden border-l border-stone-800/80 bg-stone-800 transition-[width] duration-200 ease-out"
        style={{ width: isCollapsed ? 0 : sidebarWidth }}
        onTransitionEnd={() => {
          window.dispatchEvent(new Event("resize"));
          if (isCollapsed) setContentMounted(false);
        }}
      >
        {contentMounted ? (
          <div
            className="flex h-full min-h-0 min-w-0 flex-col overflow-hidden"
            style={{ width: sidebarWidth }}
          >
            {children}
          </div>
        ) : null}
      </aside>
    </div>
  );
}
