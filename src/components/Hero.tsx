"use client";
import { useState, useEffect } from "react";
import { getSupabase } from "@/lib/supabaseClient";

type HeroSlide = {
  id: string;
  img: string | null;
  link?: string;
};

// Banners actuales (fallback de seguridad si Supabase está vacío o falla).
// Coinciden con el contenido que estaba en producción vía Google Sheet.
const fallbackSlides: HeroSlide[] = [
  {
    id: "fb-1",
    img: "/imagenes/hero-1.webp",
    link: "#buzon",
  },
  {
    id: "fb-2",
    img: "/imagenes/hero-2.webp",
    link: "#buzon",
  },
  {
    id: "fb-3",
    img: "/imagenes/hero-3.webp",
    link: "#buzon",
  },
  {
    id: "fb-4",
    img: "/imagenes/hero-4.webp",
    link: "#ley",
  },
  {
    id: "fb-5",
    img: "/imagenes/hero-banner-ai.webp",
    link: "concurso",
  },
];

export default function Hero() {
  const [slides, setSlides] = useState<HeroSlide[]>(fallbackSlides);
  const [index, setIndex] = useState(0);

  // Variables para lógica de Swipe
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  useEffect(() => {
    // Lee banners desde Supabase. Si falla o está vacío,
    // se conserva el fallback definido arriba — la web no se rompe nunca.
    const cargarDesdeSupabase = async () => {
      try {
        const supabase = getSupabase();
        const { data, error } = await supabase
          .from("cms_hero")
          .select("id, img, link, orden, activo")
          .eq("activo", true)
          .order("orden", { ascending: true });

        if (error || !data || data.length === 0) return;

        const parsed: HeroSlide[] = data
          .filter((row) => row.img && String(row.img).trim() !== "")
          .map((row) => ({
            id: String(row.id),
            img: String(row.img).trim(),
            link: row.link ? String(row.link).trim() : "",
          }));

        if (parsed.length > 0) setSlides(parsed);
      } catch {
        // Silencio intencional: mantiene fallbackSlides
      }
    };
    cargarDesdeSupabase();
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
                    rel={
                      slide.link.startsWith("http") ? "noopener noreferrer" : ""
                    }
                    className="w-full h-full flex items-center justify-center cursor-pointer"
                  >
                    {slide.img && (
                      <img
                        src={slide.img}
                        alt={`Slide ${i + 1}`}
                        className="
                          w-full h-full
                          object-contain object-center
                          transition-transform duration-[2000ms] ease-out
                        "
                      />
                    )}
                  </a>
                ) : (
                  slide.img && (
                    <img
                      src={slide.img}
                      alt={`Slide ${i + 1}`}
                      className="
                        w-full h-full
                        object-contain object-center
                        transition-transform duration-[2000ms] ease-out
                      "
                    />
                  )
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
              ${
                i === index
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
