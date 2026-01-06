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

// URL DE LA HOJA BLOGROS (CSV)
const BLOGROS_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTYKQwKNfKrrKl6J91u7X26Yr8cQxsalFeHIjnZfxjDaHcgS5JYPn_KzHt5naz_-yFXfLidX96gr_yg/pub?gid=57984147&single=true&output=csv";

// PARSER CSV ROBUSTO
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
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch(BLOGROS_URL, { cache: "no-store" })
      .then((res) => res.text())
      .then((csv) => {
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
      .catch((err) => console.error("Error:", err));
  }, []);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollTo = direction === "left" ? scrollLeft - clientWidth / 1.5 : scrollLeft + clientWidth / 1.5;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: "smooth" });
    }
  };

  return (
    <section id="logros-manabi" className="w-full py-24 bg-[#FBFBFD] overflow-hidden relative">
      <div className="max-w-[1400px] mx-auto px-6 mb-16 flex justify-between items-end">
        <div className="max-w-2xl">
          <h2 className="text-[#1D1D1F] font-[var(--font-boruino)] text-[clamp(2.2rem,5vw,3.8rem)] font-black uppercase leading-[0.9] mb-4">
            {sectionTitle.split(" ").slice(0, 4).join(" ")} <br />
            <span className="text-[#6F2C91]">{sectionTitle.split(" ").slice(4).join(" ")}</span>
          </h2>
          <div className="w-[80px] h-1.5 bg-[#EAE84B] rounded-full" />
        </div>

        <div className="hidden md:flex gap-4">
          <button onClick={() => scroll("left")} className="w-12 h-12 rounded-full bg-white shadow-md text-[#1D1D1F] flex items-center justify-center hover:bg-[#F5F5F7] transition-all border border-gray-100">
            <svg width="24" height="24" fill="none" viewBox="0 0 24 24" className="rotate-180"><path stroke="currentColor" strokeWidth="3" d="m9 5 7 7-7 7"/></svg>
          </button>
          <button onClick={() => scroll("right")} className="w-12 h-12 rounded-full bg-white shadow-md text-[#1D1D1F] flex items-center justify-center hover:bg-[#F5F5F7] transition-all border border-gray-100">
            <svg width="24" height="24" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeWidth="3" d="m9 5 7 7-7 7"/></svg>
          </button>
        </div>
      </div>

      <div 
        ref={scrollRef}
        className="flex gap-8 overflow-x-auto px-6 md:px-[calc((100vw-1300px)/2)] pb-12 no-scrollbar snap-x snap-mandatory items-stretch"
      >
        {items.map((item) => (
          <div
            key={item.id}
            onClick={() => setModalData(item)}
            className="flex-none w-[85vw] md:w-[420px] h-[580px] relative rounded-[3rem] overflow-hidden snap-center shadow-xl hover:shadow-2xl transition-all duration-700 cursor-pointer group border border-gray-100"
          >
            <img src={item.image} className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" alt="" />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-95" />
            <div className="absolute inset-0 p-10 flex flex-col justify-between z-10">
              <div className="self-start p-4 rounded-2xl bg-black/30 backdrop-blur-xl border border-white/20 text-[#FFD100] text-3xl shadow-2xl">
                {iconMap[item.iconKey] ?? iconMap.helmet}
              </div>
              <div className="space-y-4">
                <h3 className="text-white font-[var(--font-boruino)] text-xl md:text-2xl font-black uppercase leading-[1.1] drop-shadow-2xl">
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
      </div>

      {/* MODAL NOTICIA COMPLETA SIN DEGRADADO BLANCO */}
      {modalData && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-2xl z-[999] flex items-center justify-center p-4 animate-fadeIn" onClick={() => setModalData(null)}>
          <div className="bg-white max-w-3xl w-full max-h-[90vh] overflow-hidden rounded-[3.5rem] relative shadow-2xl animate-scaleIn" onClick={e => e.stopPropagation()}>
            <button onClick={() => setModalData(null)} className="absolute top-6 right-6 w-12 h-12 bg-white/90 backdrop-blur-md text-[#1D1D1F] rounded-full flex items-center justify-center text-3xl z-20 hover:bg-gray-100 transition-all shadow-md">×</button>
            
            <div className="overflow-y-auto max-h-[90vh] no-scrollbar">
              <div className="relative h-[350px] overflow-hidden">
                {/* Imagen limpia sin degradados superiores */}
                <img src={modalData.image} className="w-full h-full object-cover" alt={modalData.title} />
              </div>
              <div className="p-10 md:p-14 space-y-6">
                <div className="inline-block p-4 rounded-2xl bg-[#6F2C91]/10 text-[#6F2C91] text-3xl">
                  {iconMap[modalData.iconKey]}
                </div>
                <h2 className="text-3xl md:text-5xl font-black uppercase font-boruino leading-[1] text-[#1D1D1F]">
                  {modalData.title}
                </h2>
                <div className="w-24 h-1.5 bg-[#6F2C91] rounded-full" />
                <p className="text-[#424245] text-lg md:text-xl leading-relaxed whitespace-pre-line font-medium">
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