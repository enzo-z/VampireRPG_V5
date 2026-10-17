import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
import { loadEnv, searchForWorkspaceRoot } from 'vite';
import { defineConfig } from 'vitest/config';
import { hashPassword } from './src/features/secrets/password.ts';
import { buildAdvantages } from './vite/buildAdvantages.ts';
import { buildBlood } from './vite/buildBlood.ts';
import { buildClans } from './vite/buildClans.ts';
import { buildCola } from './vite/buildCola.ts';
import { buildDisciplineModule } from './vite/buildCatalog.ts';
import { buildNyMap } from './vite/buildNyMap.ts';
import { buildPlayerColas } from './vite/buildPlayerColas.ts';
import { buildPredatorTypes } from './vite/buildPredatorTypes.ts';
import { buildSecrets } from './vite/buildSecrets.ts';
import { buildVault, type VaultSources } from './vite/buildVault.ts';
import { vaultModulePlugin } from './vite/vaultModulePlugin.ts';

// vampire-pages/ lives inside the vault; these notes are read at build time.
const DISCIPLINE_NOTES_DIR = fileURLToPath(new URL('../O Sangue (Vitae)/Disciplinas', import.meta.url));
const ADVANTAGES_NOTE = fileURLToPath(new URL('../Advantages.md', import.meta.url));
const COLA_NOTE = fileURLToPath(new URL('../Regras/Cola do Jogador.md', import.meta.url));
const PLAYER_COLAS_DIR = fileURLToPath(new URL('../Regras/Colas dos Jogadores', import.meta.url));
const CLANS_NOTE = fileURLToPath(new URL('../O Sangue (Vitae)/Clãs.md', import.meta.url));
const BLOOD_NOTE = fileURLToPath(new URL('../O Sangue (Vitae)/Gerações e Potência.md', import.meta.url));
const PREDATOR_TYPES_NOTE = fileURLToPath(new URL('../Fome, a Caça e a Besta/Predator Type.md', import.meta.url));
const PLAYER_NOTES_DIR = fileURLToPath(new URL('../Narrador/Relacionamentos/Para o Jogador', import.meta.url));
const NY_MAP_NOTE = fileURLToPath(new URL('../Narrador/Nova York/Mapa de Nova York.md', import.meta.url));
const CONFIG_DIR = fileURLToPath(new URL('.', import.meta.url));

// "Vault": notes with publicar: true and vault: <group>. Narrador/ is never read here.
const VAULT_SOURCES: VaultSources = {
  root: fileURLToPath(new URL('..', import.meta.url)),
  folders: ['Regras', 'Fome, a Caça e a Besta', 'O Sangue (Vitae)', 'Lore'],
  attachmentFolders: ['Images', 'Audio'],
};
/** The root's own notes are watched one by one: watching the root would pull in every worktree and PDF. */
const VAULT_WATCH_PATHS = [
  ...VAULT_SOURCES.folders.map((folder) => join(VAULT_SOURCES.root, folder)),
  ...readdirSync(VAULT_SOURCES.root)
    .filter((name) => name.toLowerCase().endsWith('.md'))
    .map((name) => join(VAULT_SOURCES.root, name)),
];

/** "Segredos" password: SECRETS_PASSWORD in .env.local (never committed); only its hash reaches the app. */
function secretsPasswordHash(mode: string): string | null {
  const password = (process.env['SECRETS_PASSWORD'] ?? loadEnv(mode, CONFIG_DIR, '')['SECRETS_PASSWORD'] ?? '').trim();
  return password === '' ? null : hashPassword(password);
}

export default defineConfig(({ mode }) => ({
  define: {
    __SECRETS_PASSWORD_HASH__: JSON.stringify(secretsPasswordHash(mode)),
  },
  plugins: [
    react(),
    vaultModulePlugin({ id: 'virtual:disciplines', watchPath: DISCIPLINE_NOTES_DIR, build: () => buildDisciplineModule(DISCIPLINE_NOTES_DIR) }),
    vaultModulePlugin({ id: 'virtual:advantages', watchPath: ADVANTAGES_NOTE, build: () => buildAdvantages(ADVANTAGES_NOTE) }),
    vaultModulePlugin({ id: 'virtual:cola', watchPath: COLA_NOTE, build: () => buildCola(COLA_NOTE) }),
    vaultModulePlugin({ id: 'virtual:player-colas', watchPath: PLAYER_COLAS_DIR, build: () => buildPlayerColas(PLAYER_COLAS_DIR) }),
    vaultModulePlugin({ id: 'virtual:clans', watchPath: CLANS_NOTE, build: () => buildClans(CLANS_NOTE) }),
    vaultModulePlugin({ id: 'virtual:blood', watchPath: BLOOD_NOTE, build: () => buildBlood(BLOOD_NOTE) }),
    vaultModulePlugin({ id: 'virtual:predator-types', watchPath: PREDATOR_TYPES_NOTE, build: () => buildPredatorTypes(PREDATOR_TYPES_NOTE) }),
    vaultModulePlugin({ id: 'virtual:secrets', watchPath: PLAYER_NOTES_DIR, build: () => buildSecrets(PLAYER_NOTES_DIR) }),
    vaultModulePlugin({ id: 'virtual:ny-map', watchPath: NY_MAP_NOTE, build: () => buildNyMap(NY_MAP_NOTE) }),
    vaultModulePlugin({ id: 'virtual:vault', watchPath: VAULT_WATCH_PATHS, build: () => buildVault(VAULT_SOURCES) }),
  ],
  server: {
    // Vault images and audio live in the vault, outside this project.
    fs: { allow: [searchForWorkspaceRoot(CONFIG_DIR), ...VAULT_SOURCES.attachmentFolders.map((folder) => join(VAULT_SOURCES.root, folder))] },
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts', 'vite/**/*.test.ts'],
  },
}));
