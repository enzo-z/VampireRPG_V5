import { describe, expect, it } from 'vitest';
import { generationsInTitle, parseBloodNote } from './parseBlood.ts';

const ROWS = Array.from({ length: 11 }, (_, level) => `| ${level} | +${level} | ${level} Superficial | Nenhum | Nível 1 | ${level} | Sem efeito |`).join('\n');

const NOTE = `---
publicar: true
---
#lore

# As Gerações : Proximidade com Caim

Texto geral.

---
# Lista de Gerações

### Anciões: 6ª até 9ª Geração

Líderes antigos.

---
### Neonatos: 12ª e 13ª Gerações

Recém-chegados.

---
# Blood Potency

![[tabela.png]]

| Blood Potency | Blood Surge | Mend (por Rouse Check) | Bônus de Disciplina | Re-roll do Rouse Check | Bane Severity | Alimentação |
|---|---|---|---|---|---|---|
${ROWS}

---
### Blood Potency 1
Você é um vampiro verdadeiro.

#### Efeitos:
- Bane 1.

---
### Blood Potency 6 e Maior

Anciões alienígenas.
`;

describe('generationsInTitle', () => {
  it('reads lists and ranges of ordinals', () => {
    expect(generationsInTitle('Neonatos: 12ª e 13ª Gerações')).toEqual([12, 13]);
    expect(generationsInTitle('Anciões: 6ª até 9ª Geração')).toEqual([6, 7, 8, 9]);
    expect(generationsInTitle('14ª a 16ª Gerações: Sangue-Fraco')).toEqual([14, 15, 16]);
    expect(generationsInTitle('Antediluvianos: 3ª Geração')).toEqual([3]);
    expect(generationsInTitle('Sem número')).toEqual([]);
  });
});

describe('parseBloodNote', () => {
  const result = parseBloodNote('Gerações e Potência', NOTE);
  if (result.status !== 'parsed') throw new Error('expected parsed');

  it('reads generation sections with the generations they cover', () => {
    expect(result.generations.map((g) => [g.title, g.generations])).toEqual([
      ['Anciões: 6ª até 9ª Geração', [6, 7, 8, 9]],
      ['Neonatos: 12ª e 13ª Gerações', [12, 13]],
    ]);
    expect(result.generations[1]?.markdown).toBe('Recém-chegados.');
  });

  it('reads the Blood Potency table, one row per level', () => {
    expect(result.table).toHaveLength(11);
    expect(result.table[3]).toEqual({ level: 3, surge: '+3', mend: '3 Superficial', disciplineBonus: 'Nenhum', rouseReRoll: 'Nível 1', baneSeverity: '3', feeding: 'Sem efeito' });
  });

  it('reads level sections, marking "e Maior"', () => {
    expect(result.levels.map((level) => [level.level, level.orMore])).toEqual([[1, false], [6, true]]);
    expect(result.levels[0]?.markdown).toBe('Você é um vampiro verdadeiro.\n\n#### Efeitos:\n- Bane 1.');
  });

  it('has no warnings for a well-formed note', () => {
    expect(result.warnings).toEqual([]);
  });

  it('warns about a missing table row', () => {
    const broken = parseBloodNote('G', NOTE.replace('| 4 | +4', '| x | +4'));
    expect(broken.status === 'parsed' && broken.warnings).toEqual([
      'G: linha da tabela ilegível: | x | +4 | 4 Superficial | Nenhum | Nível 1 | 4 | Sem efeito |',
      'G: a tabela deve ter os níveis 0 a 10, em ordem.',
    ]);
  });

  it('ignores unpublished notes', () => {
    expect(parseBloodNote('G', NOTE.replace('publicar: true', 'publicar: false'))).toEqual({ status: 'unpublished' });
  });
});
