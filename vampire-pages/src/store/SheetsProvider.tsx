import { createContext, useContext, useEffect, useMemo, useReducer, useState, type Dispatch, type ReactNode } from 'react';
import { sheetsReducer, type SheetsAction, type SheetsState } from './sheetsReducer.ts';
import { browserStorage, loadState, saveState, type KeyValueStorage } from './storage.ts';

interface SheetsContextValue {
  state: SheetsState;
  dispatch: Dispatch<SheetsAction>;
  /** Load/save problem to show the user, if any. */
  storageNotice: string | null;
  dismissStorageNotice: () => void;
}

const SheetsContext = createContext<SheetsContextValue | null>(null);

interface SheetsProviderProps {
  children: ReactNode;
  storage?: KeyValueStorage;
}

export function SheetsProvider({ children, storage: injectedStorage }: SheetsProviderProps) {
  const [storage] = useState(() => injectedStorage ?? browserStorage());
  const [initial] = useState(() => loadState(storage));
  const [state, dispatch] = useReducer(sheetsReducer, initial.state);
  const [storageNotice, setStorageNotice] = useState(initial.notice);

  // Persist after each change, outside the reducer.
  useEffect(() => {
    const result = saveState(storage, state);
    if (!result.ok) setStorageNotice(result.error);
  }, [storage, state]);

  const value = useMemo<SheetsContextValue>(
    () => ({ state, dispatch, storageNotice, dismissStorageNotice: () => setStorageNotice(null) }),
    [state, storageNotice],
  );

  return <SheetsContext value={value}>{children}</SheetsContext>;
}

export function useSheets(): SheetsContextValue {
  const context = useContext(SheetsContext);
  if (context === null) throw new Error('useSheets must be used inside <SheetsProvider>');
  return context;
}
