import { describe, expect, it } from 'vitest';
import { matchIdentity, normalizeText } from './identityCatalog.ts';

describe('normalizeText', () => {
  it('ignores case, accents, punctuation and extra spaces', () => {
    expect(normalizeText('  Sangue-Fraco  Ministério! ')).toBe('sangue fraco ministerio');
  });
});

describe('matchIdentity', () => {
  it('matches canonical names and aliases', () => {
    expect(matchIdentity('clan', 'assamita').canonical).toBe('Banu Haqim');
    expect(matchIdentity('clan', 'TOREADOR').canonical).toBe('Toreador');
    expect(matchIdentity('sect', 'anarquistas').canonical).toBe('Anarch');
    expect(matchIdentity('predatorType', 'Sereia').canonical).toBe('Siren');
  });

  it('reports the options when nothing matches', () => {
    const result = matchIdentity('clan', 'Toreadro');
    expect(result.matched).toBe(false);
    expect(result.canonical).toBeNull();
    expect(result.options).toContain('Toreador');
  });

  it('reads the generation number from free text', () => {
    expect(matchIdentity('generation', '13th').canonical).toBe('13ª geração');
    expect(matchIdentity('generation', '13ª').canonical).toBe('13ª geração');
    expect(matchIdentity('generation', '3').matched).toBe(false);
    expect(matchIdentity('generation', '').matched).toBe(false);
  });
});
