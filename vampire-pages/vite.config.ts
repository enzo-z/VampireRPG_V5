import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';
import { buildAdvantages } from './vite/buildAdvantages.ts';
import { buildDisciplineModule } from './vite/buildCatalog.ts';
import { vaultModulePlugin } from './vite/vaultModulePlugin.ts';

// vampire-pages/ lives inside the vault; these notes are read at build time.
const DISCIPLINE_NOTES_DIR = fileURLToPath(new URL('../O Sangue (Vitae)/Disciplinas', import.meta.url));
const ADVANTAGES_NOTE = fileURLToPath(new URL('../Advantages.md', import.meta.url));

export default defineConfig({
  plugins: [
    react(),
    vaultModulePlugin({ id: 'virtual:disciplines', watchPath: DISCIPLINE_NOTES_DIR, build: () => buildDisciplineModule(DISCIPLINE_NOTES_DIR) }),
    vaultModulePlugin({ id: 'virtual:advantages', watchPath: ADVANTAGES_NOTE, build: () => buildAdvantages(ADVANTAGES_NOTE) }),
  ],
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts', 'vite/**/*.test.ts'],
  },
});
