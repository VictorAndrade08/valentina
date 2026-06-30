"use client";

import Link from "next/link";
import { Oswald } from "next/font/google";

const oswald = Oswald({ subsets: ["latin"], weight: ["700"] });

/**
 * /operacion-valentia — Página oculta hasta el lanzamiento oficial.
 *
 * Por pedido de Génesis: la iniciativa todavía no se anuncia públicamente.
 * Esta pantalla evita un 404 si alguien entra al link directo y deja una
 * señal clara de "próximamente". El contenido real ya está implementado en
 * src/components/OperacionValentia.tsx y se reactiva con un único cambio:
 *
 *   1. En OperacionValentia.tsx → FALLBACK.activo = "true"
 *   2. En Header.tsx → descomentar la entrada "OP. VALENTÍA"
 *   3. En este archivo → restaurar el render completo (ver historial git
 *      commit b70f73c)
 */
export default function OperacionValentiaPlaceholder() {
  return (
    <main className="min-h-[80vh] w-full bg-gradient-to-br from-[#6F2C91] via-[#7d3aa1] to-[#5a2178] text-white flex flex-col items-center justify-center px-6 py-20 text-center relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-2 bg-[#EAE84B]" />

      <span className="inline-flex items-center gap-2 bg-[#EAE84B] text-[#6F2C91] font-bold uppercase text-[11px] md:text-xs tracking-widest px-4 py-1.5 rounded-full mb-7">
        <span className="w-1.5 h-1.5 rounded-full bg-[#6F2C91] animate-pulse" />
        Próximamente
      </span>

      <h1
        className={`${oswald.className} text-5xl md:text-7xl font-black uppercase tracking-tight leading-[0.95] mb-6 max-w-3xl`}
      >
        OPERACIÓN <span className="text-[#EAE84B]">VALENTÍA</span>
      </h1>

      <p className="text-white/85 text-base md:text-lg leading-relaxed max-w-xl mb-12">
        Una nueva iniciativa ciudadana que estamos preparando con mucho cuidado.
        Muy pronto vas a conocer todos los detalles.
      </p>

      <Link
        href="/"
        className={`${oswald.className} inline-flex items-center gap-3 bg-[#EAE84B] text-[#6F2C91] font-black uppercase text-sm md:text-base tracking-widest px-10 py-5 rounded-full hover:bg-white transition-colors shadow-xl active:scale-95 min-h-[52px]`}
      >
        <span aria-hidden>←</span>
        Volver al inicio
      </Link>
    </main>
  );
}
