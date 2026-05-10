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
      const meta = combo.meta ? e.metaKey : true;
      const ctrl = combo.ctrl ? e.ctrlKey : true;
      const shift = combo.shift ? e.shiftKey : !e.shiftKey || combo.shift === undefined;
      const alt = combo.alt ? e.altKey : true;

      // For combos that require Ctrl or Meta but not the other
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
      void meta; void ctrl; void shift; void alt;
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [combo, callback]);
}
