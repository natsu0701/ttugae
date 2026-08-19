import { useTranslation } from "react-i18next";

type ShareToCommunityButtonProps = {
  onClick: () => void;
  disabled?: boolean;
};

export default function ShareToCommunityButton({
  onClick,
  disabled = false,
}: ShareToCommunityButtonProps) {
  const { t } = useTranslation();
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="w-full rounded-xl bg-coral px-4 py-3.5 font-sans text-base font-bold text-white shadow-sm shadow-gray-200/50 transition-colors duration-200 hover:bg-black disabled:opacity-50"
    >
      {t("community.shareToCommunity")}
    </button>
  );
}
