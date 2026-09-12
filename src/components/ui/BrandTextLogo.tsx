import { useTranslation } from "react-i18next";
import { assetUrl } from "../../utils/appPath.ts";

type BrandTextLogoProps = {
  className?: string;
};

/** 화면용 워드마크. alt는 접근성·검색용으로 브랜드명을 유지합니다. */
export default function BrandTextLogo({
  className = "h-6 w-auto object-contain",
}: BrandTextLogoProps) {
  const { t } = useTranslation();
  return (
    <img
      src={assetUrl("/images/text_logo.png")}
      alt={t("nav.brand")}
      className={className}
    />
  );
}
