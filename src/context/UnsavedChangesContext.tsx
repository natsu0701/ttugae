import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";

type LeaveDecision = "save" | "discard" | "cancel";

type UnsavedApi = {
  dirty: boolean;
  setDirty: (value: boolean) => void;
  registerSaver: (save: () => boolean | void) => void;
  requestLeave: (proceed: () => void) => void;
  pending: boolean;
  resolveLeave: (decision: LeaveDecision) => void;
};

const UnsavedChangesContext = createContext<UnsavedApi | null>(null);

export function UnsavedChangesProvider({ children }: { children: ReactNode }) {
  const [dirty, setDirty] = useState(false);
  const [pending, setPending] = useState(false);
  const saveRef = useRef<() => boolean | void>(() => undefined);
  const proceedRef = useRef<() => void>(() => undefined);

  const registerSaver = useCallback((save: () => boolean | void) => {
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
    if (decision === "cancel") {
      setPending(false);
      return;
    }
    if (decision === "save") {
      const ok = saveRef.current();
      if (ok === false) {
        setPending(false);
        return;
      }
    }
    setPending(false);
    setDirty(false);
    proceedRef.current();
  }, []);

  useEffect(() => {
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!dirty) return;
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [dirty]);

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
