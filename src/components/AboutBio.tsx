"use client";

import { useRef, useEffect, useState } from "react";
import Link from "next/link";
import { FaPlayCircle, FaTimes } from "react-icons/fa"; // Usamos react-icons para consistencia

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
  const [isVideoOpen, setIsVideoOpen] = useState(false); // Estado para el modal

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
    <section id="acerca-de-mi" className="w-full bg-[#FDFDFD] py-24 border-t-[6px] border-[#6F2C91]">
      <div className="max-w-[1300px] mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
        
        {/* LADO IZQUIERDO: VIDEO (CLICKABLE PARA POP-UP) */}
        <div 
          className="lg:col-span-5 relative group cursor-pointer"
          onClick={() => setIsVideoOpen(true)}
        >
          <div className="relative z-10 w-full aspect-[4/5] overflow-hidden rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.15)] bg-gray-200 border-2 border-transparent group-hover:border-[#6F2C91] transition-all duration-300">
             {/* Video Preview (Muted) */}
             <video
                src={videoUrl}
                className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"
                autoPlay
                loop
                muted
                playsInline
             />
             
             {/* Overlay Play Button */}
             <div className="absolute inset-0 flex items-center justify-center bg-black/10 group-hover:bg-black/20 transition-colors">
                <div className="w-20 h-20 bg-[#6F2C91]/90 backdrop-blur-md rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                   <FaPlayCircle className="text-white text-4xl ml-1" />
                </div>
             </div>

             <div className="absolute bottom-6 left-0 right-0 text-center">
                <span className="bg-white/90 backdrop-blur-md text-[#6F2C91] px-4 py-2 rounded-full text-sm font-bold uppercase tracking-widest shadow-sm">
                  Ver Video
                </span>
             </div>
          </div>
          
          {/* Elemento decorativo detrás */}
          <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-[#6F2C91] rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse pointer-events-none" />
        </div>

        {/* LADO DERECHO: TEXTO DINÁMICO */}
        <div className="lg:col-span-7 flex flex-col justify-center">
          <header className="mb-8">
            <span className="text-[#6F2C91] font-bold tracking-[0.2em] uppercase text-xs mb-3 block">
              {get("subtitle", "Trayectoria y Compromiso")}
            </span>
            <h2 className="text-[#1A1A1A] font-boruino text-[clamp(2.5rem,5vw,4rem)] font-black leading-[0.9] uppercase mb-6">
              {get("title", "Valentina Centeno")}
            </h2>
          </header>

          <div className="space-y-8">
            <div className="relative pl-8 border-l-4 border-[#6F2C91]">
              <p className="text-[#1A1A1A] font-medium text-xl md:text-2xl leading-tight">
                {get("p1", "Soy asambleísta del Ecuador y, ante todo, una mujer que sueña con un país más justo.")}
              </p>
            </div>

            <p className="text-gray-600 text-lg md:text-xl leading-relaxed">
              {get("p2", "Nací en Portoviejo, Manabí, donde aprendí a trabajar con humildad y propósito.")}
            </p>

            <p className="text-gray-600 text-lg md:text-xl leading-relaxed">
              {get("p3", "Desde la Asamblea Nacional, trabajamos con firmeza por el empleo y la seguridad de los ecuatorianos.")}
            </p>
          </div>

          <div className="mt-12">
            <Link 
              href="/biografia" 
              className="inline-block bg-[#6F2C91] text-white px-10 py-4 rounded-full font-bold transition-all shadow-xl hover:shadow-[#6f2c9140] hover:-translate-y-1 active:scale-95 uppercase tracking-widest text-sm"
            >
              Biografía Completa
            </Link>
          </div>
        </div>
      </div>

      {/* --- MODAL POP-UP VIDEO --- */}
      {isVideoOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 md:p-8 animate-fadeIn">
          <div className="relative w-full max-w-5xl aspect-video bg-black rounded-3xl shadow-2xl overflow-hidden border border-white/10">
            
            {/* Botón Cerrar */}
            <button 
              onClick={() => setIsVideoOpen(false)}
              className="absolute top-4 right-4 z-20 w-12 h-12 bg-black/50 hover:bg-[#6F2C91] text-white rounded-full flex items-center justify-center transition-all duration-300 backdrop-blur-md group"
            >
              <FaTimes className="text-xl group-hover:rotate-90 transition-transform" />
            </button>

            {/* Video con Sonido y Controles */}
            <video 
              src={videoUrl} 
              autoPlay 
              controls
              className="w-full h-full object-contain"
            />
          </div>
          
          {/* Clic fuera para cerrar */}
          <div className="absolute inset-0 -z-10" onClick={() => setIsVideoOpen(false)} />
        </div>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out forwards;
        }
      `}</style>
    </section>
  );
}