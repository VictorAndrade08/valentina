"use client";

import React from "react";
import { Oswald } from "next/font/google";
import { 
  FaXTwitter, 
  FaFacebookF, 
  FaInstagram, 
  FaTiktok 
} from "react-icons/fa6";

const oswald = Oswald({
  subsets: ["latin"],
  weight: ["700"],
});

const socialLinks = [
  {
    name: "X (Twitter)",
    user: "@ValenCenteno",
    href: "https://x.com/ValenCenteno",
    icon: <FaXTwitter />,
    color: "group-hover:bg-black"
  },
  {
    name: "Facebook",
    user: "Valentina Centeno",
    href: "https://www.facebook.com/profile.php?id=61570914724409",
    icon: <FaFacebookF />,
    color: "group-hover:bg-[#1877F2]"
  },
  {
    name: "Instagram",
    user: "@valencentenoa",
    href: "https://www.instagram.com/valencentenoa/",
    icon: <FaInstagram />,
    color: "group-hover:bg-gradient-to-tr group-hover:from-[#f9ce34] group-hover:via-[#ee2a7b] group-hover:to-[#6228d7]"
  },
  {
    name: "TikTok",
    user: "@valencentenoa",
    href: "https://www.tiktok.com/@valencentenoa",
    icon: <FaTiktok />,
    color: "group-hover:bg-[#000000]"
  }
];

export default function SocialFollow() {
  return (
    <section className="w-full py-24 bg-[#FBFBFD] overflow-hidden">
      <div className="max-w-[1400px] mx-auto px-6 flex flex-col items-center">
        
        {/* TITULAR REFORZADO */}
        <div className="text-center mb-16">
          <h3 className={`${oswald.className} text-[#6F2C91] text-3xl md:text-5xl uppercase tracking-wider mb-4`}>
            CONÉCTATE <span className="text-[#1D1D1F]">CONMIGO</span>
          </h3>
          <div className="w-24 h-2 bg-[#EAE84B] mx-auto rounded-full" />
        </div>

        {/* CONTENEDOR DE TARJETAS MÁS GRANDES */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 w-full max-w-[1200px]">
          {socialLinks.map((social) => (
            <a
              key={social.name}
              href={social.href}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative flex flex-col items-center p-8 bg-white rounded-[2.5rem] shadow-[0_10px_30px_rgba(0,0,0,0.05)] border border-gray-100 transition-all duration-500 hover:-translate-y-3 hover:shadow-2xl overflow-hidden"
            >
              {/* Fondo Dinámico con Color de Marca (Sutil al hover) */}
              <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500 ${social.color}`} />

              {/* Icono Principal más grande */}
              <div className="relative z-10 w-20 h-20 md:w-24 md:h-24 rounded-[2rem] bg-[#FBFBFD] shadow-inner flex items-center justify-center text-[#6F2C91] text-4xl md:text-5xl transition-all duration-500 group-hover:scale-110 group-hover:text-white group-hover:bg-transparent">
                 {/* El icono cambia a blanco cuando el contenedor padre tiene color de marca */}
                <div className="group-hover:drop-shadow-lg transition-all">
                  {social.icon}
                </div>
                
                {/* Overlay de color para el icono al hover */}
                <div className={`absolute inset-0 rounded-[2rem] opacity-0 group-hover:opacity-100 transition-all duration-500 -z-10 ${social.color}`} />
              </div>

              {/* Texto Búscame Como... */}
              <div className="mt-8 text-center relative z-10">
                <span className="block text-[#86868B] text-xs font-bold uppercase tracking-[0.2em] mb-1">
                  Búscame como:
                </span>
                <span className={`${oswald.className} block text-[#1D1D1F] text-xl md:text-2xl group-hover:text-[#6F2C91] transition-colors`}>
                  {social.user}
                </span>
              </div>

              {/* Tag de Red Social */}
              <div className="mt-4 px-4 py-1 rounded-full bg-gray-100 text-[#86868B] text-[10px] font-black uppercase tracking-tighter transition-all group-hover:bg-[#6F2C91] group-hover:text-white">
                {social.name}
              </div>
            </a>
          ))}
        </div>

        {/* CTA FINAL */}
        <div className="mt-20 flex flex-col items-center gap-4">
          <p className="text-[#86868B] font-medium text-sm md:text-lg uppercase tracking-[0.3em]">
            Únete a nuestra comunidad digital
          </p>
          <div className="flex gap-1">
            <div className="w-2 h-2 rounded-full bg-[#6F2C91] animate-bounce" />
            <div className="w-2 h-2 rounded-full bg-[#EAE84B] animate-bounce [animation-delay:0.2s]" />
            <div className="w-2 h-2 rounded-full bg-[#6F2C91] animate-bounce [animation-delay:0.4s]" />
          </div>
        </div>

      </div>
    </section>
  );
}