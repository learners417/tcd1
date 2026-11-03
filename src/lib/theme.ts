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
  return 'light';
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
  // V5: el cliente vive en claro, igual que la landing de la que viene.
  // Al salir del Admin no se vuelve a oscuro: se vuelve al tema de la marca.
  document.documentElement.setAttribute('data-theme', 'light');
}

/**
 * Hook for views that opt in to the theme system (currently only Admin).
 * - Persists the chosen theme in localStorage.
 * - Sets `data-theme` on <html> while the view is mounted.
 * - Al desmontar vuelve al claro de la marca, no a oscuro.
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
