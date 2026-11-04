import { useTranslation } from "react-i18next";

export default function SkipToContent() {
  const { t } = useTranslation();
  return (
    <a href="#main-content" className="skip-link">
      {t("common.skipToContent")}
    </a>
  );
}
