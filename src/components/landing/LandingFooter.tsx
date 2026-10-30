import { memo } from "react";
import { useTranslation } from "react-i18next";
import BrandTextLogo from "../ui/BrandTextLogo.tsx";
import { ChevronRightFillIcon } from "../icons/FillIcons.tsx";
import { appPath, PUBLIC_AR_URL } from "../../utils/appPath.ts";

const PHONE = "010-6709-1423";
const EMAIL = "dayoung030423@gmail.com";

type FooterLink = {
  href: string;
  label: string;
  external?: boolean;
};

function LandingFooter() {
  const { t } = useTranslation();

  const related: { title: string; links: FooterLink[] }[] = [
    {
      title: t("landing.footerRelatedQuick"),
      links: [
        { href: appPath("/"), label: t("nav.home") },
        { href: appPath("/community"), label: t("nav.community") },
        { href: appPath("/editor"), label: t("nav.startEditor") },
        { href: appPath("/ar"), label: t("nav.ar") },
      ],
    },
    {
      title: t("landing.footerRelatedLounge"),
      links: [{ href: appPath("/community"), label: t("nav.community") }],
    },
    {
      title: t("landing.footerRelatedMy"),
      links: [{ href: appPath("/mypage"), label: t("nav.mypage") }],
    },
    {
      title: t("landing.footerRelatedSites"),
      links: [{ href: PUBLIC_AR_URL, label: t("landing.footerArTitle"), external: true }],
    },
  ];

  const utilities = [
    { href: appPath("/community"), label: t("nav.community") },
    { href: appPath("/editor"), label: t("nav.startEditor") },
    { href: appPath("/ar"), label: t("nav.ar") },
  ];

  return (
    <footer className="bg-white">
      <div className="page-shell py-10 text-center md:py-12">
        <p className="font-seoyun text-lg font-bold text-gray-900 md:text-xl">{t("landing.footerTag")}</p>
      </div>

      <div className="border-t border-stone-200 bg-[#f7f7f7]">
        <div className="page-shell">
          <div className="grid grid-cols-2 border-b border-stone-200 lg:grid-cols-4">
            {related.map((group, index) => (
              <details
                key={group.title}
                className={`group border-stone-200 ${index % 2 === 1 ? "border-l" : ""} ${index >= 2 ? "max-lg:border-t" : ""} ${index > 0 ? "lg:border-l" : ""}`}
              >
                <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3.5 font-sans text-sm text-stone-700 marker:content-none [&::-webkit-details-marker]:hidden">
                  <span>{group.title}</span>
                  <span className="text-lg leading-none text-stone-400 transition-transform group-open:rotate-45">+</span>
                </summary>
                <ul className="space-y-1 px-4 pb-3">
                  {group.links.map((link) => (
                    <li key={link.href + link.label}>
                      <a
                        href={link.href}
                        className="font-sans text-sm text-stone-600 hover:text-coral"
                        {...(link.external ? { target: "_blank", rel: "noreferrer" } : {})}
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </details>
            ))}
          </div>

          <div className="grid gap-10 py-10 md:grid-cols-[1fr_auto] md:items-start md:gap-16">
            <div>
              <div className="flex items-center gap-3">
                <BrandTextLogo className="h-7 w-auto object-contain" />
              </div>
              <ul className="mt-6 space-y-1.5 font-sans text-sm leading-relaxed text-stone-700">
                <li>
                  <span className="mr-3 font-semibold">{t("landing.footerPhoneLabel")}</span>
                  <a href={`tel:${PHONE.replace(/-/g, "")}`} className="hover:text-coral">
                    {PHONE}
                  </a>
                  <span className="text-stone-400"> | {t("landing.footerInquiry")}</span>
                </li>
                <li>
                  <span className="mr-3 font-semibold">{t("landing.footerEmailLabel")}</span>
                  <a href={`mailto:${EMAIL}`} className="hover:text-coral">
                    {EMAIL}
                  </a>
                </li>
              </ul>
            </div>

            <div className="min-w-[12rem]">
              <ul className="space-y-2">
                {utilities.map((link) => (
                  <li key={link.href}>
                    <a
                      href={link.href}
                      className="inline-flex items-center gap-1 font-sans text-sm text-stone-700 hover:text-coral"
                    >
                      {link.label}
                      <ChevronRightFillIcon className="h-3.5 w-3.5" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="flex flex-col gap-2 border-t border-stone-200 py-4 font-sans text-sm text-stone-500 md:flex-row md:items-center md:justify-between">
            <p className="flex flex-wrap gap-x-3 gap-y-1">
              <span className="font-semibold text-stone-800">{t("landing.footerPrivacy")}</span>
              <span>{t("landing.footerTerms")}</span>
            </p>
            <p>{t("landing.footerCopyright")}</p>
          </div>
        </div>
      </div>

      <div className="bg-stone-900">
        <div className="page-shell flex items-center gap-3 py-3 font-sans text-sm text-white">
          <span className="font-semibold">{t("nav.brand")}</span>
          <span className="text-white/70">{t("landing.footerBarNote")}</span>
        </div>
      </div>
    </footer>
  );
}

export default memo(LandingFooter);
