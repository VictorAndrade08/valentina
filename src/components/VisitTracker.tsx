"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { getSupabase } from "@/lib/supabaseClient";

/**
 * VisitTracker — registra una visita en Supabase por cada ruta visitada.
 *
 * - 1 sola visita por sesión por path (no infla el contador con refrescos)
 * - Excluye /admin (no contamos al admin entrando a editar)
 * - Si Supabase falla, silencioso: NO rompe la página
 */
export default function VisitTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname) return;
    // No contar visitas al panel admin
    if (pathname.startsWith("/admin")) return;

    const sessionKey = `visit:${pathname}`;
    try {
      if (sessionStorage.getItem(sessionKey)) return;
      sessionStorage.setItem(sessionKey, "1");
    } catch {
      // Si no hay sessionStorage (incógnito estricto), seguimos
    }

    // Insert no-bloqueante, error silencioso
    (async () => {
      try {
        const supabase = getSupabase();
        await supabase.from("page_views").insert({
          path: pathname,
          session_key: typeof crypto !== "undefined" && crypto.randomUUID
            ? crypto.randomUUID()
            : String(Math.floor(Math.random() * 1e12)),
        });
      } catch {
        // silencio: si la tabla no existe o RLS falla, no rompemos el sitio
      }
    })();
  }, [pathname]);

  return null;
}
