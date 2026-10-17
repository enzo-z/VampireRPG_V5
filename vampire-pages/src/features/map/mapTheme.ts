// Theme of the New York map page only; the rest of the app stays light.

export type MapThemePreference = 'system' | 'light' | 'dark';
export type MapTheme = 'light' | 'dark';

export const MAP_THEME_PREFERENCES: readonly MapThemePreference[] = ['system', 'light', 'dark'];

/** "Sistema" follows the device; the other two are explicit. */
export function resolveMapTheme(preference: MapThemePreference, systemDark: boolean): MapTheme {
  if (preference === 'system') return systemDark ? 'dark' : 'light';
  return preference;
}

/** Reads a stored value; anything unknown falls back to "system". */
export function parseMapThemePreference(stored: string | null): MapThemePreference {
  return MAP_THEME_PREFERENCES.find((preference) => preference === stored) ?? 'system';
}
