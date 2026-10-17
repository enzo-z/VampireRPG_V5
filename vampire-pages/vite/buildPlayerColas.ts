import { existsSync, readdirSync } from 'node:fs';
import { basename, join } from 'node:path';
import type { PlayerColaCatalog } from '../src/catalog/types.ts';
import { buildCola } from './buildCola.ts';
import type { VaultModuleBuild } from './vaultModulePlugin.ts';

/** Reads every published note of Regras/Colas dos Jogadores/ (one per character) with the Cola parser. */
export function buildPlayerColas(dir: string): VaultModuleBuild<PlayerColaCatalog> {
  const empty: PlayerColaCatalog = { notes: [] };
  if (!existsSync(dir)) return { data: empty, files: [], errors: [], warnings: [`${dir} não encontrado.`] };

  const result: VaultModuleBuild<PlayerColaCatalog> = { data: { notes: [] }, files: [], errors: [], warnings: [] };
  for (const file of readdirSync(dir).filter((name) => name.endsWith('.md')).sort()) {
    const path = join(dir, file);
    const built = buildCola(path);
    result.files.push(...built.files);
    result.errors.push(...built.errors);
    result.warnings.push(...built.warnings);
    if (built.data.blocks.length > 0) result.data.notes.push({ name: basename(file, '.md'), cola: built.data });
  }
  return result;
}
