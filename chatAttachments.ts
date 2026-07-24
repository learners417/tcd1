/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Theme manager — currently scoped to admin view only.
 * Applies `data-theme` on documentElement so CSS overrides in index.css kick in.
 * Resets the attribute on unmount so other views keep the dark theme.
 */

import { useEffect, useState } from 'react';

export type Theme = 'dark' | 'light';

const STORAGE_KEY = 'sanar_admin_theme';

function readStoredTheme(): Theme {
  try {
    const saved = typeof window !== 'undefined' ? window.localStorage.getItem(STORAGE_KEY) : null;
    if (saved === 'light' || saved === 'dark') return saved;
  } catch { /* noop */ }
  return 'dark';
}

function writeStoredTheme(theme: Theme): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, theme);
  } catch { /* noop */ }
}

function applyToRoot(theme: Theme): void {
  document.documentElement.setAttribute('data-theme', theme);
}

function clearFromRoot(): void {
  document.documentElement.removeAttribute('data-theme');
}

/**
 * Hook for views that opt in to the theme system (currently only Admin).
 * - Persists the chosen theme in localStorage.
 * - Sets `data-theme` on <html> while the view is mounted.
 * - Clears `data-theme` on unmount so other views remain dark.
 */
export function useAdminTheme(): [Theme, (next: Theme) => void] {
  const [theme, setTheme] = useState<Theme>(() => readStoredTheme());

  useEffect(() => {
    applyToRoot(theme);
    writeStoredTheme(theme);
  }, [theme]);

  useEffect(() => () => clearFromRoot(), []);

  return [theme, setTheme];
}
