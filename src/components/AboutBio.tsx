"use client";

import { useRef, useEffect, useState } from "react";
import Link from "next/link";
import { FaPlay, FaTimes } from "react-icons/fa"; 
import { Oswald } from "next/font/google";

const oswald = Oswald({ subsets: ["latin"], weight: ["700"] });

// URL de tu Google Sheets publicada como CSV
const CMS_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTYKQwKNfKrrKl6J91u7X26Yr8cQxsalFeHIjnZfxjDaHcgS5JYPn_KzHt5naz_-yFXfLidX96gr_yg/pub?output=csv";

// FUNCIÓN DE PROCESAMIENTO ROBUSTO
function parseCSV(text: string) {
  const result: Record<string, string> = {};
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentColumn = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (inQuotes) {
      if (char === '"' && nextChar === '"') {
        currentColumn += '"'; i++;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        currentColumn += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ",") {
        currentRow.push(currentColumn.trim());
        currentColumn = "";
      } else if (char === "\n" || char === "\r") {
        if (currentColumn || currentRow.length > 0) {
          currentRow.push(currentColumn.trim());
          rows.push(currentRow);
          currentRow = [];
          currentColumn = "";
        }
      } else {
        currentColumn += char;
      }
    }
  }
  if (currentColumn || currentRow.length > 0) {
    currentRow.push(currentColumn.trim());
    rows.push(currentRow);
  }

  rows.slice(1).forEach(row => {
    if (row[0]) result[row[0].toLowerCase()] = row[1] || "";
  });

  return result;
}

