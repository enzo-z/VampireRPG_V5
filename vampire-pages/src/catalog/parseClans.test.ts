import { describe, expect, it } from 'vitest';
import { parseClansNote } from './parseClans.ts';

const NOTE = `---
publicar: true
---
# Introdução

Texto.

---
# Banes (Maldições)

### Maldição dos Brujah

Subtraia a Bane Severity.

---
### Maldição do Ministry

Luz direta.

---
# Compulsões de Clã

## Brujah: Rebelião

>- **Penalidade**: dois dados.

---
## Ministry: Transgressão

Seduzir.

---
# Perfis dos Clãs

## Brujah

> - **Fonte**: Core, pp. 64-67 · texto do app do Pedro
> - **Apelidos**: Rabble, Punks
> - **Seita**: Anarquistas
> - **Disciplinas**: Celerity, Potence, Presence
> - **Bane (resumo)**: Frenesi de Fúria.
> - **Compulsão (resumo)**: −2 dados.
>
> - **Sistema**:
>   Clã erudito.
>
>   **Para o Narrador:** pressão.

---
## Ministry

> - **Fonte**: Player's Guide, p. 36
> - **Seita**: Anarquistas
> - **Disciplinas**: Obfuscate, Presence, Protean
> - **Bane (resumo)**: Luz.
> - **Compulsão (resumo)**: Stain.
>
> - **Sistema**:
>   Culto.

---
## Caitiff

> - **Fonte**: Core, p. 107
> - **Seita**: Qualquer
> - **Disciplinas**: Quaisquer três
> - **Bane (resumo)**: Sem Bane.
> - **Compulsão (resumo)**: Sem Compulsão.
>
> - **Sistema**:
>   Sem clã.
`;

describe('parseClansNote', () => {
  const result = parseClansNote('Clãs', NOTE);
  if (result.status !== 'parsed') throw new Error('expected parsed');
  const [brujah, ministry, caitiff] = result.clans;

  it('reads every profile with its fields', () => {
    expect(result.clans.map((clan) => clan.name)).toEqual(['Brujah', 'Ministry', 'Caitiff']);
    expect(brujah).toMatchObject({
      aliases: ['Rabble', 'Punks'],
      source: 'Core, pp. 64-67 · texto do app do Pedro',
      sect: 'Anarquistas',
      disciplines: ['Celerity', 'Potence', 'Presence'],
      baneSummary: 'Frenesi de Fúria.',
      compulsionSummary: '−2 dados.',
      description: 'Clã erudito.\n\n**Para o Narrador:** pressão.',
    });
  });

  it('attaches the bane and the compulsion of the same clan ("dos" or "do")', () => {
    expect(brujah?.bane).toEqual({ title: 'Maldição dos Brujah', markdown: 'Subtraia a Bane Severity.' });
    expect(brujah?.compulsion).toEqual({ title: 'Rebelião', markdown: '>- **Penalidade**: dois dados.' });
    expect(ministry?.bane?.title).toBe('Maldição do Ministry');
    expect(ministry?.compulsion?.title).toBe('Transgressão');
  });

  it('lets Caitiff and Thin-Bloods go without bane nor compulsion', () => {
    expect([caitiff?.bane, caitiff?.compulsion]).toEqual([null, null]);
    expect(result.warnings).toEqual([]);
  });

  it('warns about a clan missing its bane, and a bane without a profile', () => {
    const broken = parseClansNote('Clãs', NOTE.replace('### Maldição dos Brujah', '### Maldição dos Gangrel'));
    expect(broken.status === 'parsed' && broken.warnings).toEqual([
      'Clãs: "Brujah" sem "### Maldição dos Brujah".',
      'Clãs: "Maldição dos Gangrel" não tem perfil em "# Perfis dos Clãs".',
    ]);
  });

  it('ignores unpublished notes', () => {
    expect(parseClansNote('Clãs', NOTE.replace('publicar: true', 'publicar: false'))).toEqual({ status: 'unpublished' });
  });
});
