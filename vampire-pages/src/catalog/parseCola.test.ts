import { describe, expect, it } from 'vitest';
import { parseColaNote } from './parseCola.ts';

const NOTE = `---
publicar: true
tipo: cola
---
#rules

Texto de abertura que não vai para a cola.

## Como rolar

Atributo + Perícia.

- Especialidade: +1 dado.

## Termos

### Kindred
Como os vampiros se chamam.

---
### Máscara
Os mortais não podem saber.

## Para saber mais

- [[Regras Fundamentais]]
`;

describe('parseColaNote', () => {
  const result = parseColaNote('Cola do Jogador', NOTE);
  if (result.status !== 'parsed') throw new Error('expected parsed');

  it('reads each "##" section as a block, skipping the intro and "Para saber mais"', () => {
    expect(result.blocks.map((block) => block.title)).toEqual(['Como rolar', 'Termos']);
    expect(result.blocks[0]).toEqual({ title: 'Como rolar', markdown: 'Atributo + Perícia.\n\n- Especialidade: +1 dado.', entries: [] });
  });

  it('reads "###" entries inside a block', () => {
    expect(result.blocks[1]?.entries).toEqual([
      { term: 'Kindred', markdown: 'Como os vampiros se chamam.' },
      { term: 'Máscara', markdown: 'Os mortais não podem saber.' },
    ]);
    expect(result.warnings).toEqual([]);
  });

  it('warns about empty sections and repeated terms', () => {
    const broken = parseColaNote('C', `${NOTE.replace('## Para saber mais', '## Vazia\n\n## Para saber mais')}`.replace('### Máscara', '### Kindred'));
    expect(broken.status === 'parsed' && broken.warnings).toEqual([
      'C: "Kindred" aparece mais de uma vez em "Termos".',
      'C: "Vazia" não tem texto.',
    ]);
  });

  it('ignores unpublished notes', () => {
    expect(parseColaNote('C', NOTE.replace('publicar: true', 'publicar: false'))).toEqual({ status: 'unpublished' });
  });
});