export default function AboutBio() {
  const [cms, setCms] = useState<Record<string, string> | null>(null);
  const [isVideoOpen, setIsVideoOpen] = useState(false);

  useEffect(() => {
    fetch(CMS_URL, { cache: "no-store" })
      .then(res => res.text())
      .then(csv => {
        const data = parseCSV(csv);
        setCms(data);
      })
      .catch(err => console.error("ERROR CMS:", err));
  }, []);

  const get = (key: string, fallback: string) => {
    const val = cms?.[key.toLowerCase()];
    return !val || val.trim() === "" ? fallback : val;
  };

  const videoUrl = get("video", "https://peachpuff-cod-624982.hostingersite.com/wp-content/uploads/2025/12/copy_C43FC71E-9FD5-41A2-B37E-88F0523A6E74.mp4");

  return (
    <section id="acerca-de-mi" className="w-full bg-[#FDFDFD] py-16 md:py-24 border-t-[6px] border-[#6F2C91] overflow-hidden">
      <div className="max-w-[1300px] mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
        
        {/* LADO IZQUIERDO: VIDEO (VISUAL HOOK) */}
        {/* En móvil aparece primero para captar atención */}
        <div 
          className="lg:col-span-5 relative group cursor-pointer mx-auto w-full max-w-[500px] lg:max-w-none"
          onClick={() => setIsVideoOpen(true)}
        >
          {/* Card Container */}
          <div className="relative z-10 w-full aspect-[4/5] overflow-hidden rounded-[2rem] md:rounded-[2.5rem] shadow-[0_15px_40px_rgba(111,44,145,0.15)] bg-gray-100 border-2 border-transparent group-hover:border-[#6F2C91] transition-all duration-300">
             
             {/* Video Preview (Muted loop) */}
             <video
                src={videoUrl}
                className="w-full h-full object-cover opacity-95 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"
                autoPlay
                loop
                muted
                playsInline
             />
             
             {/* Dark Gradient Overlay for text readability */}
             <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />

             {/* Play Button Center */}
             <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-16 h-16 md:w-20 md:h-20 bg-[#6F2C91]/90 backdrop-blur-md rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300 animate-pulse-soft">
                   <FaPlay className="text-white text-2xl md:text-3xl ml-1" />
                </div>
             </div>

             {/* Label Bottom */}
             <div className="absolute bottom-6 left-0 right-0 text-center">
                <span className="bg-white/90 backdrop-blur-md text-[#6F2C91] px-5 py-2.5 rounded-full text-xs md:text-sm font-bold uppercase tracking-widest shadow-md transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                  Ver Video Historia
                </span>
             </div>
          </div>
          
          {/* Elemento decorativo detrás (Blobs) */}
          <div className="absolute -bottom-6 -left-6 w-32 h-32 md:w-48 md:h-48 bg-[#EAE84B] rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob pointer-events-none" />
          <div className="absolute -top-6 -right-6 w-32 h-32 md:w-48 md:h-48 bg-[#6F2C91] rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000 pointer-events-none" />
        </div>

        {/* LADO DERECHO: TEXTO DINÁMICO */}
        <div className="lg:col-span-7 flex flex-col justify-center text-center lg:text-left">
          <header className="mb-6 md:mb-8">
            <span className="text-[#6F2C91] font-bold tracking-[0.2em] uppercase text-xs md:text-sm mb-3 block">
              {get("subtitle", "Trayectoria y Compromiso")}
            </span>
            <h2 className={`${oswald.className} text-[#1A1A1A] text-[2.5rem] md:text-[3.5rem] lg:text-[4rem] font-bold leading-[1] uppercase mb-4 md:mb-6`}>
              {get("title", "Valentina Centeno")}
            </h2>
          </header>

          <div className="space-y-6 md:space-y-8 text-left">
            {/* Párrafo destacado con borde */}
            <div className="relative pl-6 md:pl-8 border-l-4 border-[#6F2C91]">
              <p className="text-[#1A1A1A] font-medium text-lg md:text-2xl leading-snug">
                {get("p1", "Soy asambleísta del Ecuador y, ante todo, una mujer que sueña con un país más justo.")}
              </p>
            </div>

            {/* Párrafos secundarios */}
            <div className="space-y-4">
              <p className="text-gray-600 text-base md:text-xl leading-relaxed">
                {get("p2", "Nací en Portoviejo, Manabí, donde aprendí a trabajar con humildad y propósito.")}
              </p>

              <p className="text-gray-600 text-base md:text-xl leading-relaxed">
                {get("p3", "Desde la Asamblea Nacional, trabajamos con firmeza por el empleo y la seguridad de los ecuatorianos.")}
              </p>
            </div>
          </div>

          <div className="mt-10 md:mt-12">
            <Link 
              href="/biografia" 
              className="inline-flex items-center justify-center bg-[#6F2C91] text-white px-8 py-4 rounded-full font-bold transition-all shadow-lg hover:shadow-[#6f2c9160] hover:-translate-y-1 active:scale-95 uppercase tracking-widest text-xs md:text-sm w-full md:w-auto"
            >
              Biografía Completa
            </Link>
          </div>
        </div>
      </div>

      {/* --- MODAL POP-UP VIDEO (UX MEJORADO) --- */}
      {isVideoOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 md:p-8 animate-fadeIn">
          {/* Overlay oscuro con blur */}
          <div 
            className="absolute inset-0 bg-black/90 backdrop-blur-sm transition-opacity"
            onClick={() => setIsVideoOpen(false)}
          />

          <div className="relative w-full max-w-6xl h-auto max-h-[85vh] bg-black rounded-2xl md:rounded-3xl shadow-2xl overflow-hidden flex items-center justify-center ring-1 ring-white/10">
            
            {/* Botón Cerrar */}
            <button 
              onClick={() => setIsVideoOpen(false)}
              className="absolute top-4 right-4 z-50 w-10 h-10 md:w-12 md:h-12 bg-black/60 hover:bg-[#6F2C91] text-white rounded-full flex items-center justify-center transition-all duration-300 backdrop-blur-md group shadow-lg"
              aria-label="Cerrar video"
            >
              <FaTimes className="text-lg md:text-xl group-hover:scale-110 transition-transform" />
            </button>

            {/* Video con Sonido */}
            <video 
              src={videoUrl} 
              autoPlay 
              controls
              className="w-full h-full max-h-[85vh] object-contain"
            />
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes pulse-soft {
          0%, 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(111, 44, 145, 0.7); }
          50% { transform: scale(1.05); box-shadow: 0 0 0 10px rgba(111, 44, 145, 0); }
        }
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }
        .animate-pulse-soft {
          animation: pulse-soft 2s infinite;
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
      `}</style>
    </section>
  );
}