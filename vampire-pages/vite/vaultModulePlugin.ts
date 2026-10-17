import { normalize } from 'node:path';
import { normalizePath, type Plugin } from 'vite';

export interface VaultModuleBuild<T> {
  data: T;
  /** Files read, watched for changes. */
  files: string[];
  errors: string[];
  warnings: string[];
  /** Files bundled by Vite; the module also exports their URLs as `assets`, in this order. */
  assets?: string[];
}

interface VaultModuleOptions<T> {
  /** Virtual module id, e.g. "virtual:disciplines". */
  id: string;
  /** Files or directories whose changes rebuild the module. */
  watchPath: string | readonly string[];
  build: () => VaultModuleBuild<T>;
}

const MAX_LISTED_WARNINGS = 15;

/** `export default <data>`, plus `export const assets` with one bundled URL per file (`?url` works for any file type). */
function moduleCode(data: unknown, assets: readonly string[]): string {
  const imports = assets.map((file, index) => `import asset${index} from ${JSON.stringify(`${normalizePath(file)}?url`)};`);
  const list = assets.map((_file, index) => `asset${index}`).join(', ');
  return [...imports, `export const assets = [${list}];`, `export default ${JSON.stringify(data)};`].join('\n');
}

/** Serves data built from vault notes as a virtual module, rebuilt when the notes change. */
export function vaultModulePlugin<T>({ id, watchPath, build }: VaultModuleOptions<T>): Plugin {
  const resolvedId = `\0${id}`;
  const watchPaths = typeof watchPath === 'string' ? [watchPath] : watchPath;
  const watched = watchPaths.map((path) => normalize(path).toLowerCase());
  const isWatched = (file: string) => {
    const path = normalize(file).toLowerCase();
    return watched.some((root) => path === root || (path.startsWith(root) && path.endsWith('.md')));
  };

  return {
    name: `vampire-pages-${id.replace(/^virtual:/, '')}`,
    resolveId(source) {
      return source === id ? resolvedId : undefined;
    },
    load(loadId) {
      if (loadId !== resolvedId) return undefined;
      const { data, files, errors, warnings, assets = [] } = build();
      files.forEach((file) => this.addWatchFile(file));
      if (errors.length > 0) this.error(`Notas do vault com erro (${id}):\n${errors.join('\n')}`);
      if (warnings.length > 0) {
        const listed = warnings.slice(0, MAX_LISTED_WARNINGS).join('\n  ');
        const more = warnings.length > MAX_LISTED_WARNINGS ? `\n  … e mais ${warnings.length - MAX_LISTED_WARNINGS}` : '';
        this.warn(`${warnings.length} aviso(s) em ${id}:\n  ${listed}${more}`);
      }
      return moduleCode(data, assets);
    },
    configureServer(server) {
      server.watcher.add([...watchPaths]);
      const reload = (file: string) => {
        if (!isWatched(file)) return;
        const module = server.moduleGraph.getModuleById(resolvedId);
        if (module !== undefined) server.moduleGraph.invalidateModule(module);
        server.ws.send({ type: 'full-reload' });
      };
      // One listener per event for each of these plugins; keep Node's leak warning meaningful.
      server.watcher.setMaxListeners(server.watcher.getMaxListeners() + 1);
      server.watcher.on('change', reload).on('add', reload).on('unlink', reload);
    },
  };
}
