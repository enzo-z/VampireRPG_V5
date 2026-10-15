import { normalize } from 'node:path';
import type { Plugin } from 'vite';

export interface VaultModuleBuild<T> {
  data: T;
  /** Files read, watched for changes. */
  files: string[];
  errors: string[];
  warnings: string[];
}

interface VaultModuleOptions<T> {
  /** Virtual module id, e.g. "virtual:disciplines". */
  id: string;
  /** File or directory whose changes rebuild the module. */
  watchPath: string;
  build: () => VaultModuleBuild<T>;
}

const MAX_LISTED_WARNINGS = 15;

/** Serves data built from vault notes as a virtual module, rebuilt when the notes change. */
export function vaultModulePlugin<T>({ id, watchPath, build }: VaultModuleOptions<T>): Plugin {
  const resolvedId = `\0${id}`;
  const watched = normalize(watchPath).toLowerCase();
  const isWatched = (file: string) => {
    const path = normalize(file).toLowerCase();
    return path === watched || (path.startsWith(watched) && path.endsWith('.md'));
  };

  return {
    name: `vampire-pages-${id.replace(/^virtual:/, '')}`,
    resolveId(source) {
      return source === id ? resolvedId : undefined;
    },
    load(loadId) {
      if (loadId !== resolvedId) return undefined;
      const { data, files, errors, warnings } = build();
      files.forEach((file) => this.addWatchFile(file));
      if (errors.length > 0) this.error(`Notas do vault com erro (${id}):\n${errors.join('\n')}`);
      if (warnings.length > 0) {
        const listed = warnings.slice(0, MAX_LISTED_WARNINGS).join('\n  ');
        const more = warnings.length > MAX_LISTED_WARNINGS ? `\n  … e mais ${warnings.length - MAX_LISTED_WARNINGS}` : '';
        this.warn(`${warnings.length} aviso(s) em ${id}:\n  ${listed}${more}`);
      }
      return `export default ${JSON.stringify(data)};`;
    },
    configureServer(server) {
      server.watcher.add(watchPath);
      const reload = (file: string) => {
        if (!isWatched(file)) return;
        const module = server.moduleGraph.getModuleById(resolvedId);
        if (module !== undefined) server.moduleGraph.invalidateModule(module);
        server.ws.send({ type: 'full-reload' });
      };
      server.watcher.on('change', reload).on('add', reload).on('unlink', reload);
    },
  };
}
