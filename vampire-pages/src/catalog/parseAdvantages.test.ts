import { describe, expect, it } from 'vitest';
import { indexAdvantages, findAdvantage, suggestAdvantages } from './advantages.ts';
import { parseAdvantagesNote, parsePoints } from './parseAdvantages.ts';
import type { AdvantageCatalog } from './types.ts';

// Neutral sample text written for the tests.
const NOTE = `---
publicar: true
tipo: vantagens
---

> [!info] Aviso
> texto

# Merits
## Feeding
### Faro Fino

> - **Fonte**: Core, p. 1
> - **Pontos**: ••
> - **Apelidos**: Farejador, Nariz
>
> - **Sistema**:
>   Efeito do mérito.

# Backgrounds
### Refúgio Exemplo

Descrição curta.

> - **Fonte**: Core, p. 2
> - **Pontos**: • a •••
> - **Apelidos**: Abrigo
> - **Pré-requisito**: nenhum
>
> - **Sistema**:
>   | Pontos | Efeito |
>   |---|---|
>   | ● | pequeno |

# Flaws
## Archaic
### Preso ao Tempo

> - **Fonte**: Core, p. 3
> - **Pontos**: •
> - **Sistema**: Efeito do defeito.

# Outra Coisa
### Ignorado

> - **Pontos**: •
`;

function parsed() {
  const result = parseAdvantagesNote('Advantages', NOTE);
  if (result.status !== 'parsed') throw new Error(result.status);
  return result;
}

describe('parsePoints', () => {
  it('reads fixed values, ranges and "per" values', () => {
    expect(parsePoints('••')).toEqual({ min: 2, max: 2 });
    expect(parsePoints('• a ••••••')).toEqual({ min: 1, max: 6 });
    expect(parsePoints('●–●●●')).toEqual({ min: 1, max: 3 });
    expect(parsePoints('• ou ••')).toEqual({ min: 1, max: 2 });
    expect(parsePoints('• por idioma')).toEqual({ min: 1, max: 5 });
    expect(parsePoints('variável')).toBeNull();
  });
});

describe('parseAdvantagesNote', () => {
  it('reads category, group, points, aliases and other fields of each item', () => {
    expect(parsed().entries.map((e) => [e.name, e.category, e.group, e.points, e.aliases])).toEqual([
      ['Faro Fino', 'merit', 'Feeding', { min: 2, max: 2 }, ['Farejador', 'Nariz']],
      ['Refúgio Exemplo', 'background', null, { min: 1, max: 3 }, ['Abrigo']],
      ['Preso ao Tempo', 'flaw', 'Archaic', { min: 1, max: 1 }, []],
    ]);
    const haven = parsed().entries[1];
    expect(haven).toMatchObject({ source: 'Core, p. 2', description: 'Descrição curta.', fields: [{ label: 'Pré-requisito', markdown: 'nenhum' }] });
    expect(haven?.system).toContain('| ● | pequeno |');
  });

  it('warns about unknown categories and ignores their items', () => {
    expect(parsed().warnings).toEqual(['Advantages: categoria desconhecida "# Outra Coisa"; os itens dela são ignorados.']);
  });

  it('requires publicar: true and tipo: vantagens', () => {
    expect(parseAdvantagesNote('A', NOTE.replace('publicar: true', 'publicar: false'))).toEqual({ status: 'unpublished' });
    expect(parseAdvantagesNote('A', NOTE.replace('tipo: vantagens', 'tipo: outra'))).toEqual({ status: 'invalid', errors: ['A: "tipo" deve ser vantagens.'] });
  });
});

describe('advantage lookup', () => {
  const catalog: AdvantageCatalog = {
    entries: parsed().entries.map((e) => ({ ...e, pointsLabel: '', fields: [], descriptionHtml: '', systemHtml: '' })),
  };
  const index = indexAdvantages(catalog);

  it('searches merits and backgrounds on the advantage side and flaws on the other', () => {
    expect(findAdvantage(index, 'advantage', 'refugio exemplo (casa)')?.name).toBe('Refúgio Exemplo');
    expect(findAdvantage(index, 'advantage', 'abrigo')?.name).toBe('Refúgio Exemplo');
    expect(findAdvantage(index, 'advantage', 'preso ao tempo')).toBeNull();
    expect(findAdvantage(index, 'flaw', 'preso ao tempo')?.name).toBe('Preso ao Tempo');
  });

  it('suggests close entries', () => {
    expect(suggestAdvantages(index, 'advantage', 'faro').map((e) => e.name)).toEqual(['Faro Fino']);
  });
});
