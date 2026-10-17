import { useEffect, useState } from 'react';
import type { NyMapCatalog } from '../../catalog/types.ts';

// The map carries narrator secrets: it is a separate chunk, fetched only after the password.
let pending: Promise<NyMapCatalog | null> | null = null;

function loadMap(): Promise<NyMapCatalog | null> {
  pending ??= import('virtual:ny-map').then((module) => module.default);
  return pending;
}

export type NyMapState = { status: 'loading' } | { status: 'missing' } | { status: 'ready'; map: NyMapCatalog };

export function useNyMap(): NyMapState {
  const [state, setState] = useState<NyMapState>({ status: 'loading' });
  useEffect(() => {
    let active = true;
    void loadMap().then((map) => {
      if (active) setState(map === null ? { status: 'missing' } : { status: 'ready', map });
    });
    return () => {
      active = false;
    };
  }, []);
  return state;
}
