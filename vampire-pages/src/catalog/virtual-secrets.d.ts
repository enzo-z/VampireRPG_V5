declare module 'virtual:secrets' {
  import type { SecretsCatalog } from './types.ts';

  const catalog: SecretsCatalog;
  export default catalog;
}
