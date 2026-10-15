import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';
import { disciplinesPlugin } from './vite/disciplinesPlugin.ts';

// vampire-pages/ lives inside the vault; discipline notes are read at build time.
const DISCIPLINE_NOTES_DIR = fileURLToPath(new URL('../O Sangue (Vitae)/Disciplinas', import.meta.url));

export default defineConfig({
  plugins: [react(), disciplinesPlugin(DISCIPLINE_NOTES_DIR)],
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts', 'vite/**/*.test.ts'],
  },
});
