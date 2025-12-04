"use client";

import { useState, useEffect, type ReactNode } from "react";
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
};

const fallbackBlogros: BlogroData[] = [
  {
    id: "01",
    iconKey: "helmet",
    title:
      "Salvamos los recursos de la reconstrucción y reactivamos las obras que Manabí esperaba",
    body:
      "Tras un proceso firme de fiscalización, rescatamos los recursos de la reconstrucción y reactivamos un Comité que encontramos en abandono: sin gerente, sin informes y sin control.\n" +
      "Gracias a este trabajo, volvieron a avanzar obras como:\n" +
      "• Puente Quimís\n" +
      "• Puente Lodana\n" +
      "• Mercado de Calceta\n" +
      "• Plantas desaladoras para Manta\n" +
      "• Plaza memorial San Gregorio\n" +
      "• Sistema de agua potable para Chone\n\n" +
      "Protegimos los fondos y aseguramos que la reconstrucción avance donde más se necesita.",
  },
  {
    id: "02",
    iconKey: "ship",
    title: "Los recursos del Puerto de Manta se quedan en Manta",
    body:
      "Impulsamos una reforma para que el canon del Puerto de Manta deje de ir al Presupuesto General del Estado y se quede directamente en el Municipio y la Prefectura.\n\n" +
      "Esto garantiza que USD 1.859.830 se inviertan en obras e infraestructura para los mantenses.",
  },
  {
    id: "03",
    iconKey: "water",
    title:
      "Portoviejo y Montecristi ya tienen luz verde para proyectos de agua potable",
    body:
      "Tras articulación con el MEF, los municipios y la CAF, destrabamos dos avales históricos:\n" +
      "• USD 50 millones para Portoviejo\n" +
      "• USD 28 millones para Montecristi\n\n" +
      "Estos proyectos garantizan agua segura y digna para miles de familias.",
  },
  {
    id: "04",
    iconKey: "fire",
    title: "Más GLP para los taxistas y una nueva estación en Portoviejo",
    body:
      "Impulsamos la ampliación del cupo de GLP para todo el país, permitiendo que Portoviejo abra nuevas estaciones de servicio.\n\n" +
      "Este incremento garantiza disponibilidad del GLP y un ahorro de alrededor de USD 20 diarios para miles de familias y transportistas.",
  },
  {
    id: "05",
    iconKey: "heart",
    title: "Tres nuevos centros de salud para la ruralidad",
    body:
      "Acompañamos la contratación de nuevos subcentros del Seguro Social Campesino.\n\n" +
      "Hoy:\n" +
      "• El centro de salud de Danzarín está concluido\n" +
      "• Higuerón y Playa Prieta tienen un 90% de avance\n\n" +
      "Estas obras, junto al mantenimiento de unidades médicas, superan el millón de dólares en inversión.",
  },
];

// URL DE LA HOJA BLOGROS (CSV)
const BLOGROS_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vTYKQwKNfKrrKl6J91u7X26Yr8cQxsalFeHIjnZfxjDaHcgS5JYPn_KzHt5naz_-yFXfLidX96gr_yg/pub?gid=57984147&single=true&output=csv";

// ================================
// PARSER CSV (MISMO QUE EN LEYES)
// ================================
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
        row.push(cur);
        rows.push(row);
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

  row.push(cur);
  rows.push(row);
  return rows;
}

// ================================
// MAPA DE ICONOS
// ================================
const iconMap: Record<string, ReactNode> = {
  helmet: <FaHelmetSafety />,
  ship: <FaShip />,
  water: <FaFaucetDrip />,
  fire: <FaFireFlameSimple />,
  heart: <FaHeartPulse />,
};

// ================================
// COMPONENTE PRINCIPAL
// ================================
export default function LogrosManabi() {
  const [items, setItems] = useState<BlogroData[]>(fallbackBlogros);
  const [sectionTitle, setSectionTitle] = useState("LOGROS MANABÍ");

  useEffect(() => {
    fetch(BLOGROS_URL, { cache: "no-store" })
      .then((res) => res.text())
      .then((csv) => {
        const allRows = parseCsv(csv);

        const rows = allRows.filter(
          (r) => r && r.some((cell) => cell.trim() !== "")
        );

        if (rows.length < 2) return;

        const dataRows = rows.slice(1); // salto encabezados

        const parsed: BlogroData[] = [];
        let foundSectionTitle = "";

        for (const cols of dataRows) {
          if (cols.length < 2) continue;

          const rawId = (cols[0] ?? "").toString().trim();
          const iconKey = (cols[1] ?? "").toString().trim().toLowerCase();
          const title = (cols[2] ?? "").toString().trim();
          const body = (cols[3] ?? "").toString().trim();
          const sectionTitleCol = (cols[4] ?? "").toString().trim();

          if (!foundSectionTitle && sectionTitleCol) {
            foundSectionTitle = sectionTitleCol;
          }

          if (!rawId || !title) continue;

          parsed.push({
            id: rawId.padStart(2, "0"),
            iconKey,
            title,
            body,
          });
        }

        if (parsed.length > 0) {
          setItems(parsed);
        }
        if (foundSectionTitle) {
          setSectionTitle(foundSectionTitle);
        }
      })
      .catch((err) => {
        console.error("Error cargando CSV de BLOGROS:", err);
      });
  }, []);

  return (
    <section id="logros-manabi" className="w-full py-24 bg-white">
      <div className="max-w-[1400px] mx-auto px-6">
        {/* TÍTULO */}
        <div className="text-center mb-20">
          <h2 className="text-[#6F2C91] font-[var(--font-boruino)] text-[clamp(2.2rem,4vw,3.4rem)] font-extrabold uppercase tracking-tight">
            {sectionTitle}
          </h2>
          <div className="w-[120px] h-[6px] bg-[#EAE84B] mx-auto mt-4 rounded-full" />
        </div>

        {/* LISTA */}
        <div className="max-w-[1000px] mx-auto space-y-16">
          {items.map((item) => (
            <div key={item.id} className="flex items-start gap-6">
              <div className="text-[#6F2C91] text-4xl bg-[#F5F0FA] p-4 rounded-xl shadow-md">
                {iconMap[item.iconKey] ?? iconMap.helmet}
              </div>
              <div>
                <h3 className="font-[var(--font-boruino)] text-2xl font-extrabold text-[#6F2C91] leading-tight mb-3">
                  {item.title}
                </h3>
                <p className="font-[var(--font-body)] text-gray-700 leading-relaxed whitespace-pre-line">
                  {item.body}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
