declare module 'virtual:ny-map' {
  import type { NyMapCatalog } from './types.ts';

  /** Null when the note is missing or not published. */
  const map: NyMapCatalog | null;
  export default map;
}
