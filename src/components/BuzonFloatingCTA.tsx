"use client";

import { useEffect, useState } from "react";
import { FaWhatsapp } from "react-icons/fa";

const WHATSAPP_NUMBER = "593963730513";
const WHATSAPP_DEFAULT_MESSAGE =
  "Hola Valentina, me comunico desde tu página web.";

const BuzonFloatingCTA = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setVisible(window.scrollY > 400);
    };

    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleClick = () => {
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
      WHATSAPP_DEFAULT_MESSAGE
    )}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  if (!visible) return null;

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label="Escribir por WhatsApp"
      className="
        fixed
        right-4 sm:right-6
        bottom-4 sm:bottom-6
        z-[60]
        flex items-center justify-center
        rounded-full
        w-14 h-14 sm:w-16 sm:h-16
        bg-[#25D366]
        text-white
        border-[3px] border-white
        shadow-[0_10px_30px_rgba(0,0,0,0.45)]
        transition-transform duration-200
        hover:scale-110
        active:scale-95
      "
    >
      <span className="absolute inline-flex w-full h-full rounded-full opacity-70 animate-ping">
        <span className="w-full h-full rounded-full border-2 border-[#25D366]" />
      </span>

      <span className="relative flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#25D366]">
        <FaWhatsapp size={28} />
      </span>
    </button>
  );
};

export default BuzonFloatingCTA;
