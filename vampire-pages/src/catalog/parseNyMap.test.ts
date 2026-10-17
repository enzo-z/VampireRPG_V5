import { describe, expect, it } from 'vitest';
import { parseNyMapNote, taggedParagraphs } from './parseNyMap.ts';

const NOTE = [
  '---',
  'publicar: true',
  '---',
  '#narrador #nova-york #mapa',
  '',
  '> Intro que fica no Obsidian.',
  '',
  '# Como mudar o mapa',
  'Texto que o app ignora.',
  '',
  '# O que o mapa mostra',
  '| Camada | Símbolo | Para quê |',
  '|---|---|---|',
  '| Lugares de 2021 | círculo cheio | Lugares |',
  '| Coterie | quadrado carmesim | PCs |',
  '| História | círculo vazado | Antigos |',
  '',
  '# Facções e legenda',
  '| Chave | Nome na legenda | Aparência | Onde em 2021 |',
  '|---|---|---|---|',
  '| `cam` | Camarilla: domínio da corte | carmesim | Manhattan |',
  '| `sabbat` | Sabbat | escura | antes |',
  '',
  '# Visão geral da cidade',
  '**2021, "A cidade de Panhard":** Domínio grande. [livro V5] [jogos V5]',
  '',
  '| Nome | Cargo · Clã |',
  '|---|---|',
  '| Hellene Panhard | Príncipe · Ventrue |',
  '',
  '**Antes de 1999, "Uma ilha cercada":** Sabbat. [notas] Batalha de cinco dias. [notas]',
  '',
  '# Distritos',
  '## Manhattan',
  '- **Facção:** 2021 `cam` (Coração da corte) · antes de 1999 `cam`',
  '- **Área / população:** 58,7 km² · 1.694.251',
  '- **Resumo:** onde a corte *governa*.',
  '',
  '| Clã | Quem / o quê | Fonte |',
  '|---|---|---|',
  '| Ventrue | Panhard | jogos V5 · livro V5 |',
  '',
  '- **Antes de 1999:** bastião.',
  '- **Observação do painel:** só um aviso.',
  '',
  '# Pontos do mapa',
  'Formato.',
  '### Manhattan',
  '- **Hotel Plaza** (`plaza`) · Coterie · `-73.9744, 40.7645` · "Plaza" · notas',
  '  Domínio de Vincent.',
  '- **Roosevelt Island** (`roosevelt`) · História, Lugares de 2021 · `-73.9500, 40.7615` · "Blackwell\'s" · aproximado, rótulo à esquerda, sem distrito · livro V5, ed. anterior',
  '  Presos.',
  '',
  '# Fora do mapa',
  '- **↑ Catskills** (`catskills`) · topo · livro V5',
  '  Lobisomens.',
  '',
  '# Clãs por distrito',
  '| Clã | Manhattan | Cidade |',
  '|---|---|---|',
  '| Ventrue | ● Panhard; Wall Street; ○ Herta (Plaza) | ○ Marian Price |',
  '| Tremere | | |',
  '',
  '# Divergências e cuidados',
  '- **Locais aproximados.** Sem endereço.',
  '- **Polonia: até quando?** Em aberto.',
  '',
  '# Decisões em aberto',
  '- [ ] Não entra no app.',
].join('\r\n');

function parsed(source = NOTE) {
  const result = parseNyMapNote(source);
  if (result.status !== 'parsed') throw new Error(JSON.stringify(result));
  return result;
}

function errorsOf(source: string): string[] {
  const result = parseNyMapNote(source);
  if (result.status !== 'invalid') throw new Error(`esperava erro, veio ${result.status}`);
  return result.errors;
}

describe('parseNyMapNote', () => {
  it('ignores notes without publicar: true', () => {
    expect(parseNyMapNote(NOTE.replace('publicar: true', 'publicar: false')).status).toBe('unpublished');
  });

  it('reads layers, factions and the overview', () => {
    const { map, warnings } = parsed();
    expect(warnings).toEqual([]);
    expect(map.layers.map((layer) => layer.id)).toEqual(['now', 'pc', 'hist']);
    expect(map.factions).toEqual([
      { key: 'cam', name: 'Camarilla: domínio da corte' },
      { key: 'sabbat', name: 'Sabbat' },
    ]);
    expect(map.overview).toEqual({ title: 'A cidade de Panhard', paragraphs: [{ markdown: 'Domínio grande.', sources: ['livro', 'jogos'] }] });
    expect(map.overviewBefore.paragraphs).toEqual([
      { markdown: 'Sabbat.', sources: ['notas'] },
      { markdown: 'Batalha de cinco dias.', sources: ['notas'] },
    ]);
    expect(map.court).toEqual([{ name: 'Hellene Panhard', role: 'Príncipe · Ventrue' }]);
  });

  it('reads a borough', () => {
    const [manhattan] = parsed().map.boroughs;
    expect(manhattan).toEqual({
      id: 'manhattan',
      name: 'Manhattan',
      faction: 'cam',
      factionBefore: 'cam',
      status: 'Coração da corte',
      area: '58,7',
      population: '1.694.251',
      summary: 'onde a corte *governa*.',
      clans: [{ clan: 'Ventrue', who: 'Panhard', sources: ['jogos', 'livro'] }],
      before: 'bastião.',
      note: 'só um aviso.',
    });
  });

  it('reads points with their layers, flags and panel text', () => {
    const [plaza, roosevelt] = parsed().map.points;
    expect(plaza).toMatchObject({ id: 'plaza', label: 'Plaza', layers: ['pc'], borough: 'manhattan', lon: -73.9744, lat: 40.7645, approximate: false, labelLeft: false, sources: ['notas'], text: 'Domínio de Vincent.' });
    expect(roosevelt).toMatchObject({ label: "Blackwell's", layers: ['hist', 'now'], borough: null, approximate: true, labelLeft: true, sources: ['livro', 'ant'] });
  });

  it('reads edges, the ledger and the cards', () => {
    const { map } = parsed();
    expect(map.edges).toEqual([{ id: 'catskills', label: '↑ Catskills', name: 'Catskills', sources: ['livro'], text: 'Lobisomens.' }]);
    expect(map.ledger).toEqual([
      {
        clan: 'Ventrue',
        cells: {
          manhattan: [
            { kind: 'base', markdown: 'Panhard; Wall Street' },
            { kind: 'presence', markdown: 'Herta (Plaza)' },
          ],
          city: [{ kind: 'presence', markdown: 'Marian Price' }],
        },
      },
      { clan: 'Tremere', cells: {} },
    ]);
    expect(map.cards).toEqual([
      { title: 'Locais aproximados', markdown: 'Sem endereço.' },
      { title: 'Polonia: até quando?', markdown: 'Em aberto.' },
    ]);
  });

  it('rejects unknown keys, bad coordinates and repeated ids, naming the section', () => {
    expect(errorsOf(NOTE.replace('`cam` (Coração', '`camarilla` (Coração'))).toContainEqual(expect.stringContaining('Distritos > Manhattan'));
    expect(errorsOf(NOTE.replace('`-73.9744, 40.7645`', '`40.7645, -73.9744`'))).toContainEqual(expect.stringContaining('Pontos do mapa > Hotel Plaza'));
    expect(errorsOf(NOTE.replace('· Coterie ·', '· Festa ·'))).toContainEqual(expect.stringContaining('camada desconhecida "Festa"'));
    expect(errorsOf(NOTE.replace('· notas\r\n  Domínio', '· wiki\r\n  Domínio'))).toContainEqual(expect.stringContaining('fonte desconhecida "wiki"'));
    expect(errorsOf(NOTE.replace('(`roosevelt`)', '(`plaza`)'))).toContainEqual(expect.stringContaining('id "plaza" repetido'));
    expect(errorsOf(NOTE.replace('# Fora do mapa', '# Outra coisa'))).toContainEqual('falta a seção "# Fora do mapa".');
  });
});

describe('taggedParagraphs', () => {
  it('closes a paragraph at each group of tags', () => {
    expect(taggedParagraphs('Um. [notas] [livro V5] Dois. [SUG]')).toEqual([
      { markdown: 'Um.', sources: ['notas', 'livro'] },
      { markdown: 'Dois.', sources: ['sug'] },
    ]);
  });

  it('keeps untagged text as one paragraph without sources', () => {
    expect(taggedParagraphs('Sem fonte.')).toEqual([{ markdown: 'Sem fonte.', sources: [] }]);
  });
});
