import { useCallback, useEffect, useState } from 'react';
import { parseMapThemePreference, resolveMapTheme, type MapTheme, type MapThemePreference } from './mapTheme.ts';

/** Per-browser convenience: the map remembers the last theme picked. */
const STORAGE_KEY = 'vampire-pages:mapa-tema';
const DARK_QUERY = '(prefers-color-scheme: dark)';

function storedPreference(): MapThemePreference {
  try {
    return parseMapThemePreference(localStorage.getItem(STORAGE_KEY));
  } catch {
    return 'system';
  }
}

function storePreference(preference: MapThemePreference): void {
  try {
    localStorage.setItem(STORAGE_KEY, preference);
  } catch {
    // Private mode or blocked storage: the choice lasts until a reload.
  }
}

function systemIsDark(): boolean {
  return typeof window !== 'undefined' && window.matchMedia(DARK_QUERY).matches;
}

export interface MapThemeState {
  preference: MapThemePreference;
  theme: MapTheme;
  setPreference: (preference: MapThemePreference) => void;
}

export function useMapTheme(): MapThemeState {
  const [preference, setPreferenceState] = useState(storedPreference);
  const [systemDark, setSystemDark] = useState(systemIsDark);

  useEffect(() => {
    const query = window.matchMedia(DARK_QUERY);
    const update = () => setSystemDark(query.matches);
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);

  const setPreference = useCallback((next: MapThemePreference) => {
    storePreference(next);
    setPreferenceState(next);
  }, []);

  return { preference, theme: resolveMapTheme(preference, systemDark), setPreference };
}
