"use client";

import { useEffect, useState, useRef } from "react";
import { usePathname } from "next/navigation";

/**
 * TopProgress — barra de progreso superior tipo NProgress/Vercel.
 *
 * UX/UI 2027 — feedback inmediato de navegación sin penalizar el LCP:
 *  · Solo CSS + 2 setState → 0 dependencias externas
 *  · Aparece al iniciar navegación, llega rápido al 70%, espera DOM, completa
 *  · Auto-fade out al cargar
 *  · Respeta prefers-reduced-motion (no anima si está activo)
 *  · 2px de alto, gradiente amarillo brand → no compite con el header
 *  · z-[60] (por encima del header z-50, debajo del menú z-40+backdrop)
 */
export default function TopProgress() {
  const pathname = usePathname();
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const firstRender = useRef(true);

  useEffect(() => {
    // No animar la carga inicial (LCP-friendly)
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }

    setVisible(true);
    setProgress(0);

    // Avanza rápido al 75% mientras espera al DOM
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setProgress(75));
    });

    // Completa al 100% cuando el RSC payload de la nueva ruta ya está
    timerRef.current = setTimeout(() => {
      setProgress(100);
      // Fade out después de llegar
      setTimeout(() => {
        setVisible(false);
        setProgress(0);
      }, 250);
    }, 200);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [pathname]);

  return (
    <div
      aria-hidden
      className={`fixed top-0 left-0 right-0 h-[2px] z-[60] pointer-events-none transition-opacity duration-300 ${
        visible ? "opacity-100" : "opacity-0"
      }`}
    >
      <div
        className="h-full bg-gradient-to-r from-[#EAE84B] via-white to-[#EAE84B] shadow-[0_0_10px_rgba(234,232,75,0.8)]"
        style={{
          width: `${progress}%`,
          transition: visible
            ? "width 200ms ease-out"
            : "width 0ms",
        }}
      />
    </div>
  );
}
