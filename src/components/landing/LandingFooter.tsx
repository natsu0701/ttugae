import { memo, useState } from "react";
import { useTranslation } from "react-i18next";
import BrandTextLogo from "../ui/BrandTextLogo.tsx";
import { ChevronRightFillIcon, PlusFillIcon } from "../icons/FillIcons.tsx";
import { appPath, PUBLIC_AR_URL } from "../../utils/appPath.ts";

const PHONE = "010-6709-1423";
const EMAIL = "dayoung030423@gmail.com";
const SITE_HOST = "natsu0701.github.io/ttugae";
const SITE_URL = "https://natsu0701.github.io/ttugae/";

type FooterLink = {
  href: string;
  label: string;
  external?: boolean;
};

type RelatedGroup = {
  id: string;
  title: string;
  links: FooterLink[];
};

function linkProps(link: FooterLink) {
  return link.external ? { target: "_blank" as const, rel: "noreferrer" } : {};
}

function InfoRow({
  label,
  value,
  href,
  note,
}: {
  label: string;
  value: string;
  href: string;
  note: string;
}) {
  return (
    <li className="flex flex-wrap items-baseline gap-x-2 font-sans text-[0.9375rem] leading-relaxed text-[#1d1d1d]">
      <span className="font-bold">
        {label}{" "}
        <a href={href} className="font-bold hover:text-coral">
          {value}
        </a>
      </span>
      <span className="select-none text-[#8a8a8a]" aria-hidden>
        |
      </span>
      <span className="text-[#555]">{note}</span>
    </li>
  );
}

