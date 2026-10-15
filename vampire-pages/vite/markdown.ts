import { Marked } from 'marked';

// Renders vault markdown at build time. Raw HTML in notes is escaped, and
// Obsidian-only syntax is reduced to plain markdown: wikilinks become their
// display text (the Vault view comes later) and embeds are dropped.

function escapeHtml(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

const marked = new Marked({
  gfm: true,
  breaks: true,
  renderer: {
    html({ text }) {
      return escapeHtml(text);
    },
  },
});

export function preprocessObsidian(markdown: string): string {
  return markdown
    .replace(/```table-of-contents[\s\S]*?```/g, '')
    .replace(/!\[\[[^\]]*\]\]/g, '')
    .replace(/\[\[([^\]|#]*)(?:#([^\]|]*))?(?:\|([^\]]*))?\]\]/g, (_match, target: string, anchor?: string, alias?: string) => {
      return alias?.trim() || anchor?.trim() || target.trim();
    })
    .replace(/^(\s*>\s*)\[!\w+\][+-]?\s*(.*)$/gm, (_match, prefix: string, title: string) => (title ? `${prefix}**${title}**` : prefix))
    .replace(/==([^=\n]+)==/g, '*$1*');
}

export function renderMarkdown(markdown: string): string {
  if (markdown.trim() === '') return '';
  return marked.parse(preprocessObsidian(markdown), { async: false }).trim();
}

export function renderInline(markdown: string): string {
  if (markdown.trim() === '') return '';
  return marked.parseInline(preprocessObsidian(markdown).replace(/\s*\n\s*/g, ' '), { async: false }).trim();
}

export function toPlainText(markdown: string): string {
  return preprocessObsidian(markdown).replace(/[*_`]/g, '').replace(/\s+/g, ' ').trim();
}
