import { describe, expect, it } from 'vitest';
import { collectVaultHeadings, parseWikilink, plainText, renderVaultMarkdown, slugify, type VaultRenderContext } from './vaultMarkdown.ts';

const warnings: string[] = [];
const context: VaultRenderContext = {
  findNote: (name) =>
    name === '' || name === 'Dano'
      ? { slug: name === '' ? 'regras' : 'dano', headingIds: new Set(['margem', 'superficial-damage']) }
      : null,
  embed: (fileName) => (fileName === 'a.png' ? { kind: 'image', asset: 0 } : fileName === 'b.m4a' ? { kind: 'audio', asset: 1 } : null),
  warn: (message) => warnings.push(message),
};
const render = (markdown: string) => renderVaultMarkdown(markdown, context).html;

describe('parseWikilink', () => {
  it('splits note, heading and alias (escaped pipes included)', () => {
    expect(parseWikilink('Dano#Margem|margem')).toEqual({ target: 'Dano', anchor: 'Margem', alias: 'margem' });
    expect(parseWikilink('Predator Type#Alleycat\\|Alleycat')).toEqual({ target: 'Predator Type', anchor: 'Alleycat', alias: 'Alleycat' });
    expect(parseWikilink('#Turno')).toEqual({ target: '', anchor: 'Turno', alias: null });
    expect(parseWikilink('Character#Willpower#Testes de Willpower')).toEqual({ target: 'Character', anchor: 'Testes de Willpower', alias: null });
  });
});

describe('slugify', () => {
  it('matches Obsidian headings with accents, ordinals and markdown', () => {
    expect(slugify('6ª Tradição: **A Destruição** (*Destruction*)')).toBe(slugify('6ª Tradição **A Destruição** (*Destruction*)'));
    expect(slugify('Introdução: O que é "A Fome"?')).toBe('introducao-o-que-e-a-fome');
  });
});

describe('renderVaultMarkdown', () => {
  it('links published notes and headings, and leaves other notes as text', () => {
    expect(render('Veja [[Dano#Margem|a margem]], [[#Margem]] e [[Character#Willpower|Willpower]].')).toBe(
      '<p>Veja <a href="#/vault/dano/margem">a margem</a>, <a href="#/vault/regras/margem">Margem</a> e Willpower.</p>',
    );
  });

  it('warns about links to missing headings and points them at the note', () => {
    warnings.length = 0;
    expect(render('[[Dano#Nada|x]]')).toBe('<p><a href="#/vault/dano">x</a></p>');
    expect(warnings).toHaveLength(1);
  });

  it('shifts headings one level down and gives them unique ids', () => {
    const { html, headings } = renderVaultMarkdown('# Tempo\n## Turno\n## Turno', context);
    expect(html).toBe('<h2 id="tempo">Tempo</h2>\n<h3 id="turno">Turno</h3>\n<h3 id="turno-2">Turno</h3>');
    expect(headings).toEqual([
      { id: 'tempo', title: 'Tempo', depth: 1 },
      { id: 'turno', title: 'Turno', depth: 2 },
      { id: 'turno-2', title: 'Turno', depth: 2 },
    ]);
    expect(collectVaultHeadings('# Tempo\n## Turno\n## Turno')).toEqual(headings);
  });

  it('points embeds at bundled assets and drops unknown ones', () => {
    expect(render('![[a.png]]')).toBe('<p><img data-vault-asset="0" alt="" loading="lazy" decoding="async"></p>');
    expect(render('![[b.m4a]]')).toBe('<p><audio data-vault-asset="1" controls preload="none"></audio></p>');
    warnings.length = 0;
    expect(render('![[c.png]]')).toBe('');
    expect(warnings).toHaveLength(1);
  });

  it('wraps tables for horizontal scroll and keeps <br> in cells, escaping other HTML', () => {
    const html = render('| A | B |\n| --- | --- |\n| um<br>dois | <script>x</script> |');
    expect(html).toContain('<div data-table-scroll><table>');
    expect(html).toContain('<td>um<br>dois</td>');
    expect(html).toContain('&lt;script&gt;');
    expect(html).toContain('</table></div>');
  });

  it('keeps wikilinks with escaped pipes inside table cells', () => {
    expect(render('| A |\n| --- |\n| [[Dano#Margem\\|margem]] |')).toContain('<td><a href="#/vault/dano/margem">margem</a></td>');
  });

  it('marks book references and renders highlights', () => {
    expect(render('> 📖 Livro básico, p. 293.')).toBe('<blockquote data-kind="book">\n<p>📖 Livro básico, p. 293.</p>\n</blockquote>');
    expect(render('==**importante**==')).toBe('<p><mark><strong>importante</strong></mark></p>');
  });

  it('opens external links in a new tab', () => {
    expect(render('[Primer](https://example.com)')).toBe('<p><a href="https://example.com" target="_blank" rel="noreferrer">Primer</a></p>');
  });

  it('collects searchable text per top-level section', () => {
    const { sections } = renderVaultMarkdown('Intro **forte**.\n# Tempo\nUm [[Dano|turno]].\n- item', context);
    expect(sections).toEqual([
      { headingId: null, title: '', text: 'Intro forte.' },
      { headingId: 'tempo', title: 'Tempo', text: 'Um turno. item' },
    ]);
  });
});

describe('plainText', () => {
  it('reduces markdown, wikilinks and table rules to words', () => {
    expect(plainText('| **A** | [[Dano#Margem\\|margem]] |\n| --- | --- |\n> ![[x.png]] _b_')).toBe('A margem b');
  });
});
