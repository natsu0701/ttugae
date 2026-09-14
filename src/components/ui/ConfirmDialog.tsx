import { memo } from "react";
import { useTranslation } from "react-i18next";
import Button from "./Button.tsx";

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  body: string;
  confirmLabel?: string;
  discardLabel?: string;
  onConfirm: () => void;
  onDiscard: () => void;
  onCancel: () => void;
};

function ConfirmDialog({
  open,
  title,
  body,
  confirmLabel,
  discardLabel,
  onConfirm,
  onDiscard,
  onCancel,
}: ConfirmDialogProps) {
  const { t } = useTranslation();
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
      <button type="button" className="absolute inset-0 bg-stone-900/30" onClick={onCancel} aria-label={t("common.close")} />
      <div className="relative w-full max-w-md rounded-xl bg-white p-6 shadow-lg">
        <h2 className="text-title font-sans text-gray-900">{title}</h2>
        <p className="mt-3 text-body text-stone-600">{body}</p>
        <div className="mt-6 flex flex-wrap justify-end gap-2">
          <Button type="button" variant="secondary" className="px-4 py-2 text-base" onClick={onCancel}>
            {t("common.cancel")}
          </Button>
          <Button type="button" variant="ghost" className="px-4 py-2 text-base" onClick={onDiscard}>
            {discardLabel ?? t("unsaved.discard")}
          </Button>
          <Button type="button" className="px-4 py-2 text-base" onClick={onConfirm}>
            {confirmLabel ?? t("unsaved.save")}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default memo(ConfirmDialog);
