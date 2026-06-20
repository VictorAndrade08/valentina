"use client";

/**
 * Popup "TEST VERSION" — MODO BLOQUEO TOTAL
 *
 * Mientras ENABLED = true:
 *   - Cubre toda la pantalla en blanco
 *   - Solo se ve este popup, nada del sitio detrás
 *   - NO se puede cerrar (sin X, sin botón, sin click en backdrop)
 *
 * Para reactivar el sitio cuando el cliente pague:
 *   setear ENABLED = false acá abajo. Único cambio necesario.
 */

const ENABLED = true;

export default function TestVersionPopup() {
  if (!ENABLED) return null;

  return (
    <div
      // Bloqueo total: fondo blanco opaco, máxima z-index, sin onClick.
      className="fixed inset-0 z-[99999] bg-white flex items-center justify-center p-4"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="test-version-title"
      aria-describedby="test-version-desc"
    >
      <div className="relative bg-white border-4 border-red-600 rounded-3xl max-w-sm w-full p-7 md:p-8 shadow-2xl text-center">
        <div className="text-5xl mb-3" aria-hidden>
          ⚠️
        </div>
        <h2
          id="test-version-title"
          className="text-2xl md:text-3xl font-black uppercase tracking-widest text-red-600 mb-3"
        >
          Test Version
        </h2>
        <p
          id="test-version-desc"
          className="text-gray-600 text-sm mb-2 leading-relaxed"
        >
          This is a preliminary version of the site, pending final approval.
        </p>
        <p className="text-gray-500 text-xs leading-relaxed">
          The full site will be available once the project is approved.
        </p>
      </div>
    </div>
  );
}
