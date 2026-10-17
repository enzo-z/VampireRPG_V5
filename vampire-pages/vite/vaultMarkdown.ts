import { Marked, type Token, type Tokens } from 'marked';
import { normalizeLabel } from '../src/catalog/parseNote.ts';
import type { VaultHeading, VaultSearchSection } from '../src/catalog/types.ts';
import { vaultHash } from '../src/features/vault/vaultRoute.ts';

// Renders a vault note for the app's "Vault" at build time. Unlike markdown.ts
// (which flattens Obsidian syntax for short catalog texts), this keeps the note
// navigable: wikilinks to published notes become app links, headings get ids,
// embedded images and audio point at bundled assets.
// Raw HTML in notes is escaped; only <br> (used inside table cells) survives.

export interface Wikilink {
  target: string;
  anchor: string | null;
  alias: string | null;
}

/** A published note a wikilink can point to. */
export interface VaultLinkTarget {
  slug: string;
  headingIds: ReadonlySet<string>;
}

export interface VaultEmbed {
  kind: 'image' | 'audio';
  /** Index into the module's bundled assets. */
  asset: number;
}

export interface VaultRenderContext {
  /** Published note by name ("Dano", "Regras/Dano"; "" is the note being rendered), or null when it is not in the Vault. */
  findNote: (name: string) => VaultLinkTarget | null;
  /** Bundled file for an embed ("Pasted image ….png"), or null when it is unknown. */
  embed: (fileName: string) => VaultEmbed | null;
  warn: (message: string) => void;
}

export interface RenderedVaultNote {
  html: string;
  headings: VaultHeading[];
  sections: VaultSearchSection[];
}

/** "Regras Fundamentais" → "regras-fundamentais"; also used for heading ids. */
export function slugify(text: string): string {
  return normalizeLabel(text).replace(/ /g, '-');
}

/** Parses the inside of [[…]]: "Note#Heading|Alias", "#Heading", "Note#A#B" (deepest heading wins). */
export function parseWikilink(inner: string): Wikilink {
  const [left = '', ...aliasParts] = inner.split(/\\?\|/);
  const alias = aliasParts.join('|').trim();
  const [target = '', ...anchors] = left.split('#');
  const anchor = anchors.map((part) => part.trim()).filter((part) => part !== '').at(-1) ?? null;
  return { target: target.trim(), anchor, alias: alias === '' ? null : alias };
}

const fileName = (path: string) => path.split('/').at(-1) ?? path;

/** What Obsidian shows for a link: the alias, else the heading, else the note name. */
export function wikilinkText(link: Wikilink): string {
  return link.alias ?? link.anchor ?? fileName(link.target).replace(/\.md$/i, '');
}

