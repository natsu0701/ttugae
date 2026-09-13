import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from "react";

type LeaveDecision = "save" | "discard" | "cancel";

type UnsavedApi = {
  dirty: boolean;
  setDirty: (value: boolean) => void;
  registerSaver: (save: () => void) => void;
  requestLeave: (proceed: () => void) => void;
  pending: boolean;
  resolveLeave: (decision: LeaveDecision) => void;
};

const UnsavedChangesContext = createContext<UnsavedApi | null>(null);

export function UnsavedChangesProvider({ children }: { children: ReactNode }) {
  const [dirty, setDirty] = useState(false);
  const [pending, setPending] = useState(false);
  const saveRef = useRef<() => void>(() => undefined);
  const proceedRef = useRef<() => void>(() => undefined);

  const registerSaver = useCallback((save: () => void) => {
    saveRef.current = save;
  }, []);

  const requestLeave = useCallback(
    (proceed: () => void) => {
      if (!dirty) {
        proceed();
        return;
      }
      proceedRef.current = proceed;
      setPending(true);
    },
    [dirty],
  );

  const resolveLeave = useCallback((decision: LeaveDecision) => {
    setPending(false);
    if (decision === "cancel") return;
    if (decision === "save") saveRef.current();
    setDirty(false);
    proceedRef.current();
  }, []);

  const value = useMemo(
    () => ({ dirty, setDirty, registerSaver, requestLeave, pending, resolveLeave }),
    [dirty, registerSaver, requestLeave, pending, resolveLeave],
  );

  return (
    <UnsavedChangesContext.Provider value={value}>{children}</UnsavedChangesContext.Provider>
  );
}

export function useUnsavedChanges() {
  const ctx = useContext(UnsavedChangesContext);
  if (!ctx) {
    return {
      dirty: false,
      setDirty: () => undefined,
      registerSaver: () => undefined,
      requestLeave: (proceed: () => void) => proceed(),
      pending: false,
      resolveLeave: () => undefined,
    } satisfies UnsavedApi;
  }
  return ctx;
}
