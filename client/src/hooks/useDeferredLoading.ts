import { useState, useEffect } from 'react';

/**
 * Returns true only after `delayMs` have passed while `loading` is still true.
 * Eliminates loading-state flicker for fast responses (local dev, warm cache).
 * Pages that resolve quickly never show a spinner; slow pages show one after the delay.
 */
export function useDeferredLoading(loading: boolean, delayMs = 150): boolean {
  const [showSpinner, setShowSpinner] = useState(false);

  useEffect(() => {
    if (!loading) {
      setShowSpinner(false);
      return;
    }
    const id = setTimeout(() => setShowSpinner(true), delayMs);
    return () => clearTimeout(id);
  }, [loading, delayMs]);

  return showSpinner;
}
