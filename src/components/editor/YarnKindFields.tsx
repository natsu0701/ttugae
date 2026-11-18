import { useTranslation } from "react-i18next";
import { YARN_KIND_IDS } from "../../data/yarnKinds.ts";
import Select from "../ui/Select.tsx";

type YarnKindFieldsProps = {
  value: string;
  onChange: (next: string) => void;
};

export default function YarnKindFields({ value, onChange }: YarnKindFieldsProps) {
  const { t } = useTranslation();
  return (
    <Select
      aria-label={t("editor.yarnSelect")}
      value={value}
      onChange={onChange}
      options={[
        { value: "", label: t("editor.yarnKindPlaceholder") },
        ...YARN_KIND_IDS.map((id) => ({
          value: id,
          label: t(`editor.yarnKinds.${id}`),
        })),
      ]}
    />
  );
}
