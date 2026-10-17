import { sha256Hex } from './sha256.ts';

// The "Segredos" password is only a curtain, not security: the documents ship with the
// app. The password comes from SECRETS_PASSWORD (vampire-pages/.env.local, never committed,
// or a GitHub secret on Pages), else the default; the build keeps only its hash.

const SALT = 'vampire-pages:segredos:';

/** Used when SECRETS_PASSWORD is missing or blank (no .env.local, or no GitHub secret). Change it. */
export const DEFAULT_SECRETS_PASSWORD = '123@mudar';

/** The configured password, or the default one when it is missing or blank. */
export function secretsPassword(configured: string | undefined): string {
  const password = configured?.trim() ?? '';
  return password === '' ? DEFAULT_SECRETS_PASSWORD : password;
}

export function hashPassword(password: string): string {
  return sha256Hex(SALT + password.trim());
}
