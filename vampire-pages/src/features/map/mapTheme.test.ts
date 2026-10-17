import { describe, expect, it } from 'vitest';
import { parseMapThemePreference, resolveMapTheme } from './mapTheme.ts';

describe('resolveMapTheme', () => {
  it('follows the device on "system"', () => {
    expect(resolveMapTheme('system', true)).toBe('dark');
    expect(resolveMapTheme('system', false)).toBe('light');
  });

  it('keeps an explicit choice whatever the device says', () => {
    expect(resolveMapTheme('light', true)).toBe('light');
    expect(resolveMapTheme('dark', false)).toBe('dark');
  });
});

describe('parseMapThemePreference', () => {
  it('reads the stored choice and falls back to "system"', () => {
    expect(parseMapThemePreference('dark')).toBe('dark');
    expect(parseMapThemePreference(null)).toBe('system');
    expect(parseMapThemePreference('sepia')).toBe('system');
  });
});
