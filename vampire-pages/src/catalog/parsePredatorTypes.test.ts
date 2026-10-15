import { describe, expect, it } from 'vitest';
import { parsePredatorTypeNote } from './parsePredatorTypes.ts';

const NOTE = `---
publicar: true
---
#concept #hunting

Introdução que não é um Predator Type.

# Sumário

- [Alleycat](#Alleycat)

---
# Alleycat

Você ataca de surpresa.

- **Ganhe um ponto em:** Celerity ou Potence.
---
# Headhunter/Blood Leech

Você se alimenta de outros vampiros.
---
# Pursuer

Você persegue a vítima.

**Fonte:** Player's Guide, pp. 108–109 (não está no Core).

- **Perda:** um ponto de Humanidade.
`;

describe('parsePredatorTypeNote', () => {
  const result = parsePredatorTypeNote('Predator Type', NOTE);
  const entries = result.status === 'parsed' ? result.entries : [];

  it('reads one entry per "# Name" section, skipping the summary and the intro', () => {
    expect(entries.map((entry) => entry.title)).toEqual(['Alleycat', 'Headhunter/Blood Leech', 'Pursuer']);
    expect(result.status === 'parsed' && result.warnings).toEqual([]);
  });

  it('splits "A/B" headings into names', () => {
    expect(entries[1]?.names).toEqual(['Headhunter', 'Blood Leech']);
  });

  it('keeps the section text without separators', () => {
    expect(entries[0]?.markdown).toBe('Você ataca de surpresa.\n\n- **Ganhe um ponto em:** Celerity ou Potence.');
  });

  it('moves the "Fonte" paragraph to the source', () => {
    expect(entries[2]?.source).toBe("Player's Guide, pp. 108–109 (não está no Core).");
    expect(entries[2]?.markdown).not.toContain('Fonte');
    expect(entries[0]?.source).toBeNull();
  });

  it('ignores unpublished notes', () => {
    expect(parsePredatorTypeNote('Predator Type', NOTE.replace('publicar: true', 'publicar: false'))).toEqual({ status: 'unpublished' });
    expect(parsePredatorTypeNote('Predator Type', '# Alleycat\n\ntexto')).toEqual({ status: 'unpublished' });
  });

  it('warns about repeated names and empty sections', () => {
    const repeated = parsePredatorTypeNote('Predator Type', `${NOTE}\n# Alleycat\n`);
    expect(repeated.status === 'parsed' && repeated.warnings).toEqual([
      'Predator Type: "Alleycat" não tem texto.',
      'Predator Type: "Alleycat" aparece mais de uma vez.',
    ]);
  });
});
