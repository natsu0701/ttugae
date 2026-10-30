import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { assetUrl, PUBLIC_AR_URL } from "../../utils/appPath.ts";
import { CheckFillIcon, CopyFillIcon, OpenLinkFillIcon } from "../icons/FillIcons.tsx";
import { iconTip } from "../../utils/iconTip.ts";

type ArIpadLinkProps = {
  tone?: "light" | "dark";
  showQr?: boolean;
};

export default function ArIpadLink({ tone = "light", showQr = true }: ArIpadLinkProps) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);
  const dark = tone === "dark";
  const iconClass = dark
    ? "flex h-9 w-9 shrink-0 items-center justify-center text-white/50 hover:text-white"
    : "flex h-9 w-9 shrink-0 items-center justify-center text-gray-400 hover:text-gray-700";

  const copy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(PUBLIC_AR_URL);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt(t("ar.copyLink"), PUBLIC_AR_URL);
    }
  }, [t]);

  return (
    <div className={`flex flex-col items-center gap-3 ${dark ? "text-white" : "text-gray-900"}`}>
      {showQr ? (
        <img
          src={assetUrl("/images/ar-ipad-qr.svg")}
          alt={t("ar.qrAlt")}
          className="h-36 w-36 bg-white p-2"
        />
      ) : null}
      <div className="flex items-center gap-1">
        <a
          href={PUBLIC_AR_URL}
          className={`break-all text-center font-sans text-base font-semibold underline-offset-2 hover:underline ${
            dark ? "text-white" : "text-gray-900"
          }`}
        >
          {PUBLIC_AR_URL}
        </a>
        <button
          type="button"
          onClick={() => void copy()}
          className={iconClass}
          {...iconTip(copied ? t("ar.linkCopied") : t("ar.copyLink"))}
        >
          {copied ? <CheckFillIcon className="h-5 w-5" /> : <CopyFillIcon className="h-5 w-5" />}
        </button>
        <a href={PUBLIC_AR_URL} className={iconClass} {...iconTip(t("ar.openLink"))}>
          <OpenLinkFillIcon className="h-5 w-5" />
        </a>
      </div>
    </div>
  );
}
