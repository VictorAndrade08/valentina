"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Popup "TEST VERSION" — aparece al cargar y se repite cada 30s mientras la
 * pestaña esté abierta. El usuario sí puede cerrarlo, pero vuelve después.
 *
 * Para desactivarlo cuando el cliente pague: setear ENABLED = false abajo,
 * o borrar el <TestVersionPopup /> de app/layout.tsx.
 */

const ENABLED = true;
const INITIAL_DELAY_MS = 500;
const REPEAT_INTERVAL_MS = 30_000; // 30 segundos

export default function TestVersionPopup() {
  const [open, setOpen] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scheduleNext = (delayMs: number) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setOpen(true), delayMs);
  };

  useEffect(() => {
    if (!ENABLED) return;
    scheduleNext(INITIAL_DELAY_MS);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const close = () => {
    setOpen(false);
    // Vuelve a aparecer en 30 segundos
    scheduleNext(REPEAT_INTERVAL_MS);
  };

  if (!ENABLED || !open) return null;

  return (
    <div
      className="fixed inset-0 z-[9991] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={close}
      role="dialog"
      aria-modal="true"
      aria-labelledby="test-version-title"
    >
      <div
        className="relative bg-white border-4 border-red-600 rounded-3xl max-w-sm w-full p-7 md:p-8 shadow-2xl text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={close}
          aria-label="Cerrar"
          className="absolute top-3 right-3 w-9 h-9 rounded-full bg-red-600 text-white flex items-center justify-center hover:bg-red-700 transition-all text-base font-bold shadow-lg"
        >
          ✕
        </button>

        <div className="text-5xl mb-3" aria-hidden>
          ⚠️
        </div>
        <h2
          id="test-version-title"
          className="text-2xl md:text-3xl font-black uppercase tracking-widest text-red-600 mb-3"
        >
          Test Version
        </h2>
        <p className="text-gray-600 text-sm mb-6 leading-relaxed">
          This is a preliminary version of the site, pending final approval.
        </p>
        <button
          onClick={close}
          className="w-full py-3 rounded-full bg-red-600 text-white font-black uppercase tracking-widest text-xs hover:bg-red-700 transition-all shadow-lg active:scale-95"
        >
          Entendido
        </button>
      </div>
    </div>
  );
}
