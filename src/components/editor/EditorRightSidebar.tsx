import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
} from "react";
import { useTranslation } from "react-i18next";

const SIDEBAR_MIN = 240;
const SIDEBAR_MAX = 560;
const SIDEBAR_DEFAULT = 320;

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
  const dragRef = useRef<{ startX: number; startWidth: number } | null>(null);

  const onMouseDown = useCallback(
    (e: ReactMouseEvent<HTMLDivElement>) => {
      e.preventDefault();
      dragRef.current = {
        startX: e.clientX,
        startWidth: sidebarWidth,
      };
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    },
    [sidebarWidth],
  );

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const drag = dragRef.current;
      if (!drag) return;
      const next = drag.startWidth + (drag.startX - e.clientX);
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

  return (
    <div className="relative flex h-full max-h-[calc(100vh-4rem)] shrink-0 flex-col">
      <div
        role="separator"
        aria-orientation="vertical"
        aria-label={t("editor.sidebarResize")}
        onMouseDown={onMouseDown}
        className="absolute left-0 top-0 z-20 h-full w-1.5 cursor-col-resize hover:bg-coral/50"
      />

      <aside
        className="relative h-full overflow-hidden border-l border-stone-800/80 bg-stone-800"
        style={{ width: sidebarWidth }}
      >
        <div
          className="flex h-full min-h-0 min-w-0 flex-col overflow-hidden"
          style={{ width: sidebarWidth }}
        >
          {children}
        </div>
      </aside>
    </div>
  );
}
