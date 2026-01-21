"use client";
import { useState, useEffect } from "react";

// ===============================
// TIPO Y DATOS DE FALLBACK
// ===============================
type HeroSlide = {
  id: string;
  img: string;
  link?: string; // Nuevo campo opcional para el enlace
};

const fallbackSlides: HeroSlide[] = [
  { id: "1", img: "https://peachpuff-cod-624982.hostingersite.com/wp-content/uploads/2025/12/1.webp", link: "" },
  { id: "2", img: "https://peachpuff-cod-624982.hostingersite.com/wp-content/uploads/2025/12/8.webp", link: "" },
  { id: "3", img: "https://peachpuff-cod-624982.hostingersite.com/wp-content/uploads/2025/12/3.webp", link: "" },
  { id: "4", img: "https://peachpuff-cod-624982.hostingersite.com/wp-content/uploads/2025/12/7.webp", link: "" },
];

// ===============================
// PARSER CSV SIMPLE
// ===============================
function parseCsv(text: string): string[][] {
  return text
    .trim()
    .split("\n")
    .map((row) => row.replace(/^\uFEFF/, "").split(",").map((c) => c.trim()));
}

// ===============================
// COMPONENTE PRINCIPAL
// ===============================
export default function Hero() {
  const [slides, setSlides] = useState<HeroSlide[]>(fallbackSlides);
  const [index, setIndex] = useState(0);

  const CSV_URL =
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vTYKQwKNfKrrKl6J91u7X26Yr8cQxsalFeHIjnZfxjDaHcgS5JYPn_KzHt5naz_-yFXfLidX96gr_yg/pub?gid=1530434330&single=true&output=csv";

  useEffect(() => {
    fetch(CSV_URL, { cache: "no-store" })
      .then((res) => res.text())
      .then((csv) => {
        const rows = parseCsv(csv);
        if (rows.length < 2) return;
        
        // Ahora leemos 3 columnas: ID, IMG, LINK
        const parsed = rows
          .slice(1)
          .filter((cols) => cols[0] && cols[1])
          .map((cols) => ({ 
            id: cols[0].trim(), 
            img: cols[1].trim(),
            link: cols[2] ? cols[2].trim() : "" // Leemos la 3ra columna como link
          }));
          
        if (parsed.length > 0) setSlides(parsed);
      })
      .catch(() => setSlides(fallbackSlides));
  }, []);

  useEffect(() => {
    if (!slides.length) return;
    const interval = setInterval(
      () => setIndex((prev) => (prev + 1) % slides.length),
      6000
    );
    return () => clearInterval(interval);
  }, [slides]);

  return (
    <section
      id="inicio"
      className="
        relative w-full
        h-[70vh] min-h-[420px] max-h-[780px]
        sm:h-[75vh]
        flex items-center justify-center
        overflow-hidden
        -mt-[80px] pt-[80px]
        bg-[#6F2C91]
      "
    >
      {/* CONTENEDOR DEL SLIDER */}
      <div className="relative w-full h-full">
        <div className="absolute inset-0">
          {slides.map((slide, i) => (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                i === index ? "opacity-100 z-10" : "opacity-0 z-0"
              }`}
            >
              <div className="w-full h-full flex items-center justify-center bg-[#6F2C91]">
                {/* Lógica condicional: Si hay link, usamos <a>, si no, solo <img> */}
                {slide.link ? (
                  <a 
                    href={slide.link} 
                    target={slide.link.startsWith("http") ? "_blank" : "_self"}
                    rel={slide.link.startsWith("http") ? "noopener noreferrer" : ""}
                    className="w-full h-full flex items-center justify-center cursor-pointer"
                  >
                    <img
                      src={slide.img}
                      alt={`Slide ${i + 1}`}
                      className="
                        object-contain
                        w-auto h-auto max-w-full max-h-full
                        md:w-full md:h-full md:scale-[1.15] md:max-w-none md:max-h-none
                        transition-transform duration-[1500ms] ease-out
                      "
                    />
                  </a>
                ) : (
                  <img
                    src={slide.img}
                    alt={`Slide ${i + 1}`}
                    className="
                      object-contain
                      w-auto h-auto max-w-full max-h-full
                      md:w-full md:h-full md:scale-[1.15] md:max-w-none md:max-h-none
                      transition-transform duration-[1500ms] ease-out
                    "
                  />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* INDICADORES */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3 z-20">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            className={`w-3 h-3 rounded-full transition-all ${
              i === index
                ? "bg-[#EAE84B] scale-110"
                : "bg-white/60 hover:bg-white/90"
            }`}
          />
        ))}
      </div>
    </section>
  );
}