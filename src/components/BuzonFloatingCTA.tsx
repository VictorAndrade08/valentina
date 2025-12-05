"use client";

import { useEffect, useState } from "react";
import { MessageCircle } from "lucide-react";

const BuzonFloatingCTA = () => {
  const [visible, setVisible] = useState(false);

  // Mostrar el botón solo después de hacer scroll
  useEffect(() => {
    const onScroll = () => {
      // en cliente siempre hay window
      setVisible(window.scrollY > 400);
    };

    onScroll(); // chequeo inicial
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleClick = () => {
    const el = document.getElementById("buzon");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    } else {
      window.location.hash = "#buzon";
    }
  };

  // Si aún no se debe mostrar, no renderizamos nada
  if (!visible) return null;

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label="Abrir Buzón Ciudadano"
      className="
        fixed
        right-4 sm:right-6
        bottom-4 sm:bottom-6
        z-[60]
        flex items-center justify-center
        rounded-full
        w-14 h-14 sm:w-16 sm:h-16
        bg-[#6F2C91]
        text-white
        border-[3px] border-[#EAE84B]
        shadow-[0_10px_30px_rgba(0,0,0,0.45)]
        transition-transform duration-200
        hover:scale-110
        active:scale-95
      "
    >
      {/* halo animado exterior */}
      <span className="absolute inline-flex w-full h-full rounded-full opacity-70 animate-ping">
        <span className="w-full h-full rounded-full border-2 border-[#EAE84B]" />
      </span>

      {/* círculo interior con ícono */}
      <span className="relative flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#6F2C91]">
        <MessageCircle size={24} />
      </span>
    </button>
  );
};

export default BuzonFloatingCTA;
