import { describe, expect, it } from 'vitest';
import { capitalizeFirst } from './buildNyMap.ts';

describe('capitalizeFirst', () => {
  it('capitalizes the first letter, after any leading markup', () => {
    expect(capitalizeFirst('reduto Anarch.')).toBe('Reduto Anarch.');
    expect(capitalizeFirst('*único* bastião')).toBe('*Único* bastião');
  });

  it('leaves text that already starts with a capital alone', () => {
    expect(capitalizeFirst('Bairro do Sabbat, como todo o anel.')).toBe('Bairro do Sabbat, como todo o anel.');
  });
});
