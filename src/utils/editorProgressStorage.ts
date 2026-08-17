export const PROGRESS_ROW_KEY = "currentProgressRow";
export const PROGRESS_BACKUP_KEY = "ttugae.session.currentProgressRow";

function readRow(raw: string | null): number | null {
  if (raw == null || raw === "") return null;
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (parsed === null) return null;
    const num = typeof parsed === "number" ? parsed : Number(parsed);
    return Number.isFinite(num) ? num : null;
  } catch {
    const num = Number(raw);
    return Number.isFinite(num) ? num : null;
  }
}

export function persistCurrentProgressRow(row: number) {
  if (!Number.isFinite(row)) return;
  localStorage.setItem(PROGRESS_ROW_KEY, JSON.stringify(row));
}

export function loadCurrentProgressRow(): number | null {
  return readRow(localStorage.getItem(PROGRESS_ROW_KEY));
}

export function backupProgressRowOnCheckin(): number {
  const current = loadCurrentProgressRow();
  const preserved = current == null ? 0 : current;
  localStorage.setItem(PROGRESS_ROW_KEY, JSON.stringify(preserved));
  localStorage.setItem(
    PROGRESS_BACKUP_KEY,
    JSON.stringify({ currentProgressRow: preserved, savedAt: Date.now() }),
  );
  return preserved;
}
