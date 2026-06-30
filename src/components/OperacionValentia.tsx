"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Oswald } from "next/font/google";
import { getSupabase } from "@/lib/supabaseClient";

const oswald = Oswald({ subsets: ["latin"], weight: ["700"] });

type Cms = Record<string, string>;

const FALLBACK: Cms = {
  activo: "true",
  tag: "Iniciativa ciudadana",
  titulo: "OPERACIÓN VALENTÍA",
  subtitulo:
    "Una campaña por la transparencia, la juventud y la dignidad de Manabí",
  descripcion:
    "Operación Valentía es la línea estratégica que articula los esfuerzos legislativos de Valentina Centeno con las necesidades reales de la ciudadanía.",
  imagen: "/imagenes/operacion-valentia.svg",
  eje_1_titulo: "Educación digna",
  eje_1_desc:
    "Becas, infraestructura y formación técnica para jóvenes de Manabí.",
  eje_2_titulo: "Salud sin abandono",
  eje_2_desc:
    "Acceso a hospitales, medicamentos y atención primaria garantizada.",
  eje_3_titulo: "Voz ciudadana",
  eje_3_desc:
    "Casos del buzón ciudadano convertidos en gestión política real.",
  cta_texto: "Conocer más",
  cta_link: "/operacion-valentia",
};

export default function OperacionValentia() {
  const [cms, setCms] = useState<Cms>(FALLBACK);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const cargar = async () => {
      try {
        const supabase = getSupabase();
        const { data, error } = await supabase
          .from("cms_operacion_valentia")
          .select("clave, valor");
        if (error || !data || data.length === 0) {
          setLoaded(true);
          return;
        }
        const map: Cms = {};
        data.forEach((r) => {
          if (r.clave) map[r.clave.toLowerCase()] = r.valor || "";
        });
        setCms({ ...FALLBACK, ...map });
      } catch {
        // mantiene fallback
      } finally {
        setLoaded(true);
      }
    };
    cargar();
  }, []);

  // Si admin lo desactiva → no se muestra
  if (!loaded) return null;
  if ((cms.activo || "true").toLowerCase() === "false") return null;

  const ejes: { titulo: string; desc: string }[] = [
    { titulo: cms.eje_1_titulo || "", desc: cms.eje_1_desc || "" },
    { titulo: cms.eje_2_titulo || "", desc: cms.eje_2_desc || "" },
    { titulo: cms.eje_3_titulo || "", desc: cms.eje_3_desc || "" },
  ].filter((e) => e.titulo);

  const imgSrc = cms.imagen?.trim() || FALLBACK.imagen;

  return (
    <section
      id="operacion-valentia"
      className="w-full py-20 md:py-28 bg-gradient-to-br from-[#6F2C91] via-[#7d3aa1] to-[#5a2178] relative overflow-hidden scroll-mt-20"
      aria-labelledby="operacion-valentia-title"
    >
      {/* Yellow accent bar at top */}
      <div className="absolute top-0 left-0 w-full h-2 bg-[#EAE84B]" />

      {/* Decorative star pattern */}
      <div className="absolute inset-0 opacity-5 pointer-events-none" aria-hidden>
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 30%, #EAE84B 1.5px, transparent 1.5px), radial-gradient(circle at 80% 70%, #EAE84B 1px, transparent 1px)",
            backgroundSize: "120px 120px, 80px 80px",
          }}
        />
      </div>

      <div className="relative max-w-[1300px] mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
        {/* POSTER TIPOGRÁFICO — Google Fonts (Oswald), 0 imagen AI */}
        <div className="lg:col-span-5 order-2 lg:order-1">
          {imgSrc && !imgSrc.endsWith(".svg") ? (
            // Si Génesis sube una imagen real al CMS, se usa esa
            <div className="relative aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl border-4 border-[#EAE84B]/20">
              <img
                src={imgSrc}
                alt={cms.titulo || "Operación Valentía"}
                loading="lazy"
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-[#6F2C91] to-transparent pointer-events-none" />
            </div>
          ) : (
            // Default: poster tipográfico con Oswald (Google Fonts)
            <div
              className="relative aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl border-4 border-[#EAE84B]/30 flex flex-col items-center justify-center px-6 text-center"
              style={{
                background:
                  "linear-gradient(135deg, #7d3aa1 0%, #6F2C91 60%, #5a2178 100%)",
              }}
              aria-label="Operación Valentía"
            >
              <span className={`${oswald.className} text-[#EAE84B]/90 text-xs sm:text-sm font-bold uppercase tracking-[0.4em] mb-4`}>
                Iniciativa
              </span>
              <div className={`${oswald.className} font-bold leading-[0.92] uppercase`}>
                <div className="text-white text-5xl sm:text-6xl md:text-7xl">
                  OPERACIÓN
                </div>
                <div className="text-[#EAE84B] text-5xl sm:text-6xl md:text-7xl mt-1">
                  VALENTÍA
                </div>
              </div>
              <div className="w-16 h-[3px] bg-[#EAE84B] my-6 rounded-full" />
              <span className={`${oswald.className} text-white/80 text-xs sm:text-sm font-bold uppercase tracking-[0.3em]`}>
                Valentina Centeno
              </span>
            </div>
          )}
        </div>

        {/* TEXTO */}
        <div className="lg:col-span-7 order-1 lg:order-2 text-white">
          {cms.tag && (
            <div className="inline-flex items-center gap-2 bg-[#EAE84B] text-[#6F2C91] font-bold uppercase text-[11px] md:text-xs tracking-widest px-4 py-1.5 rounded-full mb-5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#6F2C91] animate-pulse" />
              {cms.tag}
            </div>
          )}

          <h2
            id="operacion-valentia-title"
            className={`${oswald.className} text-4xl md:text-5xl lg:text-6xl font-black uppercase tracking-tight leading-[0.95] mb-5`}
          >
            {cms.titulo || "OPERACIÓN VALENTÍA"}
          </h2>

          {cms.subtitulo && (
            <p className="text-[#EAE84B] text-lg md:text-xl font-medium leading-snug mb-6 max-w-2xl">
              {cms.subtitulo}
            </p>
          )}

          {cms.descripcion && (
            <p className="text-white/90 text-base md:text-lg leading-relaxed mb-10 max-w-2xl">
              {cms.descripcion}
            </p>
          )}

          {/* EJES (hasta 3 columnas) */}
          {ejes.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
              {ejes.map((eje, i) => (
                <div
                  key={i}
                  className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-5 hover:bg-white/15 transition-colors"
                >
                  <div className="text-[#EAE84B] font-black text-3xl mb-2 leading-none">
                    {String(i + 1).padStart(2, "0")}
                  </div>
                  <h3 className={`${oswald.className} text-white font-bold uppercase text-sm tracking-wide mb-2`}>
                    {eje.titulo}
                  </h3>
                  <p className="text-white/80 text-sm leading-relaxed">
                    {eje.desc}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* CTA */}
          {cms.cta_texto && cms.cta_link && (
            <Link
              href={cms.cta_link}
              className={`${oswald.className} inline-flex items-center gap-3 bg-[#EAE84B] text-[#6F2C91] font-black uppercase text-sm md:text-base tracking-widest px-8 py-4 rounded-full hover:bg-white transition-colors shadow-lg hover:shadow-2xl active:scale-95 min-h-[48px]`}
            >
              {cms.cta_texto}
              <span aria-hidden>→</span>
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
