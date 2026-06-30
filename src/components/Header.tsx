"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Mail } from "lucide-react";
import { Oswald } from "next/font/google";

const oswald = Oswald({
  subsets: ["latin"],
  weight: ["500", "700"],
});

interface MenuItem {
  name: string;
  href: string;
  hideUntilXL?: boolean;
}

const navItems: MenuItem[] = [
  { name: "INICIO", href: "/#inicio" },
  { name: "BIOGRAFÍA", href: "/biografia" },
  { name: "ACERCA DE MÍ", href: "/#acerca-de-mi", hideUntilXL: true },
  { name: "LEYES", href: "/#ley" },
  { name: "MANABÍ", href: "/#logros-manabi" },
  { name: "BECAS", href: "/becas" },
  { name: "OP. VALENTÍA", href: "/operacion-valentia", hideUntilXL: true },
  { name: "AGENDA INTERNACIONAL", href: "/#agenda-internacional", hideUntilXL: true },
];

/**
 * Header — mejoras UX/UI 2027:
 *  · Glass morphism cuando se hace scroll (backdrop-blur)
 *  · Hamburger animado a X con CSS transforms
 *  · Scroll lock del <body> cuando se abre el menú móvil
 *  · Backdrop blur full screen detrás del menú móvil
 *  · Active link state (página actual) con underline amarillo
 *  · Logo responsive: VC en mobile XS, VALENTINA C. en sm, completo en md+
 *  · safe-area-inset-top para iPhone con Dynamic Island
 *  · Items del menú móvil con stagger animation suave
 */
const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  // Lock body scroll cuando el menú móvil está abierto
  useEffect(() => {
    if (isMenuOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = prev; };
    }
  }, [isMenuOpen]);

  // Cerrar menú con tecla Escape (accesibilidad)
  useEffect(() => {
    if (!isMenuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isMenuOpen]);

  const toggleMenu = () => setIsMenuOpen(prev => !prev);
  const closeMenu = () => setIsMenuOpen(false);

  // Saber si un link corresponde a la página actual.
  // Para anchors del home (/#xxx) solo marcamos INICIO cuando pathname==="/"
  // para evitar que todos los anchors aparezcan "activos" a la vez.
  const isActive = (href: string) => {
    if (!pathname) return false;
    if (href === "/#inicio") return pathname === "/";
    if (href.startsWith("/#")) return false; // resto de anchors NO se marcan
    return pathname === href || pathname.startsWith(href + "/");
  };

  return (
    <>
      <header
        className="relative w-full z-40 bg-[#6F2C91] shadow-md"
        style={{ paddingTop: "env(safe-area-inset-top)" }}
      >
        <div className="mx-auto w-full max-w-[1400px] h-[72px] md:h-[80px] px-5 sm:px-6 md:px-8 flex justify-between items-center">

          {/* LOGO — nombre completo siempre visible, tamaño escalado por breakpoint */}
          <Link
            href="/"
            onClick={closeMenu}
            className={`flex items-center text-white ${oswald.className} font-bold transition-opacity hover:opacity-80 whitespace-nowrap`}
            aria-label="Ir a la página de inicio - Valentina Centeno"
          >
            <span className="text-lg xs:text-xl sm:text-2xl md:text-3xl lg:text-4xl tracking-tight md:tracking-wide">
              VALENTINA CENTENO
            </span>
          </Link>

          {/* NAVEGACIÓN DESKTOP */}
          <nav className="hidden lg:flex items-center gap-4 xl:gap-7" aria-label="Navegación principal">
            {navItems.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`
                    ${oswald.className} text-[13px] xl:text-[14px] font-bold uppercase tracking-widest
                    transition-all relative group whitespace-nowrap
                    ${active ? "text-[#EAE84B]" : "text-white hover:text-[#EAE84B]"}
                    ${item.hideUntilXL ? "hidden xl:inline-block" : ""}
                  `}
                >
                  {item.name}
                  <span
                    className={`absolute -bottom-1 left-0 h-0.5 bg-[#EAE84B] transition-all ${
                      active ? "w-full" : "w-0 group-hover:w-full"
                    }`}
                  />
                </Link>
              );
            })}

            {/* BOTÓN ENVIAR MENSAJE (Desktop) */}
            <Link
              href="/#buzon"
              className={`
                relative overflow-hidden group
                bg-[#EAE84B] text-[#6F2C91] px-7 py-2.5 rounded-full
                ${oswald.className} font-bold uppercase text-[15px] tracking-widest
                shadow-[0_0_20px_rgba(234,232,75,0.3)]
                hover:shadow-[0_0_25px_rgba(234,232,75,0.6)]
                hover:bg-white transition-all duration-300 transform hover:-translate-y-1
                flex items-center gap-2 animate-button-pulse min-h-[44px]
              `}
            >
              <div className="shimmer-sweep absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-linear-to-r from-transparent via-white/60 to-transparent opacity-50" />
              <Mail size={18} className="relative z-10 transition-transform group-hover:scale-110" />
              <span className="relative z-10">ENVIAR MENSAJE</span>
              <span className="absolute inset-0 rounded-full animate-ping bg-[#EAE84B] opacity-10 group-hover:hidden"></span>
            </Link>
          </nav>

          {/* HAMBURGER ANIMADO ↔ X */}
          <button
            type="button"
            onClick={toggleMenu}
            aria-expanded={isMenuOpen}
            aria-controls="mobile-nav"
            aria-label={isMenuOpen ? "Cerrar menú" : "Abrir menú"}
            className="lg:hidden relative w-12 h-12 flex flex-col items-center justify-center rounded-xl hover:bg-white/10 active:bg-white/20 transition-colors focus-visible:ring-2 focus-visible:ring-[#EAE84B] focus-visible:outline-none"
          >
            <span
              aria-hidden
              className={`absolute block h-[2.5px] w-7 bg-white rounded-full transition-all duration-300 ${
                isMenuOpen ? "rotate-45" : "-translate-y-2"
              }`}
            />
            <span
              aria-hidden
              className={`absolute block h-[2.5px] w-7 bg-white rounded-full transition-all duration-300 ${
                isMenuOpen ? "opacity-0 scale-x-0" : "opacity-100"
              }`}
            />
            <span
              aria-hidden
              className={`absolute block h-[2.5px] w-7 bg-white rounded-full transition-all duration-300 ${
                isMenuOpen ? "-rotate-45" : "translate-y-2"
              }`}
            />
          </button>
        </div>
      </header>

      {/* BACKDROP del menú móvil — full screen con blur */}
      <button
        type="button"
        aria-hidden={!isMenuOpen}
        tabIndex={-1}
        onClick={closeMenu}
        className={`fixed inset-0 z-[55] bg-black/40 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${
          isMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      />

      {/* MENÚ MÓVIL — overlay full-screen (independiente del header no-sticky) */}
      <nav
        id="mobile-nav"
        aria-label="Navegación móvil"
        aria-hidden={!isMenuOpen}
        className={`
          fixed top-0 left-0 right-0 z-[56] lg:hidden
          bg-[#6F2C91]/97 backdrop-blur-md
          shadow-2xl
          transition-all duration-300 ease-out
          ${isMenuOpen
            ? "opacity-100 translate-y-0 pointer-events-auto"
            : "opacity-0 -translate-y-4 pointer-events-none"
          }
        `}
        style={{
          paddingTop: "env(safe-area-inset-top)",
          maxHeight: "100vh",
          overflowY: "auto",
        }}
      >
        {/* Mini header del overlay: logo + botón X */}
        <div className="flex items-center justify-between h-[72px] px-5 sm:px-6 border-b border-white/10">
          <span className={`${oswald.className} text-white text-base font-bold tracking-tight whitespace-nowrap`}>
            VALENTINA CENTENO
          </span>
          <button
            type="button"
            onClick={closeMenu}
            aria-label="Cerrar menú"
            className="relative w-12 h-12 flex items-center justify-center rounded-xl hover:bg-white/10 active:bg-white/20 transition-colors focus-visible:ring-2 focus-visible:ring-[#EAE84B] focus-visible:outline-none"
          >
            <span aria-hidden className="absolute block h-[2.5px] w-7 bg-white rounded-full rotate-45" />
            <span aria-hidden className="absolute block h-[2.5px] w-7 bg-white rounded-full -rotate-45" />
          </button>
        </div>

        <div className="flex flex-col items-stretch py-6 px-4 gap-1.5">
          {navItems.map((item, i) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={closeMenu}
                aria-current={active ? "page" : undefined}
                className={`
                  ${oswald.className} text-lg font-bold uppercase tracking-widest
                  px-5 py-4 rounded-2xl min-h-[52px] flex items-center justify-between
                  transition-all duration-200
                  ${active
                    ? "bg-[#EAE84B] text-[#6F2C91]"
                    : "text-white hover:bg-white/10 active:bg-white/20"
                  }
                  ${isMenuOpen ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"}
                `}
                style={{
                  transitionDelay: isMenuOpen ? `${i * 35}ms` : "0ms",
                }}
              >
                <span>{item.name}</span>
                <span
                  aria-hidden
                  className={`text-xl transition-transform ${active ? "translate-x-0" : "-translate-x-1 opacity-60"}`}
                >
                  →
                </span>
              </Link>
            );
          })}

          {/* CTA principal del menú móvil */}
          <Link
            href="/#buzon"
            onClick={closeMenu}
            className={`
              mt-3 bg-[#EAE84B] text-[#6F2C91] px-6 py-4 rounded-2xl min-h-[56px]
              ${oswald.className} font-black text-lg uppercase tracking-widest
              shadow-lg shadow-[#EAE84B]/30 active:scale-[0.98]
              flex items-center justify-center gap-3 transition-all
            `}
            style={{
              transitionDelay: isMenuOpen ? `${navItems.length * 35}ms` : "0ms",
              opacity: isMenuOpen ? 1 : 0,
            }}
          >
            <Mail size={22} strokeWidth={2.5} />
            ENVIAR MENSAJE
          </Link>

          {/* Safe area iPhone home indicator */}
          <div
            aria-hidden
            style={{ height: "env(safe-area-inset-bottom)" }}
            className="lg:hidden"
          />
        </div>
      </nav>

      {/* ESTILOS GLOBALES */}
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

        .shimmer-sweep {
          animation: sweep 4s infinite ease-in-out;
        }

        .animate-button-pulse {
          animation: pulse-soft 3s infinite ease-in-out;
        }

        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }

        @media (prefers-reduced-motion: reduce) {
          .animate-button-pulse,
          .shimmer-sweep {
            animation: none !important;
          }
        }
      `}</style>
    </>
  );
};

export default Header;
