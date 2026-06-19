"use client";

/**
 * Overlay de "versión de prueba" — no se puede cerrar.
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
    <>
      {/* Banda fija arriba — no se puede cerrar */}
      <div className="fixed top-0 left-0 right-0 z-[9999] bg-red-600 text-white py-1.5 md:py-2 px-3 shadow-lg pointer-events-none">
        <div className="max-w-[1400px] mx-auto flex items-center justify-center gap-2 text-[10px] md:text-xs font-black uppercase tracking-widest text-center">
          <span aria-hidden>⚠️</span>
          <span>
            Versión de prueba · Pendiente de aprobación y pago para activación
          </span>
          <span aria-hidden>⚠️</span>
        </div>
      </div>

      {/* Banda fija abajo */}
      <div className="fixed bottom-0 left-0 right-0 z-[9999] bg-red-600 text-white py-1.5 md:py-2 px-3 shadow-lg pointer-events-none">
        <div className="max-w-[1400px] mx-auto flex items-center justify-center gap-2 text-[10px] md:text-xs font-black uppercase tracking-widest text-center">
          <span aria-hidden>⚠️</span>
          <span>
            Esta es una versión preliminar — Contenido pendiente de
            confirmación
          </span>
          <span aria-hidden>⚠️</span>
        </div>
      </div>

      {/* Marca de agua diagonal — semi-transparente, no bloquea clicks */}
      <div
        className="fixed inset-0 pointer-events-none z-[9998] overflow-hidden select-none"
        aria-hidden
      >
        <div
          className="absolute inset-[-25%] flex flex-col justify-around items-center"
          style={{ transform: "rotate(-22deg)" }}
        >
          {Array.from({ length: 14 }).map((_, i) => (
            <div
              key={i}
              className="whitespace-nowrap font-black tracking-[0.3em]"
              style={{
                color: "rgba(220, 38, 38, 0.12)",
                fontSize: "clamp(4rem, 9vw, 10rem)",
                fontFamily: "'Arial Black', Impact, sans-serif",
                lineHeight: 1,
              }}
            >
              VERSIÓN DE PRUEBA · VERSIÓN DE PRUEBA · VERSIÓN DE PRUEBA
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
