import { createContext, useContext } from 'react';
import type { Ficha } from '../../domain/character.ts';
import type { Selection } from '../../reference/lookup.ts';
import type { SheetsAction } from '../../store/sheetsReducer.ts';

export interface SheetContextValue {
  ficha: Ficha;
  /** "Olho" mode: nothing can be edited, but the reference panel still works. */
  readOnly: boolean;
  /** Dispatches an edit; ignored while read-only. */
  edit: (action: SheetsAction) => void;
  selection: Selection | null;
  select: (selection: Selection | null) => void;
}

export const SheetContext = createContext<SheetContextValue | null>(null);

export function useSheet(): SheetContextValue {
  const context = useContext(SheetContext);
  if (context === null) throw new Error('useSheet must be used inside <SheetPage>');
  return context;
}
