import { describe, expect, it } from 'vitest';
import { uniqueName } from './names.ts';

describe('uniqueName', () => {
  it('keeps a free name, trimmed', () => {
    expect(uniqueName('  Nina ', ['Vincent'])).toBe('Nina');
  });

  it('numbers a repeated name like copied files, ignoring case', () => {
    expect(uniqueName('Nina', ['nina'])).toBe('Nina (1)');
    expect(uniqueName('Nina', ['Nina', 'Nina (1)'])).toBe('Nina (2)');
    expect(uniqueName('Nina', ['Nina', 'Nina (2)'])).toBe('Nina (1)');
  });

  it('numbers from the base name when the name already has a suffix', () => {
    expect(uniqueName('Nina (1)', ['Nina', 'Nina (1)'])).toBe('Nina (2)');
  });

  it('treats a parenthesis that is not a copy number as part of the name', () => {
    expect(uniqueName('Nina (Blue)', ['Nina (Blue)'])).toBe('Nina (Blue) (1)');
  });
});
