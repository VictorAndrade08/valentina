"use client";

import { useState, useEffect } from "react";
import { Oswald } from "next/font/google";

const oswald = Oswald({
  subsets: ["latin"],
  weight: ["700"],
});

type AgendaData = {
  id: string;
  title: string;
  tag: string;
  subtitle: string;
  description: string;
  bullets: string[];
  quote: string;
  image: string;
};

// DATOS POR DEFECTO
const fallback: AgendaData = {
  id: "1",
  title: "AGENDA INTERNACIONAL",
  tag: "Presidenta de Comisión",
  subtitle: "Comisión Permanente de Asuntos de las Naciones Unidas (UIP)",
  description:
    "Los parlamentos del mundo, a través de la Unión Interparlamentaria (UIP), me eligieron Presidenta de la Cuarta Comisión Permanente de Asuntos de las Naciones Unidas. Trabajo para que nuestro país tenga una voz activa en los debates internacionales.",
  bullets: [
    "Dirijo las sesiones oficiales ante los parlamentos miembros.",
    "Coordino la relación parlamentaria con Naciones Unidas.",
    "Conduzco la elaboración de resoluciones internacionales.",
    "Represento al Ecuador en reuniones multilaterales.",
    "Impulso acuerdos y buenas prácticas legislativas.",
  ],
  quote:
    '"Con este liderazgo, llevo al Ecuador a los espacios donde se toman decisiones que impactan al mundo."',
  image:
    "https://peachpuff-cod-624982.hostingersite.com/wp-content/uploads/2025/12/ONU-UIP-1.webp",
};

const CSV_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vTYKQwKNfKrrKl6J91u7X26Yr8cQxsalFeHIjnZfxjDaHcgS5JYPn_KzHt5naz_-yFXfLidX96gr_yg/pub?gid=2020873782&single=true&output=csv";

// PARSER CSV
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
        if (cur !== "" || row.length > 0) { row.push(cur); rows.push(row); }
        row = []; cur = "";
        if (char === "\r" && i + 1 < text.length && text[i + 1] === "\n") i += 2;
        else i++;
      } else { cur += char; i++; }
    }
  }
  if (cur !== "" || row.length > 0) { row.push(cur); rows.push(row); }
  return rows;
}

export default function AgendaInternacional() {
  const [data, setData] = useState<AgendaData>(fallback);

  useEffect(() => {
    fetch(CSV_URL, { cache: "no-store" })
      .then((res) => res.text())
      .then((csv) => {
        const rows = parseCsv(csv);
        if (rows.length < 2) return;
        const [id, title, tag, subtitle, description, bulletsString, quote, image] = rows[1];
        const bullets = bulletsString ? bulletsString.split(";").map((b) => b.trim()) : fallback.bullets;
        setData({
          id: id || fallback.id,
          title: title || fallback.title,
          tag: tag || fallback.tag,
          subtitle: subtitle || fallback.subtitle,
          description: description || fallback.description,
          bullets,
          quote: quote || fallback.quote,
          image: image || fallback.image,
        });
      })
      .catch((err) => console.error("AGENDA CSV ERROR:", err));
  }, []);

  return (
    // 'overflow-hidden' en la section evita el scroll horizontal indeseado en móviles
    <section id="agenda-internacional" className="py-16 md:py-24 bg-[#FBFBFD] overflow-hidden relative">
      <div className="max-w-[1400px] mx-auto px-6">
        
        {/* HEADER */}
        <div className="mb-12 md:mb-20 text-center md:text-left">
          <h2 className={`${oswald.className} text-[clamp(2.5rem,6vw,4.5rem)] font-black text-[#1D1D1F] uppercase leading-[0.9]`}>
            {data.title.split(" ").slice(0, 1)} <br className="hidden md:block" />
            <span className="text-[#6F2C91]">{data.title.split(" ").slice(1).join(" ")}</span>
          </h2>
          <div className="w-20 h-2 bg-[#EAE84B] rounded-full mt-6 mx-auto md:mx-0" />
        </div>

        {/* GRID LAYOUT: En móvil flex columna inversa (imagen arriba opcional, aqui contenido primero) */}
        <div className="flex flex-col lg:grid lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          
          {/* COLUMNA IZQUIERDA: TEXTO */}
          <div className="w-full lg:col-span-7 space-y-8 order-2 lg:order-1">
            
            {/* Tag */}
            <div className="flex justify-start">
              <span className="bg-[#EAE84B] text-[#6F2C91] font-bold text-[10px] md:text-xs tracking-[0.15em] px-4 py-1.5 rounded-full uppercase shadow-sm">
                {data.tag}
              </span>
            </div>

            {/* Subtitulo */}
            <h3 className={`${oswald.className} text-[#6F2C91] text-2xl md:text-4xl font-black uppercase leading-tight`}>
              {data.subtitle}
            </h3>

            {/* Descripción */}
            <p className="text-[#424245] text-base md:text-xl leading-relaxed font-medium whitespace-pre-line border-l-[3px] md:border-l-4 border-[#6F2C91]/20 pl-4 md:pl-6">
              {data.description}
            </p>

            {/* Caja Blanca (Bullets) */}
            <div className="bg-white p-6 md:p-8 rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-gray-100">
              <h4 className={`${oswald.className} text-[#6F2C91] text-lg font-bold uppercase mb-6 flex items-center gap-3`}>
                <span className="w-6 md:w-8 h-0.5 bg-[#6F2C91]/30"></span>
                ACCIONES ESTRATÉGICAS
              </h4>

              <ul className="space-y-4">
                {data.bullets.map((texto, i) => (
                  <li key={i} className="flex gap-3 md:gap-4 items-start group">
                    <span className="flex-none w-5 h-5 md:w-6 md:h-6 rounded-full bg-[#6F2C91]/10 text-[#6F2C91] flex items-center justify-center text-[10px] md:text-xs font-bold mt-0.5 group-hover:bg-[#EAE84B] transition-colors">
                      ✓
                    </span>
                    <p className="text-gray-600 text-sm md:text-lg leading-snug font-medium">
                      {texto}
                    </p>
                  </li>
                ))}
              </ul>
            </div>

            {/* Caja Morada (Quote) */}
            <div className="bg-[#6F2C91] p-6 md:p-8 rounded-[2rem] shadow-xl relative overflow-hidden group">
                <p className="text-white text-lg md:text-2xl italic font-medium relative z-10 leading-relaxed">
                  {data.quote}
                </p>
                {/* Comilla Decorativa */}
                <span className="absolute -bottom-8 -right-2 text-[8rem] md:text-[12rem] text-white/10 font-serif z-0 leading-none select-none pointer-events-none group-hover:scale-110 transition-transform duration-500">
                  ”
                </span>
            </div>
          </div>

          {/* COLUMNA DERECHA: IMAGEN */}
          <div className="w-full lg:col-span-5 relative order-1 lg:order-2 mb-8 lg:mb-0">
            {/* Elemento decorativo ajustado para no romper el responsive */}
            <div className="absolute top-2 -right-2 md:-top-4 md:-right-4 w-full h-full bg-[#EAE84B] rounded-[2.5rem] md:rounded-[3rem] -z-10 opacity-30 rotate-2 md:rotate-3 scale-[0.95] md:scale-100" />
            
            <div className="w-full aspect-[4/5] lg:h-[650px] rounded-[2rem] md:rounded-[3rem] shadow-2xl overflow-hidden border-[6px] md:border-[12px] border-white relative">
              <img
                src={data.image}
                alt={data.title}
                className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                loading="lazy"
              />
              {/* Degradado sutil para dar volumen */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}