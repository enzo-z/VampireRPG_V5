import { describe, expect, it } from 'vitest';
import { preprocessObsidian, renderInline, renderMarkdown, toPlainText } from './markdown.ts';

describe('preprocessObsidian', () => {
  it('turns wikilinks into their display text', () => {
    expect(preprocessObsidian('[[Fome]] e [[Kindred#Blush of Life|Blush]] e [[Dominate#Compel]]')).toBe('Fome e Blush e Compel');
  });

  it('drops embeds and table-of-contents blocks', () => {
    expect(preprocessObsidian('![[Celerity (Pequeno).png]]\n```table-of-contents\n```\ntexto').trim()).toBe('texto');
  });

  it('turns callout markers into a bold title', () => {
    expect(preprocessObsidian('> [!warning] Material de suplemento\n> corpo')).toBe('> **Material de suplemento**\n> corpo');
  });
});

describe('renderMarkdown', () => {
  it('renders lists and emphasis', () => {
    expect(renderMarkdown('- **Custo**: Free')).toBe('<ul>\n<li><strong>Custo</strong>: Free</li>\n</ul>');
  });

  it('escapes raw HTML from the notes', () => {
    expect(renderMarkdown('<script>alert(1)</script>')).not.toContain('<script>');
  });

  it('returns an empty string for blank input', () => {
    expect(renderMarkdown('  \n ')).toBe('');
  });
});

describe('renderInline and toPlainText', () => {
  it('renders a single line without a paragraph', () => {
    expect(renderInline('um [[Entendendo Dados e Ficha#Tutorial Rouse Check|Rouse Check]]')).toBe('um Rouse Check');
  });

  it('strips markup for plain text', () => {
    expect(toPlainText('**Core**, p. 252')).toBe('Core, p. 252');
  });
});
