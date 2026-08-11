import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
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

const navBtn =
  "font-sans text-sm font-normal transition-colors duration-200";

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

  const linkClass = (page: AppNavPage) =>
    `${navBtn} ${
      currentPage === page ? "text-coral" : "text-gray-600 hover:text-gray-900"
    }`;

  const profileBtnClass = (active: boolean) =>
    `flex h-11 w-11 items-center justify-center rounded-full transition-colors duration-200 ${softShadow} ${
      active
        ? "bg-coral text-white"
        : "bg-white text-gray-700 hover:bg-black hover:text-white"
    }`;

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900">
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 md:px-8">
          <button
            type="button"
            onClick={onGoHome}
            className="font-sans text-xl font-bold text-gray-900 transition-colors hover:text-coral"
          >
            {t("nav.brand")}
          </button>

          <nav className="hidden items-center gap-5 md:flex">
            <button type="button" onClick={onGoHome} className={linkClass("landing")}>
              {t("nav.home")}
            </button>
            <button
              type="button"
              onClick={onGoCommunity}
              className={linkClass("community")}
            >
              {t("nav.community")}
            </button>
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

          <div className="flex items-center gap-2 md:hidden">
            <button
              type="button"
              onClick={onGoCommunity}
              className={linkClass("community")}
            >
              {t("nav.community")}
            </button>
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
