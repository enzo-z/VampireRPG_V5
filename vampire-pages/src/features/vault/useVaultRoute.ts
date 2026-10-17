import { useEffect, useState } from 'react';
import { parseVaultHash, type VaultRoute } from './vaultRoute.ts';

/** The Vault route in the URL hash, or null when the hash is not a Vault URL. */
export function useVaultRoute(): VaultRoute | null {
  const [hash, setHash] = useState(() => window.location.hash);
  useEffect(() => {
    const sync = () => setHash(window.location.hash);
    window.addEventListener('hashchange', sync);
    return () => window.removeEventListener('hashchange', sync);
  }, []);
  return parseVaultHash(hash);
}
