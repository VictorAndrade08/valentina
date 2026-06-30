"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { Oswald } from "next/font/google";

// =======================
// FUENTE
// =======================
const oswald = Oswald({
  subsets: ["latin"],
  weight: ["500", "700"],
});

// =======================
// FOOTER
// =======================
const Footer: React.FC = () => {
  const pathname = usePathname();
  // No mostramos el footer público en /admin (el admin tiene su propio shell)
  if (pathname?.startsWith("/admin")) return null;

  return (
    <footer className="bg-[#6F2C91]">
      <div className="max-w-[1400px] mx-auto px-6 md:px-8 py-10 md:py-14 flex flex-col items-center justify-center gap-4">
        {/* NOMBRE / MARCA */}
        <p
          className={`${oswald.className} text-white text-3xl md:text-4xl lg:text-5xl font-bold tracking-wide uppercase text-center`}
        >
          VALENTINA CENTENO
        </p>

        {/* TEXTO SIMPLE SIN LINKS (CENTRADO) */}
        <p className="text-white/90 text-base md:text-lg lg:text-xl font-[var(--font-body)] text-center leading-relaxed max-w-[900px]">
          Asamblea Nacional del Ecuador · Representando con orgullo a Manabí.
          <span className="block mt-1 text-sm md:text-base text-white/70">
            © {new Date().getFullYear()} Todos los derechos reservados.
          </span>
        </p>
      </div>
    </footer>
  );
};

export default Footer;
