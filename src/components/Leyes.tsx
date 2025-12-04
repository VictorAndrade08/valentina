"use client";

import { useState, useEffect } from "react";

type LeyData = {
  id: string;
  titleTop: string;
  title: string;
  img: string;
  desc: string;
  full: string;
};

const fallbackLeyes: LeyData[] = [
  {
    id: "01",
    titleTop: "EMPLEO JOVEN",
    title: "EMPLEO JOVEN",
    img: "https://peachpuff-cod-624982.hostingersite.com/wp-content/uploads/2025/12/PUERTO-DE-MANTA-3.jpg",
    desc: "Leyes con incentivos que abren oportunidades de empleo...",
    full:
      "Desde la Asamblea impulsamos incentivos que premian a las empresas..." +
      "\n\nEstablecimos una deducción adicional del 50%..." +
      "\n\nTambién incorporamos un 75%...",
  },
  {
    id: "02",
    titleTop: "ZONAS FRANCAS",
    title: "ZONAS FRANCAS",
    img: "https://peachpuff-cod-624982.hostingersite.com/wp-content/uploads/2025/12/ZONAS-FRANCAS-2.webp",
    desc: "Zonas Francas con nuevos incentivos para atraer inversión...",
    full:
      "Reemplazamos las ZEDE por Zonas Francas con beneficios como:\n\n" +
      "• 0% IR por 5 años\n" +
      "• Exoneración de aranceles\n" +
      "• Atracción de inversión extranjera.",
  },
  {
    id: "03",
    titleTop: "ALIVIO RIMPE",
    title: "ALIVIO RIMPE",
    img: "https://peachpuff-cod-624982.hostingersite.com/wp-content/uploads/2025/12/ALIVIO-FINANCIERO-BIESS.webp",
    desc: "Más de 186 mil emprendedores recibieron alivio...",
    full:
      "Remisión de intereses, multas y recargos del régimen RIMPE.\n\n" +
      "Más de 186 mil negocios populares regularizaron su situación.",
  },
  {
    id: "04",
    titleTop: "HIPOTECARIOS BIESS",
    title: "HIPOTECARIOS BIESS",
    img: "https://peachpuff-cod-624982.hostingersite.com/wp-content/uploads/2025/12/ALIVIO-FINANCIERO-BIESS.webp",
    desc: "Familias salvaron sus viviendas...",
    full:
      "Se creó un nuevo plan de reestructuración hipotecaria...\n\nMiles de familias conservaron su hogar.",
  },
  {
    id: "05",
    titleTop: "BANCA CERRADA",
    title: "BANCA CERRADA",
    img: "https://peachpuff-cod-624982.hostingersite.com/wp-content/uploads/2025/12/DEUDA-BANCA-CERRADA-2.webp",
    desc: "Condonación total de deudas...",
    full:
      "Condonación total del capital adeudado hasta USD 10.000.\n\n" +
      "Se eliminaron intereses acumulados por más de dos décadas.",
  },
];

// ====================================================
// PARSER CSV ROBUSTO
// ====================================================
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

// ====================================================
// COMPONENTE PRINCIPAL
// ====================================================
export default function Leyes() {
  const [leyes, setLeyes] = useState<LeyData[]>(fallbackLeyes);
  const [modalData, setModalData] = useState<LeyData | null>(null);

  // título dinámico con fallback
  const [sectionTitle, setSectionTitle] = useState("NOTICIAS LEYES");

  // 👉 control de cuántas noticias se muestran
  const [visibleCount, setVisibleCount] = useState(9);

  const handleLoadMore = () => {
    // puedes cambiar el incremento (ej. +6)
    setVisibleCount((prev) => prev + 9);
  };

  const hasMore = visibleCount < leyes.length;
  const visibleLeyes = leyes.slice(0, visibleCount);

  useEffect(() => {
    const url =
      "https://docs.google.com/spreadsheets/d/e/2PACX-1vTYKQwKNfKrrKl6J91u7X26Yr8cQxsalFeHIjnZfxjDaHcgS5JYPn_KzHt5naz_-yFXfLidX96gr_yg/pub?gid=809219241&single=true&output=csv";

    fetch(url, { cache: "no-store" })
      .then((res) => res.text())
      .then((csv) => {
        const allRows = parseCsv(csv);

        const rows = allRows.filter(
          (r) => r && r.some((cell) => cell.trim() !== "")
        );

        if (rows.length < 2) return;

        const header = rows[0];
        const dataRows = rows.slice(1);

        // índice de columna "sectionTitle"
        const sectionTitleIndex = header.findIndex(
          (col) => col.trim().toLowerCase() === "sectiontitle"
        );

        const parsed: LeyData[] = [];
        let dynamicSectionTitle = "";

        for (const cols of dataRows) {
          if (cols.length < 2) continue;

          const rawId = (cols[0] ?? "").toString().trim();
          const titleTop = (cols[1] ?? "").toString().trim();
          const title = (cols[2] ?? "").toString().trim();
          const img = (cols[3] ?? "").toString().trim();
          const desc = (cols[4] ?? "").toString().trim();
          const full = (cols[5] ?? "").toString().trim();

          if (!rawId || !title) continue;

          parsed.push({
            id: rawId.padStart(2, "0"),
            titleTop,
            title,
            img,
            desc,
            full,
          });

          if (!dynamicSectionTitle && sectionTitleIndex !== -1) {
            const candidate = (cols[sectionTitleIndex] ?? "")
              .toString()
              .trim();
            if (candidate) dynamicSectionTitle = candidate;
          }
        }

        if (parsed.length > 0) {
          setLeyes(parsed);
          // reset visibleCount por si hay menos de 9
          setVisibleCount((prev) => Math.min(9, parsed.length));
        }
        if (dynamicSectionTitle) setSectionTitle(dynamicSectionTitle);
      })
      .catch((err) => {
        console.error("Error cargando CSV de leyes:", err);
      });
  }, []);

  return (
    <>
      {/* SECCIÓN LEYES */}
      <section
        id="leyes"
        className="w-full py-24 bg-[#F5F6FA] border-t-[6px] border-[#E5E5E5]"
      >
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-[#6F2C91] font-[var(--font-boruino)] text-[clamp(2.2rem,4vw,3.4rem)] font-extrabold uppercase">
              {sectionTitle}
            </h2>
            <div className="w-[120px] h-[6px] bg-[#EAE84B] mx-auto mt-3 rounded-full" />
          </div>

          {/* GRID DE CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
            {visibleLeyes.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200 hover:shadow-xl transition-all"
              >
                <img
                  src={item.img}
                  alt={item.title}
                  className="w-full h-[210px] object-cover"
                />

                <div className="bg-[#6F2C91] px-6 py-5">
                  <h3 className="text-white text-lg font-bold uppercase text-center font-[var(--font-boruino)]">
                    {item.titleTop}
                  </h3>
                </div>

                <div className="px-6 py-6 flex flex-col">
                  <p className="text-[#6F2C91] text-xl font-extrabold uppercase font-[var(--font-boruino)] leading-tight mb-3">
                    {item.title}
                  </p>

                  <p className="text-gray-700 text-[15px] font-[var(--font-body)] leading-relaxed line-clamp-3">
                    {item.desc}
                  </p>

                  <button
                    onClick={() => setModalData(item)}
                    className="mt-5 w-fit border border-[#6F2C91] text-[#6F2C91] font-[var(--font-boruino)] text-sm font-bold uppercase px-4 py-2 rounded-md hover:bg-[#6F2C91] hover:text-white transition-all"
                  >
                    Ver más +
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* BOTÓN CARGAR MÁS NOTICIAS */}
          {hasMore && (
            <div className="mt-12 flex justify-center">
              <button
                onClick={handleLoadMore}
                className="px-6 py-3 rounded-full border-2 border-[#6F2C91] text-[#6F2C91] font-[var(--font-boruino)] text-sm sm:text-base font-bold uppercase tracking-wide hover:bg-[#6F2C91] hover:text-white transition-all shadow-sm hover:shadow-md"
              >
                Cargar más noticias
              </button>
            </div>
          )}
        </div>
      </section>

      {/* MODAL */}
      {modalData && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[999] animate-fadeIn px-4"
          onClick={() => setModalData(null)}
        >
          <div
            className="bg-white max-w-[650px] w-full p-6 sm:p-8 rounded-2xl relative animate-scaleIn shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* X mejorada */}
            <button
              onClick={() => setModalData(null)}
              aria-label="Cerrar"
              className="absolute top-4 right-4 flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white/90 text-gray-700 shadow-md hover:bg-[#6F2C91] hover:text-white focus:outline-none focus:ring-2 focus:ring-[#6F2C91] focus:ring-offset-2 transition-all"
            >
              <span className="text-2xl sm:text-3xl leading-none">×</span>
            </button>

            <img
              src={modalData.img}
              className="w-full h-[200px] sm:h-[230px] object-cover rounded-xl mb-6"
              alt={modalData.title}
            />

            <h2 className="text-[#6F2C91] text-3xl sm:text-4xl font-extrabold uppercase text-center font-[var(--font-boruino)] mb-4">
              {modalData.title}
            </h2>

            <p className="text-gray-700 text-[15px] sm:text-[17px] font-[var(--font-body)] whitespace-pre-line leading-relaxed">
              {modalData.full}
            </p>
          </div>
        </div>
      )}

      <style jsx>{`
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out forwards;
        }
        .animate-scaleIn {
          animation: scaleIn 0.25s ease-out forwards;
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </>
  );
}
