import { describe, expect, it } from 'vitest';
import { parseSecretNote, secretCharacter } from './parseSecret.ts';

const NOTE = [
  '---',
  'publicar: true',
  '---',
  '#jogador #auld-sanguine #khalid',
  '',
  '# Khalid: o que você sabe',
  '',
  '> Só seu.',
  '',
  '## Sumário',
  '- [[#Seu sire]]',
  '',
  '---',
  '',
  '## Seu sire',
  '',
  'Nizar.',
  '##### 🎭 Vincent',
  '- dono do Plaza',
  '',
  '## Mapa de relacionamentos',
  '',
  'Legenda.',
  '```mermaid',
  'flowchart TB',
  '  K --- V',
  '```',
  '',
  '---',
  '',
  '## Segredos',
  '- Você está vivo.',
].join('\r\n');

function parse(source: string) {
  const result = parseSecretNote('README - Khalid', source);
  if (result.status !== 'parsed') throw new Error('expected a parsed note');
  return result;
}

describe('parseSecretNote', () => {
  it('ignores notes without publicar: true', () => {
    expect(parseSecretNote('README - Khalid', NOTE.replace('publicar: true', 'publicar: false')).status).toBe('unpublished');
    expect(parseSecretNote('README - Khalid', '# Khalid').status).toBe('unpublished');
  });

  it('reads the title, the intro and the sections', () => {
    const { document, warnings } = parse(NOTE);
    expect(document.character).toBe('Khalid');
    expect(document.title).toBe('Khalid: o que você sabe');
    expect(document.intro).toBe('> Só seu.');
    expect(document.sections.map((section) => section.title)).toEqual(['Seu sire', 'Segredos']);
    expect(warnings).toEqual([]);
  });

  it('keeps sub-headings inside their section and drops rules', () => {
    const { document } = parse(NOTE);
    expect(document.sections[0]?.markdown).toBe('Nizar.\n##### 🎭 Vincent\n- dono do Plaza');
  });

  it('leaves out the tag line, the table of contents and the Mermaid map', () => {
    const printed = JSON.stringify(parse(NOTE).document);
    expect(printed).not.toContain('#jogador');
    expect(printed).not.toContain('Sumário');
    expect(printed).not.toContain('flowchart');
    expect(printed).not.toContain('Legenda');
  });

  it('drops a Mermaid block anywhere in the note', () => {
    const { document } = parse(NOTE.replace('Nizar.', 'Nizar.\r\n```mermaid\r\nflowchart LR\r\n```'));
    expect(document.sections[0]?.markdown).not.toContain('flowchart');
  });

  it('warns when the printed text names the chronicle', () => {
    const { warnings } = parse(NOTE.replace('Nizar.', 'Nizar, no Auld Sanguine.'));
    expect(warnings).toEqual(['README - Khalid: menciona "Auld Sanguine", que não deve sair no PDF.']);
  });

  it('falls back to the character name without a title', () => {
    const { document, warnings } = parse(NOTE.replace('# Khalid: o que você sabe', ''));
    expect(document.title).toBe('Khalid');
    expect(warnings).toEqual(['README - Khalid: sem título "# Nome: …".']);
  });
});

describe('secretCharacter', () => {
  it('takes the name from the file name', () => {
    expect(secretCharacter('README - Khalid Hassan Yusuf')).toBe('Khalid Hassan Yusuf');
    expect(secretCharacter('Nina')).toBe('Nina');
  });
});
