import { useTranslation } from "react-i18next";
import { softShadow } from "../ui/tabButtonStyles.ts";

type ProfileStatsSummaryProps = {
  patternCount: number;
  heartCount: number;
  finishedCount: number;
  savedCount: number;
};

export default function ProfileStatsSummary({
  patternCount,
  heartCount,
  finishedCount,
  savedCount,
}: ProfileStatsSummaryProps) {
  const { t } = useTranslation();

  const items = [
    {
      labelKey: "mypage.profile.statPatterns",
      value: patternCount,
      unitKey: "mypage.profile.unitPatterns",
    },
    {
      labelKey: "mypage.profile.statHearts",
      value: heartCount,
      unitKey: "mypage.profile.unitHearts",
    },
    {
      labelKey: "mypage.profile.statFinished",
      value: finishedCount,
      unitKey: "mypage.profile.unitFinished",
    },
    {
      labelKey: "mypage.profile.statSaved",
      value: savedCount,
      unitKey: "mypage.profile.unitPatterns",
    },
  ];

  return (
    <div className="mt-10">
      <h3 className="font-sans text-lg font-bold text-gray-900">
        {t("mypage.profile.statsTitle")}
      </h3>
      <p className="mt-1 font-seoyun text-base font-normal text-gray-500">
        {t("mypage.profile.statsHint")}
      </p>
      <div className="mt-4 grid grid-cols-2 gap-3">
        {items.map((item) => (
          <div
            key={item.labelKey}
            className={`rounded-2xl bg-gray-50 p-4 ${softShadow}`}
          >
            <p className="font-sans text-sm font-normal text-gray-500">
              {t(item.labelKey)}
            </p>
            <p className="mt-1 font-sans text-2xl font-bold text-gray-900">
              {item.value}
              <span className="ml-0.5 text-base font-normal text-gray-500">
                {t(item.unitKey)}
              </span>
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
