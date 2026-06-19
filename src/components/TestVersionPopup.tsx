"use client";

import { useEffect, useState } from "react";

/**
 * Popup "TEST VERSION" — aparece cada vez que se carga una página
 * (no usa sessionStorage), pero el usuario sí puede cerrarlo.
 *
 * Para desactivarlo cuando el cliente pague: setear ENABLED = false abajo,
 * o borrar el <TestVersionPopup /> de app/layout.tsx.
 */

const ENABLED = true;

export default function TestVersionPopup() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!ENABLED) return;
    // Aparece después de 500ms para no ser brusco con el load.
    const t = setTimeout(() => setOpen(true), 500);
    return () => clearTimeout(t);
  }, []);

  if (!ENABLED || !open) return null;

  return (
    <div
      className="fixed inset-0 z-[9991] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={() => setOpen(false)}
      role="dialog"
      aria-modal="true"
      aria-labelledby="test-version-title"
    >
      <div
        className="relative bg-white border-4 border-red-600 rounded-3xl max-w-sm w-full p-7 md:p-8 shadow-2xl text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => setOpen(false)}
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
          onClick={() => setOpen(false)}
          className="w-full py-3 rounded-full bg-red-600 text-white font-black uppercase tracking-widest text-xs hover:bg-red-700 transition-all shadow-lg active:scale-95"
        >
          Entendido
        </button>
      </div>
    </div>
  );
}
