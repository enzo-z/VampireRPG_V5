import { useCallback, useState } from 'react';
import { hashPassword } from './password.ts';

const PASSWORD_HASH: string | null = __SECRETS_PASSWORD_HASH__;
/** Unlocked until the tab closes. */
const STORAGE_KEY = 'vampire-pages:segredos';

function storedHash(): string | null {
  try {
    return sessionStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function storeHash(hash: string | null): void {
  try {
    if (hash === null) sessionStorage.removeItem(STORAGE_KEY);
    else sessionStorage.setItem(STORAGE_KEY, hash);
  } catch {
    // Private mode or blocked storage: the lock just lasts until a reload.
  }
}

export interface SecretsLock {
  /** False when .env.local has no SECRETS_PASSWORD: the section stays closed. */
  configured: boolean;
  unlocked: boolean;
  /** True when the password is right. */
  unlock: (password: string) => boolean;
  lock: () => void;
}

export function useSecretsLock(): SecretsLock {
  const [unlocked, setUnlocked] = useState(() => PASSWORD_HASH !== null && storedHash() === PASSWORD_HASH);

  const unlock = useCallback((password: string) => {
    const ok = PASSWORD_HASH !== null && hashPassword(password) === PASSWORD_HASH;
    if (ok) storeHash(PASSWORD_HASH);
    setUnlocked(ok);
    return ok;
  }, []);

  const lock = useCallback(() => {
    storeHash(null);
    setUnlocked(false);
  }, []);

  return { configured: PASSWORD_HASH !== null, unlocked, unlock, lock };
}
