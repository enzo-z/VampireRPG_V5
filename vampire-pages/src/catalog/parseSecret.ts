// Parses a player's README ("Narrador/Relacionamentos/Para o Jogador/README - Name.md",
// frontmatter publicar: true) into the printed "Segredos" document:
//   tag line, "# Title", an intro (usually a blockquote), then "## Section" blocks.
// Obsidian-only parts stay out of the app: the table of contents, the relationship
// map (Mermaid) and the tag line.

import { normalizeLabel, parseFrontmatter } from './parseNote.ts';

export interface ParsedSecretSection {
  title: string;
  markdown: string;
}

export interface ParsedSecretDocument {
  character: string;
  title: string;
  /** Text between the title and the first "##". */
  intro: string;
  sections: ParsedSecretSection[];
}

export type SecretParseResult =
  | { status: 'parsed'; document: ParsedSecretDocument; warnings: string[] }
  | { status: 'unpublished' };

const FILE_PREFIX = /^README\s*-\s*/i;
const OBSIDIAN_ONLY: ReadonlySet<string> = new Set(['sumario', 'mapa de relacionamentos']);
const TAG_LINE = /^\s*(#[^\s#]+\s*)+$/;
const MERMAID_BLOCK = /```mermaid[\s\S]*?```/g;
/** Words the players must not see in their documents. */
const FORBIDDEN_WORDS: readonly string[] = ['Auld Sanguine'];

/** "README - Khalid Hassan Yusuf" → "Khalid Hassan Yusuf". */
export function secretCharacter(noteName: string): string {
  return noteName.replace(FILE_PREFIX, '').trim();
}

const text = (lines: readonly string[]) => lines.filter((line) => line.trim() !== '---').join('\n').trim();

export function parseSecretNote(noteName: string, source: string): SecretParseResult {
  const parsed = parseFrontmatter(source);
  if (parsed === null || parsed.fields['publicar'] !== 'true') return { status: 'unpublished' };

  const warnings: string[] = [];
  const warn = (message: string) => warnings.push(`${noteName}: ${message}`);
  const lines = parsed.body.replace(MERMAID_BLOCK, '').split(/\r?\n/).filter((line) => !TAG_LINE.test(line));

  let title = '';
  const intro: string[] = [];
  const sections: { title: string; lines: string[] }[] = [];
  for (const line of lines) {
    if (line.startsWith('## ')) {
      sections.push({ title: line.slice(3).trim(), lines: [] });
    } else if (line.startsWith('# ') && title === '' && sections.length === 0) {
      title = line.slice(2).trim();
    } else {
      (sections.at(-1)?.lines ?? intro).push(line);
    }
  }

  const character = secretCharacter(noteName);
  if (title === '') warn('sem título "# Nome: …".');
  const kept = sections
    .filter((section) => !OBSIDIAN_ONLY.has(normalizeLabel(section.title)))
    .map((section) => ({ title: section.title, markdown: text(section.lines) }));
  kept.filter((section) => section.markdown === '').forEach((section) => warn(`"${section.title}" não tem texto.`));
  if (kept.length === 0) warn('nenhuma seção "## Título".');

  const document: ParsedSecretDocument = { character, title: title || character, intro: text(intro), sections: kept };
  const printed = [document.title, document.intro, ...kept.flatMap((section) => [section.title, section.markdown])].join('\n').toLowerCase();
  FORBIDDEN_WORDS.filter((word) => printed.includes(word.toLowerCase())).forEach((word) => warn(`menciona "${word}", que não deve sair no PDF.`));
  return { status: 'parsed', document, warnings };
}
