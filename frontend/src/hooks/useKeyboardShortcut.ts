import { useEffect } from 'react';

type KeyCombo = {
  key: string;
  meta?: boolean;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
};

export function useKeyboardShortcut(combo: KeyCombo, callback: () => void) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const modifierMatch =
        (combo.ctrl && e.ctrlKey && !combo.meta) ||
        (combo.meta && e.metaKey && !combo.ctrl) ||
        (!combo.ctrl && !combo.meta && !e.ctrlKey && !e.metaKey);

      if (modifierMatch && e.key.toLowerCase() === combo.key.toLowerCase()) {
        const shiftOk = combo.shift !== undefined ? e.shiftKey === combo.shift : true;
        const altOk = combo.alt !== undefined ? e.altKey === combo.alt : true;
        if (shiftOk && altOk) {
          e.preventDefault();
          callback();
        }
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [combo, callback]);
}
