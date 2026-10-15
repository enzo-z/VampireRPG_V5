import { describe, expect, it } from 'vitest';
import { dedent, parseDisciplineNote, parseFrontmatter, type ParsedNote } from './parseNote.ts';

// Fixtures use neutral sample text, written for the tests.
const NOTE = `---
publicar: true
tipo: disciplina
disciplina: Exemplo
apelidos: ["Primeiro", "Segundo"]
categoria: Físico
ameaca_mascara: Média
resonance: Choleric
tags: [disciplina]
---

# Exemplo

> [!info] Texto do app do Pedro
> Aviso de revisão.

![[Exemplo (Pequeno).png]]
- **Nicknames**: Primeiro, Segundo
- **Tipo**: Físico
- **Ameaça à [[Camarilla|Máscara]]**: Média.
	Explicação da ameaça.
- [[Resonance]]: Choleric
    Fontes de sangue.

Parágrafo de introdução com [[Kindred]].

## Regras Gerais de Exemplo

> Uma regra geral.

---
## Nível 1

>⚠️ **Nota**: aviso por nível.

### Poder Antigo

>- **Custo**: Free
 >- **Duração**: Uma cena
> - **Dice Pools:** Não possui
>
>- **System (Regras)**:
>   Texto principal.
>
>	 - **Detalhe:**
>	 Explicação do detalhe.

### Poder Novo

Descrição curta.

> - **Fonte**: Core, p. 10 · texto do app do Pedro
> - **Custo**: Um Rouse Check
> - **Amálgama**: Outra 1
>
> - **Sistema**:
>   Primeira linha.
>   - item

---
## Nível 3

### Ritual Estranho

> - **Fonte**: Livro, p. 3
> - **Teste de Ritual** (Regras gerais de Rituais):
> 	 (Intelligence + Blood Sorcery) com Dificuldade 2
> - **Sistema**: Efeito em uma linha.

Observação depois do bloco.
`;

function parsed(text: string): { note: ParsedNote; warnings: string[] } {
  const result = parseDisciplineNote('Exemplo', text);
  if (result.status !== 'parsed') throw new Error(`expected parsed, got ${result.status}`);
  return result;
}

describe('parseFrontmatter', () => {
  it('reads strings, quoted strings and lists', () => {
    const result = parseFrontmatter('---\na: 1\nb: "dois"\nc: ["x", y, \'z\']\n---\ncorpo');
    expect(result?.fields).toEqual({ a: '1', b: 'dois', c: ['x', 'y', 'z'] });
    expect(result?.body).toBe('corpo');
  });

  it('returns null without frontmatter', () => {
    expect(parseFrontmatter('# Título')).toBeNull();
  });
});

describe('dedent', () => {
  it('expands tabs and removes the common indentation', () => {
    expect(dedent(['   texto', '\t - item', ''])).toBe('texto\n  - item');
  });
});

describe('parseDisciplineNote', () => {
  it('reads the frontmatter metadata', () => {
    const { note } = parsed(NOTE);
    expect(note).toMatchObject({
      noteName: 'Exemplo',
      kind: 'disciplina',
      discipline: 'Exemplo',
      nicknames: ['Primeiro', 'Segundo'],
      category: 'Físico',
      masquerade: 'Média',
      resonance: 'Choleric',
    });
  });

  it('keeps only the prose of the intro (no review notice, images or metadata bullets)', () => {
    expect(parsed(NOTE).note.intro).toBe('Parágrafo de introdução com [[Kindred]].');
  });

  it('collects non-level sections', () => {
    expect(parsed(NOTE).note.sections).toEqual([{ title: 'Regras Gerais de Exemplo', markdown: '> Uma regra geral.' }]);
  });

  it('parses entries by level, ignoring per-level notices', () => {
    expect(parsed(NOTE).note.entries.map((e) => [e.name, e.level, e.kind])).toEqual([
      ['Poder Antigo', 1, 'power'],
      ['Poder Novo', 1, 'power'],
      ['Ritual Estranho', 3, 'power'],
    ]);
  });

  it('normalizes field labels and keeps the system text with its nesting', () => {
    const entry = parsed(NOTE).note.entries[0];
    expect(entry?.fields).toEqual([
      { label: 'Custo', markdown: 'Free' },
      { label: 'Duração', markdown: 'Uma cena' },
      { label: 'Dice Pool', markdown: 'Não possui' },
    ]);
    expect(entry?.system).toBe('Texto principal.\n\n  - **Detalhe:**\n  Explicação do detalhe.');
  });

  it('separates description, source and fields of a generated entry', () => {
    const entry = parsed(NOTE).note.entries[1];
    expect(entry).toMatchObject({
      description: 'Descrição curta.',
      source: 'Core, p. 10 · texto do app do Pedro',
      fields: [
        { label: 'Custo', markdown: 'Um Rouse Check' },
        { label: 'Amálgama', markdown: 'Outra 1' },
      ],
      system: 'Primeira linha.\n- item',
    });
  });

  it('accepts a parenthetical after the label and a value on the next line; text after the block joins the system', () => {
    const entry = parsed(NOTE).note.entries[2];
    expect(entry?.fields.find((f) => f.label === 'Teste de Ritual')?.markdown).toBe('(Intelligence + Blood Sorcery) com Dificuldade 2');
    expect(entry?.system).toBe('Efeito em uma linha.\n\nObservação depois do bloco.');
  });

  it('warns about missing source or system text', () => {
    const { warnings } = parsed(NOTE);
    expect(warnings).toEqual(['Exemplo: "Poder Antigo" (nível 1) sem Fonte.']);
    const noSystem = NOTE.replace('> - **Sistema**: Efeito em uma linha.', '');
    expect(parsed(noSystem).warnings).toContain('Exemplo: "Ritual Estranho" (nível 3) sem Sistema.');
  });

  it('warns about repeated entries', () => {
    const repeated = NOTE.replace('### Poder Novo', '### Poder Antigo');
    expect(parsed(repeated).warnings).toContain('Exemplo: "Poder Antigo" aparece mais de uma vez.');
  });

  it('uses the entry kind of rituals, ceremonies and formulas', () => {
    expect(parsed(NOTE.replace('tipo: disciplina', 'tipo: rituais')).note.entries[0]?.kind).toBe('ritual');
    expect(parsed(NOTE.replace('tipo: disciplina', 'tipo: cerimonias')).note.entries[0]?.kind).toBe('ceremony');
    expect(parsed(NOTE.replace('tags:', 'entradas: formulas\ntags:')).note.entries[0]?.kind).toBe('formula');
  });

  it('leaves out items listed in "ocultos", with their warnings, and warns about names not found', () => {
    const hiddenNote = NOTE.replace('tags: [disciplina]', 'ocultos: ["poder antigo", "Inexistente"]\ntags: [disciplina]');
    const { note, warnings } = parsed(hiddenNote);
    expect(note.entries.map((e) => e.name)).toEqual(['Poder Novo', 'Ritual Estranho']);
    expect(warnings).toEqual(['Exemplo: "Inexistente" está em "ocultos", mas não há item com esse nome.']);
  });

  it('skips notes that are not published', () => {
    expect(parseDisciplineNote('Exemplo', NOTE.replace('publicar: true', 'publicar: false'))).toEqual({ status: 'unpublished' });
    expect(parseDisciplineNote('Exemplo', NOTE.replace('publicar: true\n', ''))).toEqual({ status: 'unpublished' });
  });

  it('rejects notes without frontmatter, kind, discipline or title', () => {
    expect(parseDisciplineNote('X', '# X')).toEqual({ status: 'invalid', errors: ['X: sem frontmatter.'] });
    const result = parseDisciplineNote('X', NOTE.replace('tipo: disciplina', 'tipo: outra').replace('disciplina: Exemplo', '').replace('# Exemplo', 'Exemplo'));
    expect(result.status === 'invalid' && result.errors).toEqual([
      'X: "tipo" deve ser disciplina, rituais, cerimonias.',
      'X: falta "disciplina".',
      'X: sem título "# ".',
    ]);
  });
});
