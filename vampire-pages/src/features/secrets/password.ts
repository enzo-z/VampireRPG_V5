import { sha256Hex } from './sha256.ts';

// The "Segredos" password is only a curtain, not security: the documents ship with the
// app. The password itself lives in vampire-pages/.env.local (SECRETS_PASSWORD, never
// committed); the build keeps only this hash, and the page compares hashes.

const SALT = 'vampire-pages:segredos:';

export function hashPassword(password: string): string {
  return sha256Hex(SALT + password.trim());
}
