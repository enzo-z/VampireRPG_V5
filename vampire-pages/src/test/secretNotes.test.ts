import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { buildSecrets } from '../../vite/buildSecrets.ts';

// Contract between the players' READMEs ("Narrador/Relacionamentos/Para o Jogador")
// and the printed "Segredos" documents.
const NOTES_DIR = fileURLToPath(new URL('../../../Narrador/Relacionamentos/Para o Jogador', import.meta.url));
const build = buildSecrets(NOTES_DIR);
const printed = (slug: string) => JSON.stringify(build.data.documents.find((document) => document.slug === slug) ?? null);

describe('player READMEs', () => {
  it('build without errors or warnings', () => {
    expect(build.errors).toEqual([]);
    expect(build.warnings).toEqual([]);
  });

  it("publish Khalid's document", () => {
    const khalid = build.data.documents.find((document) => document.slug === 'khalid-hassan-yusuf');
    expect(khalid?.character).toBe('Khalid Hassan Yusuf');
    expect(khalid?.sections.map((section) => section.title)).toContain('Os segredos que você guarda');
  });

  it.each(build.data.documents.map((document) => document.slug))('%s: keeps Obsidian-only parts and the chronicle name out', (slug) => {
    const text = printed(slug);
    expect(text).not.toMatch(/mermaid|flowchart|\[\[|#readme/);
    expect(text).not.toContain('Sumário');
    expect(text).not.toContain('Mapa de relacionamentos');
    expect(text.toLowerCase()).not.toContain('auld');
  });
});
