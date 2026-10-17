// Vault URLs live in the hash, so links inside notes, the browser's back button
// and bookmarks all work: "#/vault", "#/vault/dano", "#/vault/dano/margem".
// Shared with the build (vite/vaultMarkdown.ts), so no DOM here.

export const VAULT_HASH = '#/vault';

export interface VaultRoute {
  /** Note slug; null for the Vault's home. */
  slug: string | null;
  /** Heading id inside the note, or null for its top. */
  headingId: string | null;
}

export function isVaultHash(hash: string): boolean {
  return hash === VAULT_HASH || hash.startsWith(`${VAULT_HASH}/`);
}

function decode(part: string | undefined): string | null {
  if (part === undefined || part === '') return null;
  try {
    return decodeURIComponent(part);
  } catch {
    return null;
  }
}

/** Null when the hash is not a Vault URL. */
export function parseVaultHash(hash: string): VaultRoute | null {
  if (!isVaultHash(hash)) return null;
  const [slug, headingId] = hash.slice(VAULT_HASH.length + 1).split('/');
  const parsedSlug = decode(slug);
  return { slug: parsedSlug, headingId: parsedSlug === null ? null : decode(headingId) };
}

export function vaultHash(slug: string | null, headingId: string | null = null): string {
  if (slug === null) return VAULT_HASH;
  const note = `${VAULT_HASH}/${encodeURIComponent(slug)}`;
  return headingId === null ? note : `${note}/${encodeURIComponent(headingId)}`;
}
