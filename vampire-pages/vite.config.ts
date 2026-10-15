import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';
import { buildAdvantages } from './vite/buildAdvantages.ts';
import { buildBlood } from './vite/buildBlood.ts';
import { buildClans } from './vite/buildClans.ts';
import { buildCola } from './vite/buildCola.ts';
import { buildDisciplineModule } from './vite/buildCatalog.ts';
import { buildPredatorTypes } from './vite/buildPredatorTypes.ts';
import { vaultModulePlugin } from './vite/vaultModulePlugin.ts';

// vampire-pages/ lives inside the vault; these notes are read at build time.
const DISCIPLINE_NOTES_DIR = fileURLToPath(new URL('../O Sangue (Vitae)/Disciplinas', import.meta.url));
const ADVANTAGES_NOTE = fileURLToPath(new URL('../Advantages.md', import.meta.url));
const COLA_NOTE = fileURLToPath(new URL('../Regras/Cola do Jogador.md', import.meta.url));
const CLANS_NOTE = fileURLToPath(new URL('../O Sangue (Vitae)/Clãs.md', import.meta.url));
const BLOOD_NOTE = fileURLToPath(new URL('../O Sangue (Vitae)/Gerações e Potência.md', import.meta.url));
const PREDATOR_TYPES_NOTE = fileURLToPath(new URL('../Fome, a Caça e a Besta/Predator Type.md', import.meta.url));

export default defineConfig({
  plugins: [
    react(),
    vaultModulePlugin({ id: 'virtual:disciplines', watchPath: DISCIPLINE_NOTES_DIR, build: () => buildDisciplineModule(DISCIPLINE_NOTES_DIR) }),
    vaultModulePlugin({ id: 'virtual:advantages', watchPath: ADVANTAGES_NOTE, build: () => buildAdvantages(ADVANTAGES_NOTE) }),
    vaultModulePlugin({ id: 'virtual:cola', watchPath: COLA_NOTE, build: () => buildCola(COLA_NOTE) }),
    vaultModulePlugin({ id: 'virtual:clans', watchPath: CLANS_NOTE, build: () => buildClans(CLANS_NOTE) }),
    vaultModulePlugin({ id: 'virtual:blood', watchPath: BLOOD_NOTE, build: () => buildBlood(BLOOD_NOTE) }),
    vaultModulePlugin({ id: 'virtual:predator-types', watchPath: PREDATOR_TYPES_NOTE, build: () => buildPredatorTypes(PREDATOR_TYPES_NOTE) }),
  ],
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts', 'vite/**/*.test.ts'],
  },
});
