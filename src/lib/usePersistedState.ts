/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState, type Dispatch, type SetStateAction } from 'react';

interface PersistOptions<T> {
  serialize?: (value: T) => string;
  deserialize?: (raw: string) => T;
  validate?: (value: T) => boolean;
}

export function usePersistedState<T>(
  key: string,
  initialValue: T | (() => T),
  options: PersistOptions<T> = {},
): [T, Dispatch<SetStateAction<T>>] {
  const serialize = options.serialize ?? JSON.stringify;
  const deserialize = options.deserialize ?? (JSON.parse as (raw: string) => T);
  const validate = options.validate;

  const [state, setState] = useState<T>(() => {
    try {
      const saved = typeof window !== 'undefined' ? window.localStorage.getItem(key) : null;
      if (saved !== null) {
        const parsed = deserialize(saved);
        if (!validate || validate(parsed)) return parsed;
      }
    } catch { /* noop */ }
    return typeof initialValue === 'function' ? (initialValue as () => T)() : initialValue;
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, serialize(state));
    } catch { /* noop */ }
  }, [key, state, serialize]);

  return [state, setState];
}

// Helpers para tipos no JSON-serializables nativamente
export const setSerializers = <T,>() => ({
  serialize: (value: Set<T>) => JSON.stringify(Array.from(value)),
  deserialize: (raw: string): Set<T> => new Set(JSON.parse(raw) as T[]),
});
