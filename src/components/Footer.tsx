"use client";

import React from "react";
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
  return (
    <footer className="bg-[#6F2C91]">
      <div className="max-w-[1400px] mx-auto px-6 md:px-8 py-6 md:py-8 flex flex-col items-center justify-center gap-2">
        {/* NOMBRE / MARCA */}
        <p
          className={`${oswald.className} text-white text-lg md:text-xl font-bold tracking-wide uppercase text-center`}
        >
          VALENTINA CENTENO
        </p>

        {/* TEXTO SIMPLE SIN LINKS (CENTRADO) */}
        <p className="text-white/80 text-[13px] md:text-sm font-[var(--font-body)] text-center leading-snug max-w-[900px]">
          Asamblea Nacional del Ecuador · Representando con orgullo a Manabí.
          <span className="block">
            © {new Date().getFullYear()} Todos los derechos reservados.
          </span>
        </p>
      </div>
    </footer>
  );
};

export default Footer;
