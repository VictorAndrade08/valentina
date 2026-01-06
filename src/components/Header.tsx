"use client";

import React, { useState } from "react";
import { Menu, X, Mail } from "lucide-react";
import { Oswald } from "next/font/google";

// Fuente Oswald para coherencia con el diseño
const oswald = Oswald({
  subsets: ["latin"],
  weight: ["500", "700"],
});

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
        
        {/* LOGO */}
        <a
          href="#inicio"
          className={`flex items-center text-white ${oswald.className} text-2xl md:text-3xl font-bold tracking-wide transition-opacity hover:opacity-80`}
        >
          VALENTINA CENTENO
        </a>

        {/* NAVEGACIÓN DESKTOP */}
        <nav className="hidden xl:flex items-center gap-8">
          {navItems.map((item) => (
            <a
              key={item.name}
              href={item.href}
              className={`text-white ${oswald.className} text-[14px] font-bold uppercase tracking-widest hover:text-[#EAE84B] transition-all relative group`}
            >
              {item.name}
              <span className="absolute bottom-[-4px] left-0 w-0 h-[2px] bg-[#EAE84B] transition-all group-hover:w-full"></span>
            </a>
          ))}

          {/* BOTÓN BUZÓN CIUDADANO (INTERACTIVO 10/10) */}
          <a
            href="#buzon"
            className={`
              relative overflow-hidden group
              bg-[#EAE84B] text-[#6F2C91] px-7 py-2.5 rounded-full 
              ${oswald.className} font-bold uppercase text-[15px] tracking-widest
              shadow-[0_0_20px_rgba(234,232,75,0.3)]
              hover:shadow-[0_0_25px_rgba(234,232,75,0.6)]
              hover:bg-white transition-all duration-300 transform hover:-translate-y-1
              flex items-center gap-2 animate-button-pulse
            `}
          >
            {/* Capa de Brillo (Shimmer) que se mueve sola */}
            <div className="shimmer-sweep absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent via-white/60 to-transparent opacity-50" />
            
            <Mail size={18} className="relative z-10 transition-transform group-hover:scale-110" />
            <span className="relative z-10">Buzón Ciudadano</span>

            {/* Pulso radial decorativo */}
            <span className="absolute inset-0 rounded-full animate-ping bg-[#EAE84B] opacity-10 group-hover:hidden"></span>
          </a>
        </nav>

        {/* BOTÓN HAMBURGUESA MÓVIL */}
        <button
          className="xl:hidden text-white focus:outline-none p-2 hover:bg-white/10 rounded-lg transition-colors"
          onClick={toggleMenu}
          aria-label={isMenuOpen ? "Cerrar menú" : "Abrir menú"}
        >
          {isMenuOpen ? <X size={34} /> : <Menu size={34} />}
        </button>
      </div>

      {/* MENÚ MÓVIL (DESPLEGABLE) */}
      {isMenuOpen && (
        <nav className="absolute top-[80px] left-0 w-full bg-[#6F2C91] flex flex-col items-center py-12 gap-8 shadow-2xl border-t border-white/10 xl:hidden animate-slide-down">
          {navItems.map((item) => (
            <a
              key={item.name}
              href={item.href}
              onClick={toggleMenu}
              className={`text-white ${oswald.className} text-2xl font-bold tracking-widest uppercase hover:text-[#EAE84B] transition-colors`}
            >
              {item.name}
            </a>
          ))}

          <a
            href="#buzon"
            onClick={toggleMenu}
            className={`
              bg-[#EAE84B] text-[#6F2C91] px-10 py-4 rounded-full 
              ${oswald.className} font-bold text-xl uppercase tracking-widest 
              shadow-xl active:scale-95 transition-transform flex items-center gap-3
              animate-button-pulse
            `}
          >
            <Mail size={24} />
            Buzón Ciudadano
          </a>
        </nav>
      )}

      {/* KEYFRAMES Y ESTILOS DE ANIMACIÓN */}
      <style jsx global>{`
        @keyframes sweep {
          0% { left: -100%; }
          30% { left: 150%; }
          100% { left: 150%; }
        }
        
        @keyframes pulse-soft {
          0%, 100% { transform: scale(1); box-shadow: 0 0 20px rgba(234, 232, 75, 0.3); }
          50% { transform: scale(1.03); box-shadow: 0 0 30px rgba(234, 232, 75, 0.5); }
        }

        @keyframes slide-down {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .shimmer-sweep {
          animation: sweep 4s infinite ease-in-out;
        }

        .animate-button-pulse {
          animation: pulse-soft 3s infinite ease-in-out;
        }

        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </header>
  );
};

export default Header;