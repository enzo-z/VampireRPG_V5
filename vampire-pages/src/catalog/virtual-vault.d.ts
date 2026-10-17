declare module 'virtual:vault' {
  import type { VaultCatalog } from './types.ts';

  /** Bundled URLs of the images and audio, indexed by data-vault-asset and VaultNote.banner. */
  export const assets: readonly string[];
  const catalog: VaultCatalog;
  export default catalog;
}
