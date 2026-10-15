import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'vampire-pages:sidebar';
/** Below this width the sidebar is a drawer over the content (see Shell.module.css). */
export const NARROW_QUERY = '(max-width: 48rem)';

const isNarrow = () => window.matchMedia(NARROW_QUERY).matches;

function storedOpen(): boolean {
  try {
    return window.localStorage.getItem(STORAGE_KEY) !== 'closed';
  } catch {
    return true;
  }
}

function storeOpen(open: boolean): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, open ? 'open' : 'closed');
  } catch {
    // Per-viewer convenience only: without storage the sidebar just starts open.
  }
}

export interface SidebarState {
  open: boolean;
  narrow: boolean;
  toggle: () => void;
  /** Closes the drawer after navigating on a narrow screen; no-op on wide screens. */
  closeIfNarrow: () => void;
}

/** Wide screens remember collapsed/expanded; narrow screens start with the drawer closed. */
export function useSidebar(): SidebarState {
  const [narrow, setNarrow] = useState(isNarrow);
  const [open, setOpen] = useState(() => !isNarrow() && storedOpen());

  useEffect(() => {
    const query = window.matchMedia(NARROW_QUERY);
    const onChange = () => {
      setNarrow(query.matches);
      setOpen(!query.matches && storedOpen());
    };
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, []);

  const toggle = useCallback(() => {
    setOpen((value) => {
      if (!isNarrow()) storeOpen(!value);
      return !value;
    });
  }, []);

  const closeIfNarrow = useCallback(() => {
    if (isNarrow()) setOpen(false);
  }, []);

  return { open, narrow, toggle, closeIfNarrow };
}
