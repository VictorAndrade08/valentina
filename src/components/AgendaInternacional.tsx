"use client";

import { useState, useEffect } from "react";
import { Oswald } from "next/font/google"; // Para mantener consistencia tipográfica

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

const fallback: AgendaData = {
  id: "1",
  title: "AGENDA INTERNACIONAL",
  tag: "Presidenta de Comisión",
  subtitle: "Comisión Permanente de Asuntos de las Naciones Unidas (UIP)",
  description:
    "Los parlamentos del mundo, a través de la Unión Interparlamentaria (UIP), me eligieron Presidenta de la Cuarta Comisión Permanente de Asuntos de las Naciones Unidas, un espacio estratégico para fortalecer la presencia del Ecuador en la agenda global. Desde esta responsabilidad trabajo para que nuestro país tenga una voz activa en los debates internacionales sobre desarrollo sostenible, derechos humanos, cooperación e igualdad.",
  bullets: [
    "Dirijo las sesiones oficiales ante los parlamentos miembros de la UIP.",
    "Coordino la relación parlamentaria con el sistema de Naciones Unidas.",
    "Conduzco la elaboración de resoluciones y posiciones internacionales.",
    "Represento al Ecuador en reuniones multilaterales y espacios de alto nivel.",
    "Impulso acuerdos, diálogos y buenas prácticas legislativas entre países.",
  ],
  quote:
    '"Con este liderazgo, llevo al Ecuador a los espacios donde se toman decisiones que impactan al mundo y al futuro de nuestra gente."',
  image:
    "https://peachpuff-cod-624982.hostingersite.com/wp-content/uploads/2025/12/ONU-UIP-1.webp",
};

const CSV_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vTYKQwKNfKrrKl6J91u7X26Yr8cQxsalFeHIjnZfxjDaHcgS5JYPn_KzHt5naz_-yFXfLidX96gr_yg/pub?gid=2020873782&single=true&output=csv";

function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let cur = "";
  let row: string[] = [];
  let inQuotes = false;
  let i = 0;
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
    <section id="agenda-internacional" className="py-24 bg-[#FBFBFD] overflow-hidden">
      <div className="max-w-[1400px] mx-auto px-6">
        
        {/* TÍTULO MEJORADO */}
        <div className="mb-16 md:mb-20">
          <h2 className={`${oswald.className} text-[clamp(2.5rem,5vw,4.5rem)] font-black text-[#1D1D1F] uppercase leading-[0.85]`}>
            {data.title.split(" ").slice(0, 1)} <br />
            <span className="text-[#6F2C91]">{data.title.split(" ").slice(1).join(" ")}</span>
          </h2>
          <div className="w-20 h-2 bg-[#EAE84B] rounded-full mt-6" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          
          {/* COLUMNA IZQUIERDA: INFORMACIÓN */}
          <div className="lg:col-span-7 space-y-8">
            <div className="inline-block bg-[#EAE84B] text-[#6F2C91] font-bold text-xs tracking-widest px-5 py-2 rounded-full uppercase shadow-sm">
              {data.tag}
            </div>

            <h3 className={`${oswald.className} text-[#6F2C91] text-3xl md:text-4xl font-black uppercase leading-tight`}>
              {data.subtitle}
            </h3>

            <p className="text-[#424245] text-lg md:text-xl leading-relaxed font-medium whitespace-pre-line border-l-4 border-[#6F2C91]/20 pl-6">
              {data.description}
            </p>

            <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-gray-50">
              <h4 className={`${oswald.className} text-[#6F2C91] text-lg font-bold uppercase mb-6 flex items-center gap-2`}>
                <span className="w-8 h-px bg-[#6F2C91]/30"></span>
                ACCIONES ESTRATÉGICAS
              </h4>

              <ul className="grid grid-cols-1 md:grid-cols-1 gap-4">
                {data.bullets.map((texto, i) => (
                  <li key={i} className="flex gap-4 items-start group">
                    <span className="flex-none w-6 h-6 rounded-full bg-[#6F2C91]/10 text-[#6F2C91] flex items-center justify-center text-xs font-bold transition-colors group-hover:bg-[#EAE84B]">
                      ✓
                    </span>
                    <p className="text-gray-700 text-base md:text-lg leading-snug font-medium">
                      {texto}
                    </p>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-[#6F2C91] p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
                <p className="text-white text-xl md:text-2xl italic font-medium relative z-10 leading-relaxed">
                  {data.quote}
                </p>
                {/* Comilla gigante decorativa */}
                <span className="absolute -bottom-10 -right-4 text-[12rem] text-white/10 font-serif z-0 leading-none">”</span>
            </div>
          </div>

          {/* COLUMNA DERECHA: IMAGEN IMPACTO */}
          <div className="lg:col-span-5 relative">
            {/* Elemento decorativo detrás de la imagen */}
            <div className="absolute -top-6 -right-6 w-full h-full bg-[#EAE84B] rounded-[3rem] -z-10 opacity-20 rotate-3" />
            
            <div className="w-full aspect-[4/5] md:h-[650px] rounded-[3rem] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] overflow-hidden border-[12px] border-white transition-transform duration-700 hover:scale-[1.02]">
              <img
                src={data.image}
                alt="Valentina Centeno en Agenda Internacional"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}