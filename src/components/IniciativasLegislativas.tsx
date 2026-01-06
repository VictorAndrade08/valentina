"use client";

import { useState, useEffect } from "react";
import { Oswald } from "next/font/google";
import { FaGraduationCap, FaPlayCircle, FaCheckCircle, FaImage } from "react-icons/fa";

const oswald = Oswald({
  subsets: ["latin"],
  weight: ["700"],
});

// URL DE TU CSV CON GID ESPECÍFICO PARA FORMACIÓN DUAL
const CMS_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTYKQwKNfKrrKl6J91u7X26Yr8cQxsalFeHIjnZfxjDaHcgS5JYPn_KzHt5naz_-yFXfLidX96gr_yg/pub?gid=1021420786&single=true&output=csv";

/**
 * PARSER PROFESIONAL
 * Permite manejar celdas con mucho texto, comas internas y saltos de línea.
 */
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

  // Mapeo a minúsculas para evitar errores de escritura en el Excel
  rows.slice(1).forEach(row => {
    if (row[0]) result[row[0].toLowerCase()] = row[1] || "";
  });

  return result;
}

export default function PresentacionFormacionDual() {
  const [cms, setCms] = useState<Record<string, string> | null>(null);

  useEffect(() => {
    // Cache 'no-store' para que los cambios en el Excel se vean rápido
    fetch(CMS_URL, { cache: "no-store" })
      .then(res => res.text())
      .then(csv => {
        const data = parseCSV(csv);
        setCms(data);
      })
      .catch(err => console.error("Error cargando Formación Dual:", err));
  }, []);

  const get = (key: string, fallback: string) => {
    const val = cms?.[key.toLowerCase()];
    return !val || val.trim() === "" ? fallback : val;
  };

  /**
   * PROCESADOR DE GALERÍA
   * Separa los links que pongas en la celda 'fd_galeria' por comas.
   */
  const getGallery = () => {
    const galleryString = get("fd_galeria", "");
    if (!galleryString) return ["https://via.placeholder.com/1080x1920?text=Imagen+Próximamente"];
    return galleryString.split(",").map(url => url.trim());
  };

  const galleryImages = getGallery();

  return (
    <section id="formacion-dual" className="w-full py-24 bg-white selection:bg-[#6F2C91]/20">
      <div className="max-w-[1300px] mx-auto px-6">
        
        {/* ENCABEZADO DINÁMICO */}
        <div className="mb-16">
          <h2 className={`${oswald.className} text-[clamp(2.5rem,5vw,4.5rem)] font-black uppercase leading-[0.85] text-[#1D1D1F]`}>
            {get("fd_titulo_1", "FORMACIÓN")} <br /> 
            <span className="text-[#6F2C91]">{get("fd_titulo_2", "DUAL EN ECUADOR")}</span>
          </h2>
          <div className="w-20 h-1.5 bg-[#EAE84B] rounded-full mt-4 shadow-sm" />
          <p className="mt-8 text-[#86868B] text-xl font-medium max-w-4xl leading-relaxed">
            {get("fd_descripcion", "Cargando descripción desde el panel...")}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* MULTIMEDIA: GALERÍA + VIDEO */}
          <div className="lg:col-span-7 grid grid-cols-2 gap-6 h-full">
            
            {/* COMPONENTE GALERÍA (DESLIZABLE) */}
            <div className="relative aspect-[9/16] rounded-[2.5rem] overflow-hidden shadow-2xl group border border-gray-100 bg-gray-50">
              <div className="flex h-full w-full overflow-x-auto snap-x snap-mandatory no-scrollbar scroll-smooth">
                {galleryImages.map((img, index) => (
                  <div key={index} className="flex-none w-full h-full snap-center">
                    <img 
                      src={img} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                      alt={`Galería ${index + 1}`} 
                    />
                  </div>
                ))}
              </div>
              
              {/* Indicadores de Galería */}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
                {galleryImages.length > 1 && galleryImages.map((_, i) => (
                  <div key={i} className="w-2 h-2 rounded-full bg-white/60 shadow-md" />
                ))}
              </div>

              <div className="absolute top-6 right-6 bg-black/30 backdrop-blur-md p-3 rounded-full text-white">
                <FaImage size={18} />
              </div>
            </div>

            {/* COMPONENTE VIDEO (DINÁMICO) */}
            <div className="relative aspect-[9/16] rounded-[2.5rem] overflow-hidden shadow-2xl group border-2 border-[#EAE84B] bg-black">
              <video 
                key={get("fd_video", "video-key")} // Refresca el video si el link cambia
                src={get("fd_video", "")} 
                autoPlay
                muted
                loop 
                playsInline 
                className="w-full h-full object-cover opacity-80 transition-opacity group-hover:opacity-100" 
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black/20 group-hover:bg-transparent transition-all pointer-events-none">
                <div className="w-16 h-16 rounded-full bg-[#EAE84B] flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
                  <FaPlayCircle className="text-[#6F2C91] text-4xl" />
                </div>
                <span className="text-white font-black text-sm uppercase tracking-widest drop-shadow-md">Video Tour</span>
              </div>
            </div>
          </div>

          {/* FICHA TÉCNICA (CARD MORADA) */}
          <div className="lg:col-span-5">
            <div className="bg-[#6F2C91] rounded-[3.5rem] p-10 md:p-14 text-white shadow-[0_30px_60px_rgba(111,44,145,0.3)] relative overflow-hidden">
              <div className="relative z-10">
                <div className="w-16 h-16 bg-[#EAE84B] rounded-2xl flex items-center justify-center text-[#6F2C91] text-3xl mb-10 shadow-xl">
                  <FaGraduationCap />
                </div>
                
                <h3 className={`${oswald.className} text-4xl md:text-5xl uppercase leading-[0.9] mb-10 tracking-tighter`}>
                  {get("fd_ficha_titulo_1", "NUEVAS")} <br /> 
                  <span className="text-[#EAE84B]">{get("fd_ficha_titulo_2", "OPORTUNIDADES")}</span>
                </h3>

                <div className="space-y-8 mb-12">
                  <div className="flex items-start gap-5">
                    <FaCheckCircle className="text-[#EAE84B] mt-1 text-2xl flex-none shadow-sm" />
                    <p className="text-xl font-medium leading-snug opacity-95">{get("fd_beneficio_1", "Cargando beneficio...")}</p>
                  </div>
                  <div className="flex items-start gap-5">
                    <FaCheckCircle className="text-[#EAE84B] mt-1 text-2xl flex-none shadow-sm" />
                    <p className="text-xl font-medium leading-snug opacity-95">{get("fd_beneficio_2", "Cargando beneficio...")}</p>
                  </div>
                </div>

                {/* BOTONES */}
                <div className="flex flex-col gap-6">
                  <button className="bg-[#EAE84B] text-[#6F2C91] py-5 rounded-full font-black uppercase tracking-widest hover:bg-white hover:scale-[1.02] transition-all shadow-xl active:scale-95">
                    {get("fd_btn_principal", "CONOCE LOS INSTITUTOS")}
                  </button>
                  <button disabled className="bg-white/10 text-white/40 border border-white/5 py-5 rounded-full font-black uppercase tracking-widest text-sm cursor-not-allowed">
                    {get("fd_btn_secundario", "PRÓXIMAMENTE")}
                  </button>
                </div>
              </div>

              {/* Efecto decorativo de fondo */}
              <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-white/5 rounded-full blur-3xl pointer-events-none" />
            </div>
          </div>

        </div>
      </div>

      <style jsx>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </section>
  );
}