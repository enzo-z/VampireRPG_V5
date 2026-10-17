import { describe, expect, it } from 'vitest';
import { parseVaultNote } from './parseVaultNote.ts';

const note = (frontmatter: string, body: string) => `---\n${frontmatter}\n---\n${body}`;

describe('parseVaultNote', () => {
  it('skips notes that are not published to the Vault', () => {
    expect(parseVaultNote('A', '# A\ntexto')).toEqual({ status: 'unpublished' });
    expect(parseVaultNote('A', note('publicar: true', '# A'))).toEqual({ status: 'unpublished' });
    expect(parseVaultNote('A', note('publicar: false\nvault: Regras', '# A'))).toEqual({ status: 'unpublished' });
  });

  it('reads group and order, and takes the leading embed as the banner', () => {
    const result = parseVaultNote('Dano', note('publicar: true\nvault: Regras\nordem: 4', '#combat #rules\n\n![[Pasted image 1.png]]\n\n# Introdução\nTexto.'));
    expect(result).toEqual({
      status: 'parsed',
      warnings: [],
      note: { noteName: 'Dano', group: 'Regras', order: 4, banner: 'Pasted image 1.png', markdown: '# Introdução\nTexto.' },
    });
  });

  it('drops Obsidian-only parts: tag lines, Sumário, table of contents and comments', () => {
    const body = [
      '#rules #important',
      '# # Sumário',
      '- [[#Tempo|Tempo]]',
      '```table-of-contents',
      '```',
      '# Tempo',
      'Texto %%nota escondida%% visível.',
      '#TODO',
      '## Turno',
      'Mais.',
    ].join('\n');
    const result = parseVaultNote('Regras', note('publicar: true\nvault: Regras\nordem: 2', body));
    expect(result.status === 'parsed' && result.note.markdown).toBe('# Tempo\nTexto  visível.\n## Turno\nMais.');
  });

  it('drops sections listed in "ocultos", with their subsections, and warns about unknown ones', () => {
    const body = '# A\na\n## Rio\nrio\n### Bairros\nb\n## B\nb2\n# C\nc';
    const result = parseVaultNote('X', note('publicar: true\nvault: Lore\nordem: 1\nocultos: ["Rio", "Nada"]', body));
    expect(result.status === 'parsed' && result.note.markdown).toBe('# A\na\n## B\nb2\n# C\nc');
    expect(result.status === 'parsed' && result.warnings).toEqual(['X: "Nada" está em "ocultos", mas não há seção com esse título.']);
  });

  it('warns when the order is missing', () => {
    const result = parseVaultNote('X', note('publicar: true\nvault: Lore', '# A'));
    expect(result.status === 'parsed' && result.note.order).toBe(1000);
    expect(result.status === 'parsed' && result.warnings).toEqual(['X: sem "ordem" numérica; vai para o fim do grupo.']);
  });
});
