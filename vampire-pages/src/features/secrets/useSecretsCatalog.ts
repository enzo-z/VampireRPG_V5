import { useEffect, useState } from 'react';
import type { SecretsCatalog } from '../../catalog/types.ts';

// The documents are a separate chunk, fetched only after the password.
let pending: Promise<SecretsCatalog> | null = null;

function loadSecrets(): Promise<SecretsCatalog> {
  pending ??= import('virtual:secrets').then((module) => module.default);
  return pending;
}

/** The secret documents, or null while loading. */
export function useSecretsCatalog(): SecretsCatalog | null {
  const [catalog, setCatalog] = useState<SecretsCatalog | null>(null);
  useEffect(() => {
    let active = true;
    void loadSecrets().then((loaded) => {
      if (active) setCatalog(loaded);
    });
    return () => {
      active = false;
    };
  }, []);
  return catalog;
}
