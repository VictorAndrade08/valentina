"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * ScrollReveal — activa animaciones de entrada en TODA la web.
 *
 * UX/UI 2027 — cero costo en LCP, 100% CSS animation:
 *   1. Detecta automáticamente todas las <section>, <article>, h2/h3/h4
 *      y .card-* dentro de <main> y les inyecta data-reveal="up"
 *   2. IntersectionObserver agrega clase .is-revealed cuando entran
 *      en viewport → la CSS hace el fade+translate
 *   3. Respeta prefers-reduced-motion (auto disable)
 *   4. Re-corre al cambiar de ruta para que /becas también se anime
 */
export default function ScrollReveal() {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Respeta accesibilidad
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;

    const main = document.querySelector("main");
    if (!main) return;

    // Solo sections top-level (perf: menos observers = más rápido)
    const targets = main.querySelectorAll<HTMLElement>(
      "section, [data-reveal]"
    );

    // Marcar con data-reveal up si no lo tienen
    targets.forEach((el) => {
      if (!el.hasAttribute("data-reveal")) {
        el.setAttribute("data-reveal", "up");
      }
    });

    // IntersectionObserver para activar la animación
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-revealed");
            observer.unobserve(entry.target);
          }
        });
      },
      {
        root: null,
        rootMargin: "0px 0px -10% 0px",
        threshold: 0.05,
      }
    );

    targets.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [pathname]);

  return null;
}
