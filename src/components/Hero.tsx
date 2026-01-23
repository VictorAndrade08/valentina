"use client";
import { useState, useEffect, useRef } from "react";

// ===============================
// TIPO Y DATOS DE FALLBACK
// ===============================
type HeroSlide = {
  id: string;
  img: string;
  link?: string;
};

const fallbackSlides: HeroSlide[] = [
  { id: "1", img: "https://peachpuff-cod-624982.hostingersite.com/wp-content/uploads/2025/12/1.webp", link: "" },
  { id: "2", img: "https://peachpuff-cod-624982.hostingersite.com/wp-content/uploads/2025/12/8.webp", link: "" },
  { id: "3", img: "https://peachpuff-cod-624982.hostingersite.com/wp-content/uploads/2025/12/3.webp", link: "" },
  { id: "4", img: "https://peachpuff-cod-624982.hostingersite.com/wp-content/uploads/2025/12/7.webp", link: "" },
];

function parseCsv(text: string): string[][] {
  return text
    .trim()
    .split("\n")
    .map((row) => row.replace(/^\uFEFF/, "").split(",").map((c) => c.trim()));
}

export default function Hero() {
  const [slides, setSlides] = useState<HeroSlide[]>(fallbackSlides);
  const [index, setIndex] = useState(0);
  
  // Variables para lógica de Swipe
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const CSV_URL =
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vTYKQwKNfKrrKl6J91u7X26Yr8cQxsalFeHIjnZfxjDaHcgS5JYPn_KzHt5naz_-yFXfLidX96gr_yg/pub?gid=1530434330&single=true&output=csv";

  useEffect(() => {
    fetch(CSV_URL, { cache: "no-store" })
      .then((res) => res.text())
      .then((csv) => {
        const rows = parseCsv(csv);
        if (rows.length < 2) return;
        
        const parsed = rows
          .slice(1)
          .filter((cols) => cols[0] && cols[1])
          .map((cols) => ({ 
            id: cols[0].trim(), 
            img: cols[1].trim(),
            link: cols[2] ? cols[2].trim() : "" 
          }));
          
        if (parsed.length > 0) setSlides(parsed);
      })
      .catch(() => setSlides(fallbackSlides));
  }, []);

  // Auto-play
  useEffect(() => {
    if (!slides.length) return;
    const interval = setInterval(
      () => setIndex((prev) => (prev + 1) % slides.length),
      6000
    );
    return () => clearInterval(interval);
  }, [slides, index]);

  // Lógica de Swipe
  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      setIndex((prev) => (prev + 1) % slides.length);
    }
    if (isRightSwipe) {
      setIndex((prev) => (prev - 1 + slides.length) % slides.length);
    }
  };

  return (
    <section
      id="inicio"
      className="
        relative w-full
        /* Altura ajustada: un poco más pequeña en móvil para que se vea bien el banner cuadrado/horizontal */
        h-[50vh] min-h-[350px]
        md:h-[80vh] md:min-h-[600px]
        flex items-center justify-center
        overflow-hidden
        -mt-[80px] pt-[80px]
        bg-[#6F2C91]
      "
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* CONTENEDOR DEL SLIDER */}
      <div className="relative w-full h-full group">
        <div className="absolute inset-0">
          {slides.map((slide, i) => (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                i === index ? "opacity-100 z-10" : "opacity-0 z-0"
              }`}
            >
              <div className="w-full h-full relative flex items-center justify-center">
                {slide.link ? (
                  <a 
                    href={slide.link} 
                    target={slide.link.startsWith("http") ? "_blank" : "_self"}
                    rel={slide.link.startsWith("http") ? "noopener noreferrer" : ""}
                    className="w-full h-full flex items-center justify-center cursor-pointer"
                  >
                     {/* CORRECCIÓN AQUÍ: object-contain */}
                    <img
                      src={slide.img}
                      alt={`Slide ${i + 1}`}
                      className="
                        w-full h-full
                        /* GARANTIZA QUE SE VEA TODA LA IMAGEN SIN CORTES */
                        object-contain object-center
                        transition-transform duration-[2000ms] ease-out
                      "
                    />
                  </a>
                ) : (
                  <img
                    src={slide.img}
                    alt={`Slide ${i + 1}`}
                    className="
                      w-full h-full
                      /* GARANTIZA QUE SE VEA TODA LA IMAGEN SIN CORTES */
                      object-contain object-center
                      transition-transform duration-[2000ms] ease-out
                    "
                  />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* INDICADORES (PUNTOS) */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-4 z-20">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            aria-label={`Ir a slide ${i + 1}`}
            className={`
              rounded-full transition-all duration-300 shadow-sm border border-white/20
              ${i === index
                ? "bg-[#EAE84B] w-3 h-3 scale-110 shadow-[0_0_10px_rgba(234,232,75,0.6)]" 
                : "bg-white/40 w-2 h-2 hover:bg-white/90" 
              }
            `}
          />
        ))}
      </div>
    </section>
  );
}