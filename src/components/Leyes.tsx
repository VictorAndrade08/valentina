"use client";

import { useState, useEffect, useRef } from "react";
import { Oswald } from "next/font/google";
// Asegúrate de tener instalado: npm install react-icons
import { FaChevronLeft, FaChevronRight, FaPlus, FaTimes } from "react-icons/fa";

// Configuramos la fuente para evitar errores si no tienes 'boruino'
const oswald = Oswald({
  subsets: ["latin"],
  weight: ["700"],
});

type LeyData = {
  id: string;
  titleTop: string;
  title: string;
  img: string;
  desc: string;
  full: string;
};

// --- TU FUNCIÓN ORIGINAL (INTACTA) ---
function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let cur = ""; let row: string[] = []; let inQuotes = false; let i = 0;
  while (i < text.length) {
    const char = text[i];
    if (inQuotes) {
      if (char === '"') {
        if (i + 1 < text.length && text[i + 1] === '"') { cur += '"'; i += 2; }
        else { inQuotes = false; i++; }
      } else { cur += char; i++; }
    } else {
      if (char === '"') { inQuotes = true; i++; }
      else if (char === ",") { row.push(cur); cur = ""; i++; }
      else if (char === "\r" || char === "\n") {
        row.push(cur); rows.push(row); row = []; cur = "";
        if (char === "\r" && i + 1 < text.length && text[i + 1] === "\n") i += 2; else i++;
      } else { cur += char; i++; }
    }
  }
  row.push(cur); rows.push(row); return rows;
}
// -------------------------------------

