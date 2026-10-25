import { useCallback, useEffect, useState } from 'react';

// Estado guardado en localStorage y sincronizado entre todas las páginas y pestañas.
// Permite que un ticket creado por el despachador lo vea y finalice el jefe de bomberos.
const EVENT_NAME = 'stored-state-change';

const read = (key, initial) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : initial;
  } catch {
    return initial;
  }
};

const useStoredState = (key, initial) => {
  const [value, setValue] = useState(() => read(key, initial));

  useEffect(() => {
    const handleChange = (e) => {
      const changedKey = e?.key ?? e?.detail;
      if (changedKey === key || changedKey === null) {
        setValue(read(key, initial));
      }
    };
    window.addEventListener('storage', handleChange);
    window.addEventListener(EVENT_NAME, handleChange);
    return () => {
      window.removeEventListener('storage', handleChange);
      window.removeEventListener(EVENT_NAME, handleChange);
    };
  }, [key, initial]);

  const update = useCallback((next) => {
    const prev = read(key, initial);
    const resolved = typeof next === 'function' ? next(prev) : next;
    localStorage.setItem(key, JSON.stringify(resolved));
    window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: key }));
  }, [key, initial]);

  return [value, update];
};

export const clearStoredState = (keys) => {
  keys?.forEach((key) => localStorage.removeItem(key));
  window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: null }));
};

export default useStoredState;
