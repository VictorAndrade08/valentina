"use client";

import { useState, useEffect } from "react";

// ============================
// TIPOS
// ============================
type IniciativaData = {
  id: string;
  sectionTitle: string;
  description: string;
};

// ============================
// FALLBACK
// ============================
const fallback: IniciativaData = {
  id: "01",
  sectionTitle: "INICIATIVAS LEGISLATIVAS",
  description:
    "Seguimos trabajando en nuevos proyectos de ley enfocados en la seguridad, la educación y el desarrollo productivo. Pronto encontrarás aquí el detalle de nuestras iniciativas en curso.",
};

// ============================
// URL DEL CSV  (GID CORRECTO)
// ============================
// ⚠️ USA TU GID CORRECTO (ya cambié al que mostraste)
const CSV_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vTYKQwKNfKrrKl6J91u7X26Yr8cQxsalFeHIjnZfxjDaHcgS5JYPn_KzHt5naz_-yFXfLidX96gr_yg/pub?gid=604408329&single=true&output=csv";

// ============================
// PARSER CSV ROBUSTO (igual que LEYES)
// Quita comillas, respeta comas internas, respeta saltos
// ============================
function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let cur = "";
  let row: string[] = [];
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];

    if (inQuotes) {
      if (char === '"') {
        if (text[i + 1] === '"') {
          cur += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        cur += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ",") {
        row.push(cur);
        cur = "";
      } else if (char === "\n" || char === "\r") {
        if (cur || row.length) row.push(cur);
        if (row.length) rows.push(row);
        row = [];
        cur = "";
      } else {
        cur += char;
      }
    }
  }

  if (cur || row.length) row.push(cur);
  if (row.length) rows.push(row);

  return rows;
}

// ============================
// COMPONENTE PRINCIPAL
// ============================
export default function IniciativasLegislativas() {
  const [title, setTitle] = useState(fallback.sectionTitle);
  const [desc, setDesc] = useState(fallback.description);

  useEffect(() => {
    fetch(CSV_URL, { cache: "no-store" })
      .then((res) => res.text())
      .then((csv) => {
        const rows = parseCsv(csv);

        if (rows.length < 2) return;

        const [, sectionTitle, description] = rows[1];

        if (sectionTitle?.trim()) setTitle(sectionTitle.trim());
        if (description?.trim()) setDesc(description.trim());
      })
      .catch((err) => console.error("INICIATIVAS CSV ERROR:", err));
  }, []);

  return (
    <section id="iniciativas" className="w-full py-24 bg-[#F5F6FA]">
      <div className="max-w-[1000px] mx-auto px-6 text-center">
        {/* TÍTULO */}
        <h2 className="text-[#6F2C91] font-[var(--font-boruino)] text-[clamp(2rem,4vw,3rem)] font-extrabold uppercase">
          {title}
        </h2>

        {/* SUBRAYADO */}
        <div className="w-[80px] h-[6px] bg-[#EAE84B] mx-auto mt-3 rounded-full" />

        {/* DESCRIPCIÓN */}
        <p className="max-w-[650px] mx-auto mt-6 text-gray-700 font-[var(--font-body)] text-[1.05rem] leading-relaxed whitespace-pre-line">
          {desc}
        </p>
      </div>
    </section>
  );
}
