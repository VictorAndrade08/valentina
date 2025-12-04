"use client";

import { useState, useEffect } from "react";

// =========================================
// TIPOS
// =========================================
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

// =========================================
// FALLBACK (Muy importante)
// =========================================
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

// =========================================
// URL DEL CSV  (ya con el gid correcto)
// =========================================
const CSV_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vTYKQwKNfKrrKl6J91u7X26Yr8cQxsalFeHIjnZfxjDaHcgS5JYPn_KzHt5naz_-yFXfLidX96gr_yg/pub?gid=2020873782&single=true&output=csv";

// =========================================
// PARSER CSV ROBUSTO (acepta comas y comillas)
// =========================================
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
        if (i + 1 < text.length && text[i + 1] === '"') {
          // comilla escapada ""
          cur += '"';
          i += 2;
        } else {
          inQuotes = false;
          i++;
        }
      } else {
        cur += char;
        i++;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
        i++;
      } else if (char === ",") {
        row.push(cur);
        cur = "";
        i++;
      } else if (char === "\r" || char === "\n") {
        if (cur !== "" || row.length > 0) {
          row.push(cur);
          rows.push(row);
        }
        row = [];
        cur = "";
        if (char === "\r" && i + 1 < text.length && text[i + 1] === "\n") i += 2;
        else i++;
      } else {
        cur += char;
        i++;
      }
    }
  }

  if (cur !== "" || row.length > 0) {
    row.push(cur);
    rows.push(row);
  }

  return rows;
}

// =========================================
// COMPONENTE PRINCIPAL
// =========================================
export default function AgendaInternacional() {
  const [data, setData] = useState<AgendaData>(fallback);

  useEffect(() => {
    fetch(CSV_URL, { cache: "no-store" })
      .then((res) => res.text())
      .then((csv) => {
        const rows = parseCsv(csv);

        if (rows.length < 2) return;

        const [
          id,
          title,
          tag,
          subtitle,
          description,
          bulletsString,
          quote,
          image,
        ] = rows[1];

        const bullets = bulletsString
          ? bulletsString.split(";").map((b) => b.trim())
          : fallback.bullets;

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
    <section id="agenda-internacional" className="py-20 bg-white">
      <div className="max-w-[1400px] mx-auto px-6">
        {/* ===== TÍTULO ===== */}
        <div className="text-center mb-12">
          <h2 className="font-boruino text-[clamp(2rem,4vw,3rem)]
                         font-extrabold text-[#6F2C91] uppercase">
            {data.title}
          </h2>
          <div className="w-[80px] h-[6px] bg-[#EAE84B] mx-auto mt-2 rounded-md" />
        </div>

        {/* ===== GRID ===== */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* ===== COLUMNA IZQUIERDA ===== */}
          <div>
            <span className="inline-block bg-[#EAE84B] text-[#6F2C91] font-boruino
                             text-sm font-bold px-4 py-1 rounded-sm uppercase mb-4">
              {data.tag}
            </span>

            <h3 className="text-[#6F2C91] font-boruino text-[1.8rem] font-extrabold
                           leading-tight uppercase mb-5">
              {data.subtitle}
            </h3>

            <p className="font-body text-gray-800 text-[17px] leading-relaxed mb-6 whitespace-pre-line">
              {data.description}
            </p>

            <h4 className="font-boruino text-[#6F2C91] text-lg font-bold uppercase mb-3">
              ¿Qué hago desde esta comisión?
            </h4>

            <ul className="space-y-3">
              {data.bullets.map((texto, i) => (
                <li key={i} className="flex gap-3">
                  <span className="text-[#2BB673] text-xl font-bold">✔</span>
                  <p className="font-body text-gray-700 text-[17px] leading-snug">
                    {texto}
                  </p>
                </li>
              ))}
            </ul>

            <p className="font-body text-[#6F2C91] text-[16px] font-semibold mt-6 whitespace-pre-line">
              {data.quote}
            </p>
          </div>

          {/* ===== COLUMNA DERECHA ===== */}
          <div className="flex justify-center">
            <div className="w-full max-w-[450px] h-[500px] rounded-2xl shadow-2xl overflow-hidden">
              <img
                src={data.image}
                alt="Agenda Internacional"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
