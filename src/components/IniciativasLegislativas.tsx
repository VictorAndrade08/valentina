"use client";

import { useState, useEffect } from "react";
import { Oswald } from "next/font/google";
import { FaGraduationCap, FaPlay, FaCheckCircle, FaTimes, FaExpand } from "react-icons/fa";

const oswald = Oswald({
  subsets: ["latin"],
  weight: ["700"],
});

// URL DE TU CSV CON GID ESPECÍFICO PARA FORMACIÓN DUAL
const CMS_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTYKQwKNfKrrKl6J91u7X26Yr8cQxsalFeHIjnZfxjDaHcgS5JYPn_KzHt5naz_-yFXfLidX96gr_yg/pub?gid=1021420786&single=true&output=csv";

/**
 * PARSER PROFESIONAL
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

  rows.slice(1).forEach(row => {
    if (row[0]) result[row[0].toLowerCase()] = row[1] || "";
  });

  return result;
}

export default function PresentacionFormacionDual() {
  const [cms, setCms] = useState<Record<string, string> | null>(null);
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
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

  const getGallery = () => {
    const galleryString = get("fd_galeria", "");
    if (!galleryString) return ["https://via.placeholder.com/1080x1920?text=Imagen+Próximamente"];
    return galleryString.split(",").map(url => url.trim());
  };

  const galleryImages = getGallery();
  const videoUrl = get("fd_video", "");

  return (
    <section id="ley" className="w-full py-16 md:py-24 bg-white scroll-mt-20 overflow-hidden">
      <div className="max-w-[1300px] mx-auto px-6">
        
        {/* ENCABEZADO DINÁMICO */}
        <div className="mb-12 md:mb-16 text-center md:text-left">
          <h2 className={`${oswald.className} text-[clamp(2.5rem,10vw,4.5rem)] font-black uppercase leading-[0.9] text-[#1D1D1F]`}>
            {get("fd_titulo_1", "FORMACIÓN")} <br /> 
            <span className="text-[#6F2C91]">{get("fd_titulo_2", "DUAL EN ECUADOR")}</span>
          </h2>
          <div className="w-20 h-1.5 bg-[#EAE84B] rounded-full mt-6 shadow-sm mx-auto md:mx-0" />
          <p className="mt-6 md:mt-8 text-[#86868B] text-lg md:text-xl font-medium max-w-4xl leading-relaxed mx-auto md:mx-0">
            {get("fd_descripcion", "Cargando descripción desde el panel...")}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* MULTIMEDIA: VIDEO Y GALERÍA (Responsive Grid) */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6">
            
            {/* 1. VIDEO (Primero en móvil por jerarquía) */}
            <div 
              className="relative aspect-[4/5] sm:aspect-[9/16] rounded-[2rem] overflow-hidden shadow-xl group border-2 border-[#EAE84B] bg-black cursor-pointer transform transition-all duration-300 active:scale-95 hover:shadow-2xl"
              onClick={() => setIsVideoOpen(true)}
            >
              <video 
                key={videoUrl}
                src={videoUrl} 
                autoPlay
                muted
                loop 
                playsInline 
                className="w-full h-full object-cover opacity-80 group-hover:opacity-60 transition-opacity" 
              />
              
              {/* Overlay Gradiente */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

              {/* Botón Play */}
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 z-10">
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-[#EAE84B]/90 backdrop-blur-sm flex items-center justify-center shadow-[0_0_30px_rgba(234,232,75,0.4)] group-hover:scale-110 transition-transform duration-300 animate-pulse-slow">
                  <FaPlay className="text-[#6F2C91] text-2xl md:text-3xl ml-1" />
                </div>
                <span className="text-white font-bold text-xs md:text-sm uppercase tracking-widest bg-black/40 px-4 py-1.5 rounded-full backdrop-blur-md border border-white/10">
                  Ver Video
                </span>
              </div>
            </div>

            {/* 2. GALERÍA SWIPEABLE */}
            <div className="relative aspect-[4/5] sm:aspect-[9/16] rounded-[2rem] overflow-hidden shadow-xl border border-gray-100 bg-gray-50 group">
              {/* Contenedor Scroll Snap */}
              <div className="flex h-full w-full overflow-x-auto snap-x snap-mandatory no-scrollbar scroll-smooth">
                {galleryImages.map((img, index) => (
                  <div 
                    key={index} 
                    className="flex-none w-full h-full snap-center cursor-pointer relative"
                    onClick={() => setSelectedImage(img)}
                  >
                    <img 
                      src={img} 
                      className="w-full h-full object-cover" 
                      alt={`Galería ${index + 1}`} 
                    />
                    {/* Icono de ampliar en cada imagen */}
                    <div className="absolute top-4 right-4 bg-black/40 p-2 rounded-full text-white backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity">
                      <FaExpand size={14} />
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Indicadores (Dots) */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 pointer-events-none bg-black/20 px-3 py-1.5 rounded-full backdrop-blur-sm">
                {galleryImages.map((_, i) => (
                  <div key={i} className={`w-1.5 h-1.5 rounded-full shadow-sm transition-colors ${i === 0 ? 'bg-[#EAE84B]' : 'bg-white/60'}`} />
                ))}
              </div>
              
              {/* Hint para deslizar en móvil */}
              <div className="absolute bottom-16 right-4 sm:hidden pointer-events-none animate-bounce text-white/80 text-xs font-bold drop-shadow-md bg-black/30 px-2 py-1 rounded">
                ← Desliza →
              </div>
            </div>
          </div>

          {/* FICHA TÉCNICA (CARD MORADA) */}
          <div className="lg:col-span-5 w-full">
            <div className="bg-[#6F2C91] rounded-[2.5rem] md:rounded-[3.5rem] p-8 md:p-12 text-white shadow-2xl relative overflow-hidden">
              
              {/* Contenido */}
              <div className="relative z-10">
                <div className="w-14 h-14 md:w-16 md:h-16 bg-[#EAE84B] rounded-2xl flex items-center justify-center text-[#6F2C91] text-2xl md:text-3xl mb-8 shadow-lg rotate-3">
                  <FaGraduationCap />
                </div>
                
                <h3 className={`${oswald.className} text-3xl md:text-4xl lg:text-5xl uppercase leading-[0.9] mb-8 tracking-wide`}>
                  {get("fd_ficha_titulo_1", "NUEVAS")} <br /> 
                  <span className="text-[#EAE84B]">{get("fd_ficha_titulo_2", "OPORTUNIDADES")}</span>
                </h3>

                <div className="space-y-6 mb-10">
                  <div className="flex items-start gap-4">
                    <FaCheckCircle className="text-[#EAE84B] mt-1 text-xl flex-none" />
                    <p className="text-lg md:text-xl font-medium leading-tight opacity-95">{get("fd_beneficio_1", "Cargando beneficio...")}</p>
                  </div>
                  <div className="flex items-start gap-4">
                    <FaCheckCircle className="text-[#EAE84B] mt-1 text-xl flex-none" />
                    <p className="text-lg md:text-xl font-medium leading-tight opacity-95">{get("fd_beneficio_2", "Cargando beneficio...")}</p>
                  </div>
                </div>

                {/* BOTONES ACCIÓN */}
                <div className="flex flex-col gap-4">
                  <a 
                    href="https://appcmi.ces.gob.ec/formaciondual/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="bg-[#EAE84B] text-[#6F2C91] py-4 md:py-5 rounded-xl md:rounded-2xl font-black uppercase tracking-widest hover:bg-white transition-all shadow-lg active:scale-95 text-center text-sm md:text-base flex items-center justify-center gap-2"
                  >
                    <span>{get("fd_btn_principal", "CONOCE LOS INSTITUTOS")}</span>
                    <span className="text-xl">→</span>
                  </a>
                  <button disabled className="bg-black/20 text-white/50 border border-white/10 py-4 rounded-xl md:rounded-2xl font-bold uppercase tracking-widest text-xs md:text-sm cursor-not-allowed hover:bg-black/30 transition-colors">
                    {get("fd_btn_secundario", "PRÓXIMAMENTE")}
                  </button>
                </div>
              </div>

              {/* Decoración Fondo */}
              <div className="absolute -right-16 -bottom-16 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none mix-blend-overlay" />
              <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
            </div>
          </div>

        </div>
      </div>

      {/* --- MODALES OPTIMIZADOS --- */}
      
      {/* VIDEO MODAL */}
      {isVideoOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 animate-fadeIn">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={() => setIsVideoOpen(false)} />
          <div className="relative w-full max-w-5xl aspect-video bg-black rounded-2xl md:rounded-3xl shadow-2xl overflow-hidden ring-1 ring-white/10">
            <button 
              onClick={() => setIsVideoOpen(false)}
              className="absolute top-4 right-4 z-20 w-10 h-10 bg-black/50 hover:bg-[#EAE84B] text-white hover:text-[#6F2C91] rounded-full flex items-center justify-center transition-all"
            >
              <FaTimes />
            </button>
            <video src={videoUrl} autoPlay controls className="w-full h-full object-contain" />
          </div>
        </div>
      )}

      {/* IMAGEN MODAL */}
      {selectedImage && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 animate-fadeIn">
          <div className="absolute inset-0 bg-black/95 backdrop-blur-md" onClick={() => setSelectedImage(null)} />
          <div className="relative max-w-full max-h-full">
            <button 
              onClick={() => setSelectedImage(null)}
              className="absolute -top-12 right-0 md:top-4 md:right-4 z-20 w-10 h-10 bg-white/20 hover:bg-white text-white hover:text-black rounded-full flex items-center justify-center transition-all backdrop-blur-md"
            >
              <FaTimes />
            </button>
            <img 
              src={selectedImage} 
              alt="Fullscreen" 
              className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
            />
          </div>
        </div>
      )}

      <style jsx>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes pulse-slow {
          0%, 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(234, 232, 75, 0.7); }
          50% { transform: scale(1.05); box-shadow: 0 0 0 10px rgba(234, 232, 75, 0); }
        }
        .animate-pulse-slow { animation: pulse-slow 3s infinite; }
        .animate-fadeIn { animation: fadeIn 0.2s ease-out forwards; }
        @keyframes fadeIn { from { opacity: 0; transform: scale(0.98); } to { opacity: 1; transform: scale(1); } }
      `}</style>
    </section>
  );
}