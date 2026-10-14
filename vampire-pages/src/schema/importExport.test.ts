import { describe, expect, it } from 'vitest';
import { createFicha } from '../domain/defaults.ts';
import { legacyCharacter } from './fixtures.ts';
import { parseSheetFile, serializeSheetFile } from './importExport.ts';

const nina = createFicha('nina', 'Nina', 'Jogador 1');
const vincent = createFicha('vincent', 'Vincent', 'Jogador 2');

function expectError(text: string): string {
  const result = parseSheetFile(text);
  if (result.ok) throw new Error('expected an import error');
  return result.error;
}

describe('parseSheetFile', () => {
  it('round-trips an exported file', () => {
    const text = serializeSheetFile([nina, vincent]);
    const result = parseSheetFile(text);

    expect(result).toEqual({ ok: true, file: { schemaVersion: 1, fichas: [nina, vincent] }, warnings: [] });
    if (result.ok) expect(serializeSheetFile(result.file.fichas)).toBe(text);
  });

  it('rejects text that is not JSON', () => {
    expect(expectError('{ nope')).toBe('O arquivo não é um JSON válido.');
  });

  it('rejects unknown schema versions with a clear message', () => {
    expect(expectError(JSON.stringify({ schemaVersion: 2, fichas: [] }))).toBe(
      'Versão 2 não suportada; este app lê a versão 1.',
    );
  });

  it('reports the path of an invalid value', () => {
    const broken = { ...nina, trackers: { ...nina.trackers, health: { ...nina.trackers.health, max: 13 } } };
    expect(expectError(JSON.stringify({ schemaVersion: 1, fichas: [broken] }))).toContain(
      'fichas[0].trackers.health.max: deve ser ≤ 12',
    );
  });

  it('requires exactly 12 damage boxes and 6 discipline slots', () => {
    const broken = { ...nina, disciplines: nina.disciplines.slice(0, 3), trackers: { ...nina.trackers, willpower: { max: 5, boxes: [0] } } };
    const error = expectError(JSON.stringify({ schemaVersion: 1, fichas: [broken] }));
    expect(error).toContain('fichas[0].disciplines: deve ter exatamente 6 itens');
    expect(error).toContain('fichas[0].trackers.willpower.boxes: deve ter exatamente 12 itens');
  });

  it('rejects unknown fields, such as the prototype\'s "nome"', () => {
    expect(expectError(JSON.stringify({ schemaVersion: 1, fichas: [{ ...nina, nome: 'Nina' }] }))).toContain(
      'fichas[0]: campo desconhecido: nome',
    );
  });

  it('rejects repeated ids inside one file', () => {
    expect(expectError(serializeSheetFile([nina, nina]))).toContain('fichas[1].id: id repetido: "nina"');
  });

  it('wraps a legacy character from Pedro\'s app into a v1 file', () => {
    const result = parseSheetFile(JSON.stringify(legacyCharacter()), { newId: () => 'fresh' });
    if (!result.ok) throw new Error(result.error);

    expect(result.file.schemaVersion).toBe(1);
    expect(result.file.fichas.map((f) => [f.id, f.name])).toEqual([['fresh', 'Teste Legado']]);
    expect(result.warnings.length).toBeGreaterThan(0);
  });

  it('rejects anything else', () => {
    expect(expectError(JSON.stringify([1, 2]))).toContain('Formato não reconhecido');
  });
});
