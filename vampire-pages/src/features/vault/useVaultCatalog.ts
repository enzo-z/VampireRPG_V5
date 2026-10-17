import { useEffect, useState } from 'react';
import type { VaultCatalog } from '../../catalog/types.ts';

export interface LoadedVault {
  catalog: VaultCatalog;
  /** Bundled image and audio URLs, indexed by data-vault-asset and VaultNote.banner. */
  assets: readonly string[];
}

// The notes are a separate chunk, fetched the first time the Vault opens.
let pending: Promise<LoadedVault> | null = null;
let loaded: LoadedVault | null = null;

function loadVault(): Promise<LoadedVault> {
  pending ??= import('virtual:vault').then((module) => {
    loaded = { catalog: module.default, assets: module.assets };
    return loaded;
  });
  return pending;
}

/** The Vault's notes, or null while loading. */
export function useVaultCatalog(): LoadedVault | null {
  const [vault, setVault] = useState<LoadedVault | null>(loaded);
  useEffect(() => {
    if (vault !== null) return;
    let active = true;
    void loadVault().then((result) => {
      if (active) setVault(result);
    });
    return () => {
      active = false;
    };
  }, [vault]);
  return vault;
}
