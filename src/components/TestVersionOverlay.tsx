"use client";

/**
 * Overlay de "test version" — banda roja fija arriba, no se puede cerrar.
 * Se muestra mientras el pago/aprobación del cliente esté pendiente.
 *
 * Para desactivarlo cuando el cliente pague:
 *   1) Borrar el <TestVersionOverlay /> de app/layout.tsx (1 línea), o
 *   2) Setear `const ENABLED = false` acá abajo.
 */

const ENABLED = true;

export default function TestVersionOverlay() {
  if (!ENABLED) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] bg-red-600 text-white py-1.5 md:py-2 px-3 shadow-lg pointer-events-none">
      <div className="max-w-[1400px] mx-auto flex items-center justify-center gap-2 text-[10px] md:text-xs font-black uppercase tracking-widest text-center">
        <span aria-hidden>⚠️</span>
        <span>Test Version · Pending approval</span>
        <span aria-hidden>⚠️</span>
      </div>
    </div>
  );
}
