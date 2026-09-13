const REPORT_KEY = "ttugae.reports.v1";

export type ReportTargetType = "post" | "comment";

export type ContentReport = {
  id: string;
  targetType: ReportTargetType;
  targetId: string;
  reason: string;
  detail: string;
  createdAt: number;
};

export const REPORT_REASONS = [
  "spam",
  "abuse",
  "copyright",
  "privacy",
  "other",
] as const;

export type ReportReasonId = (typeof REPORT_REASONS)[number];

export function saveReport(report: Omit<ContentReport, "id" | "createdAt">): ContentReport {
  const next: ContentReport = {
    ...report,
    id: `rp-${Date.now()}`,
    createdAt: Date.now(),
  };
  try {
    const raw = localStorage.getItem(REPORT_KEY);
    const list = raw ? (JSON.parse(raw) as ContentReport[]) : [];
    localStorage.setItem(REPORT_KEY, JSON.stringify([next, ...(Array.isArray(list) ? list : [])]));
  } catch {
    // ignore
  }
  return next;
}
