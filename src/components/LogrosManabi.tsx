"use client";

import { useState, useEffect, useRef, type ReactNode } from "react";
import {
  FaHelmetSafety,
  FaShip,
  FaFaucetDrip,
  FaFireFlameSimple,
  FaHeartPulse,
} from "react-icons/fa6";

type BlogroData = {
  id: string;
  iconKey: string;
  title: string;
  body: string;
  image?: string;
};

const BLOGROS_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTYKQwKNfKrrKl6J91u7X26Yr8cQxsalFeHIjnZfxjDaHcgS5JYPn_KzHt5naz_-yFXfLidX96gr_yg/pub?gid=57984147&single=true&output=csv";

// PARSER CSV (Tu código original intacto)
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

const iconMap: Record<string, ReactNode> = {
  helmet: <FaHelmetSafety />,
  ship: <FaShip />,
  water: <FaFaucetDrip />,
  fire: <FaFireFlameSimple />,
  heart: <FaHeartPulse />,
};

export default function LogrosManabi() {
  const [items, setItems] = useState<BlogroData[]>([]);
  const [modalData, setModalData] = useState<BlogroData | null>(null);
  const [sectionTitle, setSectionTitle] = useState("POR AMOR Y JUSTICIA CON MANABÍ");
  
  // NUEVO: Estado de carga para evitar pantalla blanca
  const [isLoading, setIsLoading] = useState(true);
  const [scrollProgress, setScrollProgress] = useState(0);
  
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsLoading(true); // Empezar carga
    fetch(BLOGROS_URL, { cache: "no-store" })
      .then((res) => res.text())
      .then((csv) => {
        // Validación simple para evitar errores si Google falla
        if (csv.includes("<!DOCTYPE") || csv.includes("<html")) return; 

        const allRows = parseCsv(csv);
        const rows = allRows.filter(r => r && r.some(cell => cell.trim() !== ""));
        if (rows.length < 2) return;
        
        const dataRows = rows.slice(1);
        const parsed: BlogroData[] = [];
        let foundSectionTitle = "";
        
        for (const cols of dataRows) {
          if (cols.length < 2) continue;
          const rawId = (cols[0] ?? "").toString().trim();
          const iconKey = (cols[1] ?? "").toString().trim().toLowerCase();
          const title = (cols[2] ?? "").toString().trim();
          const body = (cols[3] ?? "").toString().trim();
          const image = (cols[4] ?? "").toString().trim();
          const sectionTitleCol = (cols[5] ?? "").toString().trim();
          
          if (!foundSectionTitle && sectionTitleCol) foundSectionTitle = sectionTitleCol;
          if (!rawId || !title) continue;
          
          parsed.push({ id: rawId.padStart(2, "0"), iconKey, title, body, image });
        }
        
        if (parsed.length > 0) setItems(parsed);
        if (foundSectionTitle) setSectionTitle(foundSectionTitle);
      })
      .catch((err) => console.error("Error:", err))
      .finally(() => setIsLoading(false)); // Finalizar carga siempre
  }, []);

  // Calcular progreso del scroll
  const handleScroll = () => {
    if (scrollRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
        const total = scrollWidth - clientWidth;
        setScrollProgress((scrollLeft / total) * 100);
    }
  }

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollTo = direction === "left" ? scrollLeft - clientWidth / 1.5 : scrollLeft + clientWidth / 1.5;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: "smooth" });
    }
  };

  // --- RENDERIZADO DEL SKELETON (CARGA) ---
  if (isLoading) {
    return (
        <section className="w-full py-24 bg-[#FBFBFD] max-w-[1400px] mx-auto px-6 overflow-hidden">
            <div className="h-12 w-2/3 bg-gray-200 rounded animate-pulse mb-12"></div>
            <div className="flex gap-8 overflow-hidden">
                {[1,2,3].map(i => (
                    <div key={i} className="flex-none w-[85vw] md:w-[420px] h-[500px] bg-gray-200 rounded-[3rem] animate-pulse"></div>
                ))}
            </div>
        </section>
    )
  }

  return (
    <section id="logros-manabi" className="w-full py-16 md:py-24 bg-[#FBFBFD] overflow-hidden relative">
      <div className="max-w-[1400px] mx-auto px-6 mb-10 md:mb-16 flex justify-between items-end">
        <div className="max-w-2xl relative z-10">
          <h2 className="text-[#1D1D1F] font-[var(--font-boruino)] text-[clamp(2.2rem,5vw,3.8rem)] font-black uppercase leading-[0.9] mb-4">
            {sectionTitle.split(" ").slice(0, 4).join(" ")} <br />
            <span className="text-[#6F2C91]">{sectionTitle.split(" ").slice(4).join(" ")}</span>
          </h2>
          <div className="w-[80px] h-1.5 bg-[#EAE84B] rounded-full" />
        </div>

        <div className="hidden md:flex gap-4">
          <button onClick={() => scroll("left")} className="w-14 h-14 rounded-full bg-white shadow-lg text-[#1D1D1F] flex items-center justify-center hover:bg-[#F5F5F7] hover:scale-105 active:scale-95 transition-all border border-gray-100 z-10">
            <svg width="24" height="24" fill="none" viewBox="0 0 24 24" className="rotate-180"><path stroke="currentColor" strokeWidth="3" d="m9 5 7 7-7 7"/></svg>
          </button>
          <button onClick={() => scroll("right")} className="w-14 h-14 rounded-full bg-white shadow-lg text-[#1D1D1F] flex items-center justify-center hover:bg-[#F5F5F7] hover:scale-105 active:scale-95 transition-all border border-gray-100 z-10">
            <svg width="24" height="24" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeWidth="3" d="m9 5 7 7-7 7"/></svg>
          </button>
        </div>
      </div>

      {/* CARRUSEL */}
      <div 
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex gap-6 md:gap-8 overflow-x-auto px-6 md:px-[calc((100vw-1300px)/2)] pb-12 no-scrollbar snap-x snap-mandatory items-stretch cursor-grab active:cursor-grabbing"
      >
        {items.map((item) => (
          <div
            key={item.id}
            onClick={() => setModalData(item)}
            className="flex-none w-[85vw] md:w-[420px] h-[500px] md:h-[580px] relative rounded-[2.5rem] md:rounded-[3rem] overflow-hidden snap-center shadow-xl hover:shadow-2xl transition-all duration-500 cursor-pointer group border border-gray-100 active:scale-[0.98]"
          >
            <img 
                src={item.image} 
                loading="lazy"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" 
                alt="" 
            />
            {/* Gradiente Oscuro */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-90" />
            
            <div className="absolute inset-0 p-8 md:p-10 flex flex-col justify-between z-10">
              <div className="self-start p-4 rounded-2xl bg-black/30 backdrop-blur-xl border border-white/20 text-[#FFD100] text-3xl shadow-2xl">
                {iconMap[item.iconKey] ?? iconMap.helmet}
              </div>
              <div className="space-y-4 translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                <h3 className="text-white font-[var(--font-boruino)] text-xl md:text-2xl font-black uppercase leading-[1.1] drop-shadow-2xl line-clamp-3">
                  {item.title}
                </h3>
                <div className="w-16 h-1 bg-[#EAE84B] rounded-full" />
                <div className="flex items-center justify-between gap-4">
                   <p className="text-gray-200 text-sm md:text-base font-medium leading-relaxed line-clamp-2 drop-shadow-md">
                    {item.body}
                  </p>
                  <div className="flex-none w-10 h-10 rounded-full bg-[#6F2C91] flex items-center justify-center text-white text-xl font-light shadow-lg group-hover:rotate-90 transition-transform">
                    +
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
         {/* Espaciador final para UX móvil */}
         <div className="w-4 md:w-0 flex-none" />
      </div>

      {/* BARRA DE PROGRESO MÓVIL */}
      <div className="md:hidden px-10 -mt-6 mb-8 w-full">
         <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-[#6F2C91] transition-all duration-300" style={{ width: `${Math.max(15, scrollProgress)}%` }} />
         </div>
      </div>

      {/* MODAL NOTICIA COMPLETA MEJORADO */}
      {modalData && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center animate-fadeIn md:p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setModalData(null)} />
          
          <div className="bg-white w-full h-full md:h-auto md:max-w-3xl md:max-h-[90vh] overflow-hidden md:rounded-[3.5rem] relative shadow-2xl animate-scaleIn flex flex-col">
            <button onClick={() => setModalData(null)} className="absolute top-4 right-4 md:top-6 md:right-6 w-12 h-12 bg-white/90 backdrop-blur-md text-[#1D1D1F] rounded-full flex items-center justify-center text-3xl z-20 hover:bg-gray-100 transition-all shadow-md">×</button>
            
            <div className="overflow-y-auto h-full no-scrollbar">
              <div className="relative h-[40vh] md:h-[350px] shrink-0">
                <img src={modalData.image} className="w-full h-full object-cover" alt={modalData.title} />
              </div>
              <div className="p-8 md:p-14 space-y-6 -mt-8 bg-white relative rounded-t-[2.5rem] md:mt-0 md:rounded-none min-h-[50vh]">
                <div className="inline-block p-4 rounded-2xl bg-[#6F2C91]/10 text-[#6F2C91] text-3xl">
                  {iconMap[modalData.iconKey]}
                </div>
                <h2 className="text-3xl md:text-5xl font-black uppercase font-[var(--font-boruino)] leading-[1] text-[#1D1D1F]">
                  {modalData.title}
                </h2>
                <div className="w-24 h-1.5 bg-[#6F2C91] rounded-full" />
                <p className="text-[#424245] text-lg md:text-xl leading-relaxed whitespace-pre-line font-medium pb-20 md:pb-0">
                  {modalData.body}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .animate-fadeIn { animation: fadeIn 0.4s ease-out; }
        .animate-scaleIn { animation: scaleIn 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes scaleIn { from { opacity: 0; transform: scale(0.95) translateY(10px); } to { opacity: 1; transform: scale(1) translateY(0); } }
      `}</style>
    </section>
  );
}