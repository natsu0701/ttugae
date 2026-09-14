import { memo, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import Button from "./Button.tsx";
import { REPORT_REASONS, saveReport, type ReportTargetType } from "../../utils/reportStorage.ts";

type ReportModalProps = {
  open: boolean;
  targetType: ReportTargetType;
  targetId: string;
  onClose: () => void;
};

function ReportModal({ open, targetType, targetId, onClose }: ReportModalProps) {
  const { t } = useTranslation();
  const [reason, setReason] = useState<(typeof REPORT_REASONS)[number]>("spam");
  const [detail, setDetail] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!open) return;
    setReason("spam");
    setDetail("");
    setDone(false);
  }, [open, targetId, targetType]);

  if (!open) return null;

  const submit = () => {
    saveReport({ targetType, targetId, reason, detail });
    setDone(true);
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <button type="button" className="absolute inset-0 bg-stone-900/30" onClick={onClose} aria-label={t("common.close")} />
      <div className="relative w-full max-w-md rounded-xl bg-white p-6 shadow-lg">
        <h2 className="text-title font-sans text-gray-900">{t("report.title")}</h2>
        {done ? (
          <p className="mt-4 text-body text-stone-600">{t("report.submitted")}</p>
        ) : (
          <>
            <p className="mt-2 text-body text-stone-500">{t("report.hint")}</p>
            <div className="mt-4 space-y-2">
              {REPORT_REASONS.map((id) => (
                <label key={id} className="flex items-center gap-2 text-base text-stone-700">
                  <input
                    type="radio"
                    name="report-reason"
                    checked={reason === id}
                    onChange={() => setReason(id)}
                  />
                  {t(`report.reasons.${id}`)}
                </label>
              ))}
            </div>
            <textarea
              value={detail}
              onChange={(e) => setDetail(e.target.value)}
              rows={3}
              className="mt-4 w-full rounded-lg border border-stone-200 px-3 py-2 text-base outline-none focus:border-coral"
              placeholder={t("report.detailPh")}
            />
          </>
        )}
        <div className="mt-5 flex justify-end gap-2">
          <Button type="button" variant="secondary" className="px-4 py-2 text-base" onClick={onClose}>
            {done ? t("common.close") : t("common.cancel")}
          </Button>
          {!done ? (
            <Button type="button" className="px-4 py-2 text-base" onClick={submit}>
              {t("report.submit")}
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default memo(ReportModal);