function LandingFooter() {
  const { t } = useTranslation();
  const [openRelated, setOpenRelated] = useState<string | null>(null);

  const related: RelatedGroup[] = [
    {
      id: "quick",
      title: t("landing.footerRelatedQuick"),
      links: [
        { href: appPath("/"), label: t("nav.home") },
        { href: appPath("/community"), label: t("nav.community") },
        { href: appPath("/editor"), label: t("nav.startEditor") },
        { href: appPath("/ar"), label: t("nav.ar") },
      ],
    },
    {
      id: "lounge",
      title: t("landing.footerRelatedLounge"),
      links: [
        { href: appPath("/community"), label: t("community.tabs.all") },
        { href: appPath("/community"), label: t("community.tabs.best") },
        { href: appPath("/community"), label: t("community.tabs.qa") },
        { href: appPath("/community"), label: t("community.tabs.showcase") },
        { href: appPath("/community"), label: t("community.tabs.offline") },
      ],
    },
    {
      id: "mypage",
      title: t("landing.footerRelatedMy"),
      links: [
        { href: appPath("/mypage"), label: t("mypage.tabs.profile") },
        { href: appPath("/mypage/patterns"), label: t("mypage.tabs.patterns") },
        { href: appPath("/mypage/finished"), label: t("mypage.tabs.finished") },
        { href: appPath("/mypage/settings"), label: t("mypage.tabs.settings") },
      ],
    },
    {
      id: "sites",
      title: t("landing.footerRelatedSites"),
      links: [
        { href: SITE_URL, label: t("nav.brand"), external: true },
        { href: PUBLIC_AR_URL, label: t("landing.footerArTitle"), external: true },
      ],
    },
  ];

  const utilities: FooterLink[] = [
    { href: appPath("/community"), label: t("nav.community") },
    { href: appPath("/editor"), label: t("nav.startEditor") },
    { href: appPath("/ar"), label: t("nav.ar") },
  ];

  return (
    <div>
      <div className="bg-white">
        <div className="page-shell py-10 text-center md:py-12">
          <p className="font-seoyun text-lg font-bold text-gray-900 md:text-xl">{t("landing.footerTag")}</p>
        </div>
      </div>

      <footer className="bg-[#f4f5f6] text-[#1d1d1d]">
        <div className="border-y border-[#d8d8d8] bg-white">
          <div className="grid grid-cols-1 lg:grid-cols-4">
            {related.map((group, index) => {
              const isOpen = openRelated === group.id;
              return (
                <details
                  key={group.id}
                  className={`relative border-[#d8d8d8] ${isOpen ? "z-30" : "z-10"} ${index > 0 ? "border-t lg:border-t-0 lg:border-l" : ""}`}
                  open={isOpen}
                >
                  <summary
                    className="flex h-14 cursor-pointer list-none items-center justify-between gap-3 px-5 font-sans text-[0.9375rem] text-[#333] marker:content-none hover:bg-[#f7f7f7] [&::-webkit-details-marker]:hidden md:px-8"
                    onClick={(event) => {
                      event.preventDefault();
                      setOpenRelated((prev) => (prev === group.id ? null : group.id));
                    }}
                  >
                    <span>{group.title}</span>
                    <PlusFillIcon
                      className={`h-4 w-4 shrink-0 text-[#767676] transition-transform ${isOpen ? "rotate-45" : ""}`}
                    />
                  </summary>
                  <ul className="absolute inset-x-0 top-full z-20 space-y-1 border border-t-0 border-[#d8d8d8] bg-white px-5 py-3 shadow-md md:px-8">
                    {group.links.map((link) => (
                      <li key={`${group.id}-${link.href}-${link.label}`}>
                        <a
                          href={link.href}
                          className="block py-0.5 font-sans text-sm text-[#555] hover:text-coral"
                          {...linkProps(link)}
                        >
                          {link.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </details>
              );
            })}
          </div>
        </div>

        <div className="page-shell flex flex-col py-10 md:py-12">
          <BrandTextLogo className="h-8 w-auto self-start object-contain md:h-9" />

          <div className="mt-8 flex flex-col gap-10 lg:flex-row lg:items-start lg:justify-between lg:gap-16">
            <div className="min-w-0 flex-1">
              <p className="font-sans text-[0.9375rem] leading-relaxed text-[#333]">{t("landing.footerAddr")}</p>
              <ul className="mt-4 space-y-2">
                <InfoRow
                  label={t("landing.footerPhoneLabel")}
                  value={PHONE}
                  href={`tel:${PHONE.replace(/-/g, "")}`}
                  note={t("landing.footerInquiry")}
                />
                <InfoRow
                  label={t("landing.footerEmailLabel")}
                  value={EMAIL}
                  href={`mailto:${EMAIL}`}
                  note={t("landing.footerInquiry")}
                />
                <InfoRow
                  label={t("landing.footerHomeLabel")}
                  value={SITE_HOST}
                  href={SITE_URL}
                  note={t("landing.footerHomeNote")}
                />
              </ul>
            </div>

            <div className="w-full shrink-0 lg:w-56">
              <ul className="space-y-2">
                {utilities.map((link) => (
                  <li key={link.href}>
                    <a
                      href={link.href}
                      className="inline-flex items-center gap-1 font-sans text-[0.9375rem] text-[#1d1d1d] hover:text-coral"
                    >
                      {link.label}
                      <ChevronRightFillIcon className="h-3.5 w-3.5 text-[#767676]" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-10 flex flex-col gap-3 border-t border-[#d8d8d8] pt-5 font-sans text-sm md:flex-row md:items-center md:justify-between md:pr-28">
            <p className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[#555]">
              <span className="inline-flex items-center gap-1.5 font-bold text-coral">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-coral" aria-hidden />
                {t("landing.footerPrivacy")}
              </span>
              <span>{t("landing.footerTerms")}</span>
            </p>
            <p className="text-[#767676]">{t("landing.footerCopyright")}</p>
          </div>
        </div>

        <div className="bg-[#222]">
          <div className="page-shell flex items-center gap-3 py-3">
            <span className="font-sans text-sm font-semibold text-white">{t("nav.brand")}</span>
            <span className="font-sans text-sm text-white/80">{t("landing.footerBarNote")}</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default memo(LandingFooter);
