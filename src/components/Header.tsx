"use client";

import React, { useState } from "react";
import { Menu, X } from "lucide-react";
import { Oswald } from "next/font/google";

// =====================================
// FUENTE
// =====================================
const oswald = Oswald({
  subsets: ["latin"],
  weight: ["500", "700"],
});

// =====================================
// DATOS DE NAVEGACIÓN
// =====================================
interface MenuItem {
  name: string;
  href: string;
}

const navItems: MenuItem[] = [
  { name: "INICIO", href: "#inicio" },
  { name: "ACERCA DE MÍ", href: "#acerca-de-mi" },
  { name: "LEYES", href: "#leyes" },
  { name: "LOGROS MANABÍ", href: "#logros-manabi" },
  { name: "INICIATIVAS", href: "#iniciativas" },
  { name: "AGENDA INTERNACIONAL", href: "#agenda-internacional" },
];

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <header className="bg-[#6F2C91] fixed top-0 left-0 w-full z-50 h-[80px] shadow-md flex items-center">
      <div className="mx-auto w-full max-w-[1400px] px-8 flex justify-between items-center">
        {/* LOGO SOLO TEXTO */}
        <a
          href="#inicio"
          className={`flex items-center text-white ${oswald.className} text-2xl md:text-3xl font-bold tracking-wide`}
        >
          VALENTINA CENTENO
        </a>

        {/* NAV DESKTOP */}
        <nav className="hidden xl:flex items-center gap-8">
          {navItems.map((item) => (
            <a
              key={item.name}
              href={item.href}
              className={`text-white ${oswald.className} text-[15px] font-bold uppercase tracking-wide hover:text-[#EAE84B] transition-colors`}
            >
              {item.name}
            </a>
          ))}

          {/* BOTÓN BUZÓN */}
          <a
            href="#buzon"
            className={`bg-[#EAE84B] text-[#6F2C91] px-5 py-2 rounded-md ${oswald.className} font-bold uppercase text-[15px] tracking-wide hover:bg-white transition-colors`}
          >
            Buzón
          </a>
        </nav>

        {/* HAMBURGUESA - MÓVIL */}
        <button
          className="xl:hidden text-white focus:outline-none"
          onClick={toggleMenu}
        >
          {isMenuOpen ? <X size={34} /> : <Menu size={34} />}
        </button>
      </div>

      {/* MENU MÓVIL */}
      {isMenuOpen && (
        <nav className="absolute top-[80px] left-0 w-full bg-[#6F2C91] flex flex-col items-center py-8 gap-6 shadow-xl border-t border-white/10 xl:hidden">
          {navItems.map((item) => (
            <a
              key={item.name}
              href={item.href}
              onClick={toggleMenu}
              className={`text-white ${oswald.className} text-xl font-bold tracking-wide uppercase`}
            >
              {item.name}
            </a>
          ))}

          <a
            href="#buzon"
            onClick={toggleMenu}
            className={`bg-[#EAE84B] text-[#6F2C91] px-8 py-3 rounded-md ${oswald.className} font-bold text-xl uppercase tracking-wide`}
          >
            Buzón Ciudadano
          </a>
        </nav>
      )}
    </header>
  );
};

export default Header;