/** Markdown reduced to searchable text. */
export function plainText(markdown: string): string {
  return markdown
    .replace(/!\[\[[^\]]*\]\]/g, ' ')
    .replace(/\[\[([^\]]+)\]\]/g, (_match, inner: string) => wikilinkText(parseWikilink(inner)))
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/^[\s|:-]+$/gm, ' ')
    .replace(/^\s*(?:[-+*]|\d+\.)\s+/gm, ' ')
    .replace(/[*_`~=\\]/g, '')
    .replace(/[>|#]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function escapeHtml(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

interface WikilinkToken extends Tokens.Generic {
  type: 'wikilink';
  raw: string;
  inner: string;
  embed: boolean;
}

interface HighlightToken extends Tokens.Generic {
  type: 'highlight';
  raw: string;
  tokens: Token[];
}

type IdentifiedHeading = Tokens.Heading & { vaultId?: string };

const WIKILINK = /^(!?)\[\[([^\]\n]+?)\]\]/;
const HIGHLIGHT = /^==(?=\S)([^=\n]*?\S)==/;
/** Book references start with this emoji: "> 📖 Livro básico, p. 293". */
const BOOK_REFERENCE = /^\s*📖/u;

function uniqueId(base: string, used: Set<string>): string {
  const root = base === '' ? 'secao' : base;
  let id = root;
  for (let suffix = 2; used.has(id); suffix += 1) id = `${root}-${suffix}`;
  used.add(id);
  return id;
}

function renderWikilink(token: WikilinkToken, context: VaultRenderContext): string {
  const link = parseWikilink(token.inner);
  if (token.embed) {
    const embed = context.embed(fileName(link.target));
    if (embed === null) {
      context.warn(`anexo "${link.target}" não encontrado; ficou de fora.`);
      return '';
    }
    return embed.kind === 'image'
      ? `<img data-vault-asset="${embed.asset}" alt="" loading="lazy" decoding="async">`
      : `<audio data-vault-asset="${embed.asset}" controls preload="none"></audio>`;
  }

  const text = escapeHtml(wikilinkText(link));
  const note = context.findNote(link.target);
  if (note === null) return text;
  const headingId = link.anchor === null ? null : slugify(link.anchor);
  if (headingId !== null && !note.headingIds.has(headingId)) {
    context.warn(`link [[${token.inner}]] aponta para uma seção que não existe; vai para o topo da nota.`);
    return `<a href="${vaultHash(note.slug, null)}">${text}</a>`;
  }
  return `<a href="${vaultHash(note.slug, headingId)}">${text}</a>`;
}

function createMarked(context: VaultRenderContext): Marked {
  return new Marked({
    gfm: true,
    breaks: true,
    extensions: [
      {
        name: 'wikilink',
        level: 'inline',
        start: (source: string) => source.match(/!?\[\[/)?.index,
        tokenizer(source: string): WikilinkToken | undefined {
          const match = WIKILINK.exec(source);
          if (match === null) return undefined;
          return { type: 'wikilink', raw: match[0], inner: match[2] ?? '', embed: match[1] === '!' };
        },
        renderer: (token) => renderWikilink(token as WikilinkToken, context),
      },
      {
        name: 'highlight',
        level: 'inline',
        start: (source: string) => source.indexOf('=='),
        tokenizer(source: string): HighlightToken | undefined {
          const match = HIGHLIGHT.exec(source);
          if (match === null) return undefined;
          return { type: 'highlight', raw: match[0], tokens: this.lexer.inlineTokens(match[1] ?? '') };
        },
        renderer(token) {
          return `<mark>${this.parser.parseInline((token as HighlightToken).tokens)}</mark>`;
        },
      },
    ],
    renderer: {
      html({ text }) {
        return escapeHtml(text).replace(/&lt;br\s*\/?&gt;/gi, '<br>');
      },
      heading(token) {
        const level = Math.min(token.depth + 1, 6);
        const id = (token as IdentifiedHeading).vaultId ?? '';
        return `<h${level} id="${id}">${this.parser.parseInline(token.tokens)}</h${level}>\n`;
      },
      blockquote({ tokens, raw }) {
        const kind = BOOK_REFERENCE.test(raw.replace(/^\s*>\s?/, '')) ? ' data-kind="book"' : '';
        return `<blockquote${kind}>\n${this.parser.parse(tokens)}</blockquote>\n`;
      },
      link({ href, title, tokens }) {
        const text = this.parser.parseInline(tokens);
        const titleAttribute = title ? ` title="${escapeHtml(title)}"` : '';
        if (href.startsWith('#')) return `<a href="${escapeHtml(href)}"${titleAttribute}>${text}</a>`;
        return `<a href="${escapeHtml(href)}"${titleAttribute} target="_blank" rel="noreferrer">${text}</a>`;
      },
      image({ text }) {
        // Markdown images point at files outside the bundle; keep only their description.
        return escapeHtml(text);
      },
    },
  });
}

/** Lexes a note and gives every heading a unique id, in document order. */
function lexWithIds(marked: Marked, markdown: string): { tokens: ReturnType<Marked['lexer']>; headings: VaultHeading[] } {
  const tokens = marked.lexer(markdown);
  const used = new Set<string>();
  const headings: VaultHeading[] = [];
  marked.walkTokens(tokens, (token) => {
    if (token.type !== 'heading') return;
    const heading = token as IdentifiedHeading;
    heading.vaultId = uniqueId(slugify(heading.text), used);
    headings.push({ id: heading.vaultId, title: plainText(heading.text), depth: heading.depth });
  });
  return { tokens, headings };
}

/** Plain text of each top-level section (text before the first heading has a null id), for search. */
function searchSections(tokens: readonly Token[]): VaultSearchSection[] {
  const sections: VaultSearchSection[] = [{ headingId: null, title: '', text: '' }];
  for (const token of tokens) {
    if (token.type === 'heading') {
      const heading = token as IdentifiedHeading;
      sections.push({ headingId: heading.vaultId ?? null, title: plainText(heading.text), text: '' });
      continue;
    }
    const current = sections.at(-1);
    const text = plainText(token.raw);
    if (current !== undefined && text !== '') current.text = current.text === '' ? text : `${current.text} ${text}`;
  }
  return sections.filter((section) => section.headingId !== null || section.text !== '');
}

/** Headings only (ids included), to resolve links between notes before rendering them. */
export function collectVaultHeadings(markdown: string): VaultHeading[] {
  const silent: VaultRenderContext = { findNote: () => null, embed: () => null, warn: () => undefined };
  return lexWithIds(createMarked(silent), markdown).headings;
}

export function renderVaultMarkdown(markdown: string, context: VaultRenderContext): RenderedVaultNote {
  const marked = createMarked(context);
  const { tokens, headings } = lexWithIds(marked, markdown);
  const html = marked
    .parser(tokens)
    .replace(/<table>/g, '<div data-table-scroll><table>')
    .replace(/<\/table>/g, '</table></div>')
    .replace(/<p>\s*<\/p>\n?/g, '')
    .trim();
  return { html, headings, sections: searchSections(tokens) };
}
