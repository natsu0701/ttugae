import {
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useTranslation } from "react-i18next";
import LandingFooter from "../landing/LandingFooter.tsx";
import BrandTextLogo from "../ui/BrandTextLogo.tsx";
import { LogoutFillIcon, UserPlusFillIcon, SwitchFillIcon } from "../icons/FillIcons.tsx";
import { assetUrl } from "../../utils/appPath.ts";
import { useUnsavedChanges } from "../../context/UnsavedChangesContext.tsx";
import type { UserAccount } from "../../utils/accountStorage.ts";
import { TTEUNI_IMAGES } from "../../constants/tteuniImages.ts";
import FloatingDock from "../ui/FloatingDock.tsx";

export type AppNavPage = "landing" | "community" | "mypage";

type AppShellProps = {
  currentPage: AppNavPage;
  isLoggedIn: boolean;
  children: ReactNode;
  avatarUrl?: string;
  accounts?: UserAccount[];
  activeAccountId?: string | null;
  onGoHome: () => void;
  onGoCommunity: () => void;
  onGoMypage: () => void;
  onGoEditor: () => void;
  onLogin: () => void;
  onLogout: () => void;
  onAddAccount: () => void;
  onSwitchAccount?: (id: string) => void;
};

function NavTextItem({
  label,
  active = false,
  overlay = false,
  className = "",
  onClick,
}: {
  label: string;
  active?: boolean;
  overlay?: boolean;
  className?: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "nav-text-item",
        active ? "is-active text-coral" : overlay
          ? "text-stone-800 hover:text-coral"
          : "text-gray-600 hover:text-coral",
        overlay ? "[text-shadow:0_1px_6px_rgba(255,255,255,0.9)]" : "",
        className,
      ].join(" ")}
    >
      <span className="relative z-10">{label}</span>
    </button>
  );
}

function ProfileMenu({
  currentPage,
  avatarUrl,
  accounts,
  activeAccountId,
  onGoMypage,
  onLogout,
  onAddAccount,
  onSwitchAccount,
}: {
  currentPage: AppNavPage;
  avatarUrl?: string;
  accounts: UserAccount[];
  activeAccountId?: string | null;
  onGoMypage: () => void;
  onLogout: () => void;
  onAddAccount: () => void;
  onSwitchAccount?: (id: string) => void;
}) {
  const { t } = useTranslation();
  const { requestLeave } = useUnsavedChanges();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const otherAccounts = accounts.filter((item) => item.id !== activeAccountId);
  const avatarSrc = avatarUrl || TTEUNI_IMAGES.chatProfile;
  const hasCustomAvatar = Boolean(avatarUrl);

  useEffect(() => {
    const onDoc = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const go = (fn: () => void) => () => {
    setMenuOpen(false);
    requestLeave(fn);
  };

  return (
    <div className="relative shrink-0" ref={menuRef}>
      <button
        type="button"
        onClick={() => setMenuOpen((open) => !open)}
        className={`flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border bg-white outline-none transition-colors duration-200 focus:outline-none focus-visible:outline-none sm:h-11 sm:w-11 ${
          currentPage === "mypage"
            ? "border-coral"
            : "border-stone-200 hover:border-coral"
        }`}
        aria-label={t("nav.profileMenu")}
        aria-expanded={menuOpen}
        aria-haspopup="menu"
      >
        <img
          src={avatarSrc}
          alt=""
          className={
            hasCustomAvatar
              ? "h-full w-full object-cover"
              : "h-[78%] w-[78%] object-contain"
          }
        />
      </button>
      {menuOpen ? (
        <div
          role="menu"
          className="absolute right-full top-0 z-[60] mr-2 w-56 overflow-hidden rounded-xl border border-stone-200 bg-white py-1 shadow-md"
        >
          <button
            type="button"
            role="menuitem"
            onClick={go(onGoMypage)}
            className="flex w-full px-4 py-2.5 text-left font-sans text-sm text-stone-700 hover:bg-stone-50"
          >
            {t("nav.mypage")}
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={go(onLogout)}
            className="flex w-full items-center gap-2 px-4 py-2.5 text-left font-sans text-sm text-stone-700 hover:bg-stone-50"
          >
            <LogoutFillIcon className="h-4 w-4" />
            {t("nav.logout")}
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setMenuOpen(false);
              onAddAccount();
            }}
            className="flex w-full items-center gap-2 px-4 py-2.5 text-left font-sans text-sm text-stone-700 hover:bg-stone-50"
          >
            <UserPlusFillIcon className="h-4 w-4" />
            {t("nav.addAccount")}
          </button>
          {otherAccounts.length > 0 ? (
            <div className="border-t border-stone-100 py-1">
              <p className="px-4 py-1.5 font-sans text-[11px] font-medium text-stone-400">
                {t("nav.switchAccount")}
              </p>
              {otherAccounts.map((account) => (
                <button
                  key={account.id}
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setMenuOpen(false);
                    onSwitchAccount?.(account.id);
                  }}
                  className="flex w-full items-center gap-2 px-4 py-2 text-left font-sans text-sm text-stone-700 hover:bg-stone-50"
                >
                  <SwitchFillIcon className="h-4 w-4" />
                  @{account.handle}
                </button>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

export default function AppShell({
  currentPage,
  isLoggedIn,
  children,
  avatarUrl,
  accounts = [],
  activeAccountId,
  onGoHome,
  onGoCommunity,
  onGoMypage,
  onGoEditor,
  onLogin,
  onLogout,
  onAddAccount,
  onSwitchAccount,
}: AppShellProps) {
  const { t } = useTranslation();
  const { requestLeave } = useUnsavedChanges();
  const isOverlayHeader = currentPage === "landing";
  const go = (fn: () => void) => () => requestLeave(fn);

  const profileBtn = (
    <ProfileMenu
      currentPage={currentPage}
      avatarUrl={avatarUrl}
      accounts={accounts}
      activeAccountId={activeAccountId}
      onGoMypage={onGoMypage}
      onLogout={onLogout}
      onAddAccount={onAddAccount}
      onSwitchAccount={onSwitchAccount}
    />
  );

  return (
    <div className="relative min-h-screen w-full bg-white font-sans text-gray-900">
      <header
        className={
          isOverlayHeader
            ? "absolute left-0 top-0 z-50 w-full border-none bg-transparent"
            : "relative z-50 w-full bg-white"
        }
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[170px] w-full bg-cover bg-top bg-no-repeat md:h-[190px]"
          style={{ backgroundImage: `url(${assetUrl("/images/nav_lace.png")})` }}
        />
        <div className="nav-shell relative z-10 flex h-20 w-full items-center justify-between gap-3 md:h-24 md:gap-6">
          <button
            type="button"
            onClick={go(onGoHome)}
            className="flex shrink-0 items-center outline-none transition-opacity duration-200 hover:opacity-80 focus:outline-none focus-visible:outline-none"
            aria-label={t("nav.brand")}
          >
            <BrandTextLogo className="h-7 w-auto object-contain md:h-8" />
          </button>

          <nav className="ml-auto flex min-w-0 items-center justify-end gap-3 sm:gap-5 md:gap-7 lg:gap-8">
            <NavTextItem
              label={t("nav.home")}
              active={currentPage === "landing"}
              overlay={isOverlayHeader}
              className="hidden sm:inline-flex"
              onClick={go(onGoHome)}
            />
            <NavTextItem
              label={t("nav.community")}
              active={currentPage === "community"}
              overlay={isOverlayHeader}
              onClick={go(onGoCommunity)}
            />
            <NavTextItem
              label={t("nav.startEditor")}
              overlay={isOverlayHeader}
              onClick={go(onGoEditor)}
            />
            {isLoggedIn ? (
              profileBtn
            ) : (
              <NavTextItem
                label={t("nav.login")}
                overlay={isOverlayHeader}
                onClick={onLogin}
              />
            )}
          </nav>
        </div>
      </header>

      {isOverlayHeader ? (
        children
      ) : (
        <div className="relative z-10 pt-20 md:pt-24">{children}</div>
      )}
      <FloatingDock />
      <LandingFooter />
    </div>
  );
}
