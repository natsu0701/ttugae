import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { assetUrl, PUBLIC_AR_URL } from "../../utils/appPath.ts";

type ArIpadLinkProps = {
  tone?: "light" | "dark";
  showQr?: boolean;
};

export default function ArIpadLink({ tone = "light", showQr = true }: ArIpadLinkProps) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);
  const dark = tone === "dark";

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
      <a
        href={PUBLIC_AR_URL}
        className={`break-all text-center font-sans text-base font-semibold underline-offset-2 hover:underline ${
          dark ? "text-white" : "text-gray-900"
        }`}
      >
        {PUBLIC_AR_URL}
      </a>
      <p className={`text-center font-sans text-sm ${dark ? "text-white/70" : "text-gray-500"}`}>
        {t("ar.ipadHint")}
      </p>
      <button
        type="button"
        onClick={() => void copy()}
        className={
          dark
            ? "rounded-xl bg-coral px-5 py-2.5 font-sans text-base font-semibold text-white hover:bg-white hover:text-gray-900"
            : "rounded-xl bg-coral px-5 py-2.5 font-sans text-base font-semibold text-white hover:bg-black"
        }
      >
        {copied ? t("ar.linkCopied") : t("ar.copyLink")}
      </button>
    </div>
  );
}