export default function Leyes() {
  const [leyes, setLeyes] = useState<LeyData[]>([]);
  const [modalData, setModalData] = useState<LeyData | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const url = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTYKQwKNfKrrKl6J91u7X26Yr8cQxsalFeHIjnZfxjDaHcgS5JYPn_KzHt5naz_-yFXfLidX96gr_yg/pub?gid=809219241&single=true&output=csv";
    
    fetch(url, { cache: "no-store" })
      .then((res) => res.text())
      .then((csv) => {
        // Validación extra para evitar pantalla blanca si el CSV falla
        if (!csv) return;
        
        const rawRows = parseCsv(csv);
        const rows = rawRows.filter(r => r && r.some(cell => cell.trim() !== ""));
        
        if (rows.length < 2) return;
        
        const dataRows = rows.slice(1);
        const parsed = dataRows.map((cols, index) => ({
          id: (cols[0] ?? index).toString().trim(),
          titleTop: (cols[1] ?? "").toString().trim(),
          title: (cols[2] ?? "").toString().trim(),
          img: (cols[3] ?? "").toString().trim(),
          desc: (cols[4] ?? "").toString().trim(),
          full: (cols[5] ?? "").toString().trim(),
        })).filter(item => item.title); // Filtro básico
        
        setLeyes(parsed);
      })
      .catch(err => console.error("Error cargando leyes:", err));
  }, []);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      // Ajuste leve para que el scroll sea más fluido
      const scrollTo = direction === "left" ? scrollLeft - clientWidth / 1.2 : scrollLeft + clientWidth / 1.2;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: "smooth" });
    }
  };

  return (
    <section className="w-full py-20 bg-[#FBFBFD] overflow-hidden relative">
      <div className="max-w-[1400px] mx-auto px-6 mb-12 flex justify-between items-end">
        <div className="max-w-2xl">
          <h2 className={`${oswald.className} text-[#1D1D1F] text-[clamp(2.5rem,5vw,4rem)] font-black uppercase leading-[0.9] mb-4`}>
            ¡Lo que hemos <span className="text-[#6F2C91]">logrado!</span>
          </h2>
          <p className="text-[#86868B] text-xl font-medium leading-tight">Como su representante en la Asamblea Nacional...</p>
        </div>
        
        {/* FLECHAS ESCRITORIO (Usando react-icons para evitar error de sintaxis SVG) */}
        <div className="hidden md:flex gap-3">
          <button onClick={() => scroll("left")} className="w-12 h-12 rounded-full bg-white shadow-md text-[#1D1D1F] flex items-center justify-center hover:bg-[#F5F5F7] transition-all active:scale-95 border border-gray-100">
            <FaChevronLeft size={20} />
          </button>
          <button onClick={() => scroll("right")} className="w-12 h-12 rounded-full bg-white shadow-md text-[#1D1D1F] flex items-center justify-center hover:bg-[#F5F5F7] transition-all active:scale-95 border border-gray-100">
            <FaChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* SLIDER HORIZONTAL */}
      <div 
        ref={scrollRef}
        className="flex gap-8 overflow-x-auto px-6 md:px-[calc((100vw-1300px)/2)] pb-12 pt-4 no-scrollbar snap-x snap-mandatory scroll-smooth"
      >
        {leyes.map((item) => (
          <div
            key={item.id}
            onClick={() => setModalData(item)}
            className="flex-none w-[85vw] md:w-[460px] aspect-[4/5] md:h-[600px] relative rounded-[2.8rem] overflow-hidden snap-center shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 cursor-pointer group bg-white border border-gray-100"
          >
            {item.img && (
              <img 
                src={item.img} 
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" 
                alt={item.title} 
              />
            )}
            
            {/* GRADIENTE */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-90" />

            <div className="absolute inset-0 p-8 md:p-10 flex flex-col justify-between">
              {/* TAG SUPERIOR */}
              <div className="self-start px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/30 shadow-sm">
                 <span className="text-white font-bold tracking-[0.1em] text-[10px] md:text-xs uppercase drop-shadow-md">{item.titleTop}</span>
              </div>

              {/* CONTENIDO INFERIOR */}
              <div className="space-y-4 translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                <h3 className={`${oswald.className} text-white text-2xl md:text-[2.2rem] font-black uppercase leading-tight drop-shadow-xl line-clamp-2`}>
                  {item.title}
                </h3>
                
                <div className="flex items-end justify-between gap-4">
                  <p className="text-gray-100 text-sm md:text-lg font-medium leading-snug max-w-[75%] drop-shadow-md line-clamp-3">
                    {item.desc}
                  </p>
                  
                  {/* BOTÓN + */}
                  <div className="flex-none w-12 h-12 md:w-14 md:h-14 rounded-full bg-[#6F2C91] shadow-xl flex items-center justify-center transition-all group-hover:scale-110 group-hover:bg-[#EAE84B] group-hover:text-[#6F2C91]">
                    <FaPlus className="text-white group-hover:text-[#6F2C91] text-xl" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* FLECHAS MÓVIL (ABAJO) */}
      <div className="flex md:hidden justify-center gap-6 mt-4 pb-8">
          <button onClick={() => scroll("left")} className="w-14 h-14 rounded-full bg-white shadow-lg text-[#1D1D1F] flex items-center justify-center active:scale-95 transition-all border border-gray-100">
            <FaChevronLeft size={24} />
          </button>
          <button onClick={() => scroll("right")} className="w-14 h-14 rounded-full bg-white shadow-lg text-[#1D1D1F] flex items-center justify-center active:scale-95 transition-all border border-gray-100">
            <FaChevronRight size={24} />
          </button>
      </div>

      {/* MODAL */}
      {modalData && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[999] flex items-center justify-center p-4 animate-fadeIn" onClick={() => setModalData(null)}>
          <div className="bg-white w-full max-w-3xl max-h-[90vh] overflow-hidden rounded-[3rem] relative shadow-2xl animate-scaleIn flex flex-col" onClick={e => e.stopPropagation()}>
            
            {/* Imagen Header del Modal */}
            <div className="relative h-[250px] md:h-[350px] flex-none">
                {modalData.img && <img src={modalData.img} className="w-full h-full object-cover" alt="" />}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <button 
                  onClick={() => setModalData(null)} 
                  className="absolute top-6 right-6 w-12 h-12 bg-black/40 backdrop-blur-md text-white rounded-full flex items-center justify-center text-xl z-20 hover:bg-[#6F2C91] transition-all"
                >
                  <FaTimes />
                </button>
            </div>
            
            {/* Contenido Scrollable */}
            <div className="flex-1 overflow-y-auto p-8 md:p-14 space-y-6 no-scrollbar bg-white">
              <div className="inline-block px-4 py-1.5 rounded-full bg-[#6F2C91]/10 text-[#6F2C91] text-xs font-bold uppercase tracking-widest">
                {modalData.titleTop}
              </div>
              <h2 className={`${oswald.className} text-3xl md:text-5xl font-black uppercase leading-[1.1] text-[#1D1D1F]`}>
                {modalData.title}
              </h2>
              <div className="w-24 h-1.5 bg-[#6F2C91] rounded-full" />
              <p className="text-[#424245] text-lg md:text-xl leading-relaxed whitespace-pre-line font-medium pb-4">
                {modalData.full}
              </p>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
        .animate-scaleIn { animation: scaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes scaleIn { from { opacity: 0; transform: scale(0.95) translateY(10px); } to { opacity: 1; transform: scale(1) translateY(0); } }
      `}</style>
    </section>
  );
}