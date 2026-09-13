import {
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useTranslation } from "react-i18next";
import LandingFooter from "../landing/LandingFooter.tsx";
import BrandTextLogo from "../ui/BrandTextLogo.tsx";
import { UserFillIcon, LogoutFillIcon, UserPlusFillIcon, SwitchFillIcon } from "../icons/FillIcons.tsx";
import { assetUrl } from "../../utils/appPath.ts";
import { useUnsavedChanges } from "../../context/UnsavedChangesContext.tsx";
import type { UserAccount } from "../../utils/accountStorage.ts";
import { TTEUNI_IMAGES } from "../../constants/tteuniImages.ts";

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
  onClick,
}: {
  label: string;
  active?: boolean;
  overlay?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "relative inline-flex items-center py-1 font-sans text-sm font-normal outline-none",
        "transition-colors duration-200 ease-out",
        "focus:outline-none focus-visible:outline-none",
        "[-webkit-tap-highlight-color:transparent]",
        active ? "text-coral -translate-y-px" : overlay
          ? "text-stone-800 hover:text-coral"
          : "text-gray-600 hover:text-coral",
        overlay ? "[text-shadow:0_1px_6px_rgba(255,255,255,0.9)]" : "",
        "after:pointer-events-none after:absolute after:-bottom-0.5 after:left-0",
        "after:h-[2px] after:w-full after:origin-left after:rounded-full after:bg-coral",
        "after:transition-transform after:duration-200 after:ease-out",
        active ? "after:scale-x-100" : "after:scale-x-0",
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
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setMenuOpen((open) => !open)}
        className={`flex h-11 w-11 items-center justify-center overflow-hidden rounded-full border transition-colors duration-200 ${
          currentPage === "mypage"
            ? "border-coral"
            : "border-stone-200 bg-white hover:border-coral"
        }`}
        aria-label={t("nav.profileMenu")}
        aria-expanded={menuOpen}
      >
        {avatarUrl ? (
          <img src={avatarSrc} alt="" className="h-full w-full object-cover" />
        ) : (
          <UserFillIcon className="h-6 w-6 text-gray-700" />
        )}
      </button>
      {menuOpen ? (
        <div className="absolute right-0 z-50 mt-2 w-52 overflow-hidden rounded-xl border border-stone-200 bg-white py-1 shadow-lg">
          <button
            type="button"
            onClick={go(onGoMypage)}
            className="flex w-full px-4 py-2.5 text-left font-sans text-sm text-stone-700 hover:bg-stone-50"
          >
            {t("nav.mypage")}
          </button>
          <button
            type="button"
            onClick={go(onLogout)}
            className="flex w-full items-center gap-2 px-4 py-2.5 text-left font-sans text-sm text-stone-700 hover:bg-stone-50"
          >
            <LogoutFillIcon className="h-4 w-4" />
            {t("nav.logout")}
          </button>
          <button
            type="button"
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
              <p className="px-4 py-1.5 font-sans text-[11px] font-medium uppercase tracking-wide text-stone-400">
                {t("nav.switchAccount")}
              </p>
              {otherAccounts.map((account) => (
                <button
                  key={account.id}
                  type="button"
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
            : "relative w-full bg-white"
        }
      >
        <div
          aria-hidden
          className="pointer-events-none absolute left-0 top-[-20px] z-0 h-[170px] w-full bg-[length:auto_170px] bg-top bg-repeat-x"
          style={{ backgroundImage: `url(${assetUrl("/images/nav_lace.png")})` }}
        />
        <div className="page-shell relative z-10 flex h-20 items-center justify-between md:h-24">
          <button
            type="button"
            onClick={go(onGoHome)}
            className="flex items-center transition-opacity duration-200 hover:opacity-80"
            aria-label={t("nav.brand")}
          >
            <BrandTextLogo className="h-7 w-auto object-contain md:h-8" />
          </button>

          <nav className="hidden items-center gap-7 md:flex">
            <NavTextItem
              label={t("nav.home")}
              active={currentPage === "landing"}
              overlay={isOverlayHeader}
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

          <div className="flex items-center gap-4 md:hidden">
            <NavTextItem
              label={t("nav.community")}
              active={currentPage === "community"}
              overlay={isOverlayHeader}
              onClick={go(onGoCommunity)}
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
          </div>
        </div>
      </header>

      {isOverlayHeader ? (
        children
      ) : (
        <div className="relative z-10 pt-20 md:pt-16">{children}</div>
      )}
      <LandingFooter />
    </div>
  );
}
