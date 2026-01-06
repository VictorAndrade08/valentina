"use client";

import { useRef, useEffect, useState } from "react";
import Link from "next/link";

// URL de tu Google Sheets publicada como CSV
const CMS_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTYKQwKNfKrrKl6J91u7X26Yr8cQxsalFeHIjnZfxjDaHcgS5JYPn_KzHt5naz_-yFXfLidX96gr_yg/pub?output=csv";

// FUNCIÓN DE PROCESAMIENTO ROBUSTO (Captura todo el texto sin errores)
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

  // Mapeo de llaves a minúsculas para evitar errores
  rows.slice(1).forEach(row => {
    if (row[0]) result[row[0].toLowerCase()] = row[1] || "";
  });

  return result;
}

export default function AboutBio() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [cms, setCms] = useState<Record<string, string> | null>(null);

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

  const handleMouseEnter = () => {
    if (videoRef.current) {
      videoRef.current.muted = false;
      videoRef.current.volume = 1;
    }
  };

  const handleMouseLeave = () => {
    if (videoRef.current) {
      videoRef.current.muted = true;
      videoRef.current.volume = 0;
    }
  };

  return (
    <section id="acerca-de-mi" className="w-full bg-[#FDFDFD] py-24 border-t-[6px] border-[#6F2C91]">
      <div className="max-w-[1300px] mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
        
        {/* LADO IZQUIERDO: VIDEO */}
        <div 
          className="lg:col-span-5 relative group"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <div className="relative z-10 w-full aspect-[4/5] overflow-hidden rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.15)] bg-gray-200">
             <video
                ref={videoRef}
                src={get("video", "https://peachpuff-cod-624982.hostingersite.com/wp-content/uploads/2025/12/copy_C43FC71E-9FD5-41A2-B37E-88F0523A6E74.mp4")}
                className="w-full h-full object-cover"
                autoPlay
                loop
                muted
                playsInline
             />
             <div className="absolute bottom-4 right-4 bg-black/40 backdrop-blur-md p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                </svg>
             </div>
          </div>
          <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-[#6F2C91] rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse" />
        </div>

        {/* LADO DERECHO: TEXTO DINÁMICO COMPLETO */}
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

          <div className="mt-12 flex flex-wrap items-center gap-6">
            <Link 
              href="/biografia" 
              className="bg-[#6F2C91] text-white px-10 py-4 rounded-full font-bold transition-all shadow-xl hover:shadow-[#6f2c9140] hover:-translate-y-1 active:scale-95 uppercase tracking-widest text-sm"
            >
              Biografía Completa
            </Link>
            
            <a href="#leyes" className="flex items-center gap-4 text-[#1A1A1A] font-bold group">
               <div className="w-12 h-12 border-2 border-gray-200 rounded-full flex items-center justify-center group-hover:border-[#6F2C91] group-hover:bg-[#6F2C91]/5 transition-all">
                  <svg className="w-5 h-5 fill-[#6F2C91]" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
               </div>
               <span className="uppercase tracking-widest text-xs">Ver Resultados</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}