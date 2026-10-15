import { normalize } from 'node:path';
import type { Plugin } from 'vite';
import { buildCatalog } from './buildCatalog.ts';

const VIRTUAL_ID = 'virtual:disciplines';
const RESOLVED_ID = `\0${VIRTUAL_ID}`;
const MAX_LISTED_WARNINGS = 15;

/** Exposes the discipline notes of the vault as `virtual:disciplines`, rebuilt when a note changes. */
export function disciplinesPlugin(notesDir: string): Plugin {
  const dir = normalize(notesDir).toLowerCase();
  const isNote = (file: string) => {
    const path = normalize(file).toLowerCase();
    return path.startsWith(dir) && path.endsWith('.md');
  };

  return {
    name: 'vampire-pages-disciplines',
    resolveId(id) {
      return id === VIRTUAL_ID ? RESOLVED_ID : undefined;
    },
    load(id) {
      if (id !== RESOLVED_ID) return undefined;
      const { catalog, files, errors, warnings } = buildCatalog(notesDir);
      files.forEach((file) => this.addWatchFile(file));
      if (errors.length > 0) this.error(`Notas de disciplina com erro:\n${errors.join('\n')}`);
      if (warnings.length > 0) {
        const listed = warnings.slice(0, MAX_LISTED_WARNINGS).join('\n  ');
        const more = warnings.length > MAX_LISTED_WARNINGS ? `\n  … e mais ${warnings.length - MAX_LISTED_WARNINGS}` : '';
        this.warn(`${warnings.length} aviso(s) nas notas de disciplina:\n  ${listed}${more}`);
      }
      return `export default ${JSON.stringify(catalog)};`;
    },
    configureServer(server) {
      server.watcher.add(notesDir);
      const reload = (file: string) => {
        if (!isNote(file)) return;
        const module = server.moduleGraph.getModuleById(RESOLVED_ID);
        if (module !== undefined) server.moduleGraph.invalidateModule(module);
        server.ws.send({ type: 'full-reload' });
      };
      server.watcher.on('change', reload).on('add', reload).on('unlink', reload);
    },
  };
}
