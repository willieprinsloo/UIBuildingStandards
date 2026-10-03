// src/components/theme/useTheme.ts
import { useState, useEffect, useMemo, useCallback } from 'react';
import { THEME_IDS, getTheme, type ThemeId, type ThemeMode } from './registry';

export type ResolvedTheme = ThemeId;
export type ThemePreference = ResolvedTheme | 'system';

const STORAGE_KEY = 'ui-theme';
const MODE_STORAGE_KEY = 'ui-theme-mode';

/** Canonical theme pair that `'system'` resolves to. */
const SYSTEM_DARK: ThemeId = 'precision';
const SYSTEM_LIGHT: ThemeId = 'warehouse';

const EXPLICIT_THEMES = new Set<string>(THEME_IDS);

function isResolvedTheme(value: unknown): value is ResolvedTheme {
  return typeof value === 'string' && EXPLICIT_THEMES.has(value);
}

function resolveSystemMode(): ThemeMode {
  if (typeof window === 'undefined' || !window.matchMedia) return 'dark';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function resolveSystemTheme(): ResolvedTheme {
  return resolveSystemMode() === 'dark' ? SYSTEM_DARK : SYSTEM_LIGHT;
}

function modeOf(resolved: ResolvedTheme): ThemeMode {
  return getTheme(resolved)?.mode ?? resolveSystemMode();
}

function readStoredPreference(): ThemePreference {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'system' || isResolvedTheme(stored)) return stored;
  } catch {
    /* localStorage unavailable */
  }
  return 'system';
}

function applyTheme(resolved: ResolvedTheme): void {
  const mode = modeOf(resolved);
  document.documentElement.setAttribute('data-theme', resolved);
  document.documentElement.setAttribute('data-theme-mode', mode);
  try {
    localStorage.setItem(MODE_STORAGE_KEY, mode);
  } catch {
    /* both attributes already written */
  }
}

export interface UseThemeReturn {
  preference: ThemePreference;
  resolvedTheme: ResolvedTheme;
  setPreference: (preference: ThemePreference) => void;
}

export function useTheme(): UseThemeReturn {
  const [preference, setPreferenceState] = useState<ThemePreference>(readStoredPreference);
  const [systemTheme, setSystemTheme] = useState<ResolvedTheme>(resolveSystemTheme);
  const resolvedTheme = useMemo<ResolvedTheme>(
    () => (preference === 'system' ? systemTheme : preference),
    [preference, systemTheme]
  );

  useEffect(() => {
    applyTheme(resolvedTheme);
    try {
      localStorage.setItem(STORAGE_KEY, preference);
    } catch {
      /* theme still applied via attributes */
    }
  }, [preference, resolvedTheme]);

  useEffect(() => {
    if (preference !== 'system' || !window.matchMedia) return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handle = () => setSystemTheme(resolveSystemTheme());
    if (mq.addEventListener) {
      mq.addEventListener('change', handle);
      return () => mq.removeEventListener('change', handle);
    }
    mq.addListener(handle);
    return () => mq.removeListener(handle);
  }, [preference]);

  const setPreference = useCallback((next: ThemePreference) => setPreferenceState(next), []);

  return { preference, resolvedTheme, setPreference };
}
