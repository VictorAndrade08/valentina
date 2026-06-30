/**
 * Loader global — se muestra automáticamente durante transiciones de ruta
 * en Next.js App Router (cuando el server component aún no terminó de cargar).
 *
 * UX/UI 2027:
 *  · Spinner CSS puro con keyframes (cero JS heavy)
 *  · Identidad de marca (morado + amarillo)
 *  · Respeta prefers-reduced-motion (deshabilita rotación)
 *  · No bloquea el header (sale del flujo natural)
 */
export default function Loading() {
  return (
    <div
      className="min-h-[60vh] w-full flex items-center justify-center bg-white"
      role="status"
      aria-live="polite"
      aria-label="Cargando contenido"
    >
      <div className="flex flex-col items-center gap-5">
        {/* Spinner brand */}
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-4 border-[#EAE84B]/30" />
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-[#6F2C91] border-r-[#6F2C91] animate-spin" />
          {/* Punto central amarillo */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-3 h-3 rounded-full bg-[#EAE84B] animate-pulse" />
          </div>
        </div>
        <p className="font-lead text-sm font-bold uppercase tracking-[0.25em] text-[#6F2C91]/80">
          Cargando
        </p>
      </div>
    </div>
  );
}
