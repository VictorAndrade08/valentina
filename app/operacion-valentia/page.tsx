"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Oswald } from "next/font/google";
import { getSupabase } from "@/lib/supabaseClient";
import BuzonCiudadano from "@/components/BuzonCiudadano";

const oswald = Oswald({ subsets: ["latin"], weight: ["700"] });

type Cms = Record<string, string>;

const FALLBACK: Cms = {
  activo: "true",
  tag: "Iniciativa ciudadana",
  titulo: "OPERACIÓN VALENTÍA",
  subtitulo:
    "Una campaña por la transparencia, la juventud y la dignidad de Manabí",
  descripcion:
    "Operación Valentía es la línea estratégica que articula los esfuerzos legislativos de Valentina Centeno con las necesidades reales de la ciudadanía. Una iniciativa para llevar las voces del territorio al centro del debate nacional.",
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
  cta_texto: "Súmate a la operación",
  cta_link: "/#buzon",
};

export default function OperacionValentiaPage() {
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

  if (!loaded) {
    return (
      <main className="min-h-[80vh] flex items-center justify-center bg-[#6F2C91]">
        <div className="text-white/80 text-sm animate-pulse">Cargando...</div>
      </main>
    );
  }

  const ejes: { titulo: string; desc: string }[] = [
    { titulo: cms.eje_1_titulo || "", desc: cms.eje_1_desc || "" },
    { titulo: cms.eje_2_titulo || "", desc: cms.eje_2_desc || "" },
    { titulo: cms.eje_3_titulo || "", desc: cms.eje_3_desc || "" },
  ].filter((e) => e.titulo);

  const imgSrc = cms.imagen?.trim() || FALLBACK.imagen;

  return (
    <main className="w-full bg-white">
      {/* HERO */}
      <section className="relative bg-gradient-to-br from-[#6F2C91] via-[#7d3aa1] to-[#5a2178] text-white overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-[#EAE84B]" />
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

        <div className="relative max-w-[1300px] mx-auto px-6 py-20 md:py-28 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          <div className="lg:col-span-7 order-2 lg:order-1">
            {cms.tag && (
              <div className="inline-flex items-center gap-2 bg-[#EAE84B] text-[#6F2C91] font-bold uppercase text-xs md:text-sm tracking-widest px-5 py-2 rounded-full mb-6">
                <span className="w-1.5 h-1.5 rounded-full bg-[#6F2C91] animate-pulse" />
                {cms.tag}
              </div>
            )}

            <h1
              className={`${oswald.className} text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-black uppercase tracking-tight leading-[0.9] mb-6`}
            >
              {cms.titulo || "OPERACIÓN VALENTÍA"}
            </h1>

            {cms.subtitulo && (
              <p className="font-lead text-[#EAE84B] text-2xl md:text-3xl lg:text-4xl font-medium leading-tight mb-8 max-w-3xl">
                {cms.subtitulo}
              </p>
            )}

            {cms.descripcion && (
              <p className="font-lead text-white/90 text-lg md:text-xl lg:text-2xl leading-relaxed max-w-3xl">
                {cms.descripcion}
              </p>
            )}
          </div>

          <div className="lg:col-span-5 order-1 lg:order-2">
            {imgSrc && !imgSrc.endsWith(".svg") ? (
              <div className="relative aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl border-4 border-[#EAE84B]/30 max-w-[420px] mx-auto">
                <img
                  src={imgSrc}
                  alt={cms.titulo || "Operación Valentía"}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </div>
            ) : (
              // Poster tipográfico con Oswald — sin imagen AI
              <div
                className="relative aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl border-4 border-[#EAE84B]/30 max-w-[420px] mx-auto flex flex-col items-center justify-center px-6 text-center"
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
                  <div className="text-white text-5xl sm:text-6xl">
                    OPERACIÓN
                  </div>
                  <div className="text-[#EAE84B] text-5xl sm:text-6xl mt-1">
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
        </div>
      </section>

      {/* EJES — más espacio que en home */}
      {ejes.length > 0 && (
        <section className="bg-[#FBFBFD] py-20 md:py-28">
          <div className="max-w-[1200px] mx-auto px-6">
            <div className="text-center mb-14 md:mb-20">
              <span className="inline-block px-5 py-2 rounded-full bg-[#EAE84B] text-[#6F2C91] font-bold text-sm uppercase tracking-widest mb-4">
                Nuestros ejes
              </span>
              <h2
                className={`${oswald.className} text-5xl md:text-6xl lg:text-7xl font-black uppercase text-[#1D1D1F] leading-[0.95]`}
              >
                Tres frentes, <span className="text-[#6F2C91]">un mismo objetivo</span>
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
              {ejes.map((eje, i) => (
                <article
                  key={i}
                  className="bg-white rounded-3xl border border-gray-100 p-8 md:p-10 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all"
                >
                  <div className={`${oswald.className} text-[#6F2C91] font-black text-6xl md:text-7xl mb-5 leading-none`}>
                    {String(i + 1).padStart(2, "0")}
                  </div>
                  <h3 className={`${oswald.className} text-[#1D1D1F] font-black uppercase text-2xl md:text-3xl tracking-tight mb-4`}>
                    {eje.titulo}
                  </h3>
                  <p className="font-lead text-[#424245] text-base md:text-lg leading-relaxed">
                    {eje.desc}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA + INTRO AL FORMULARIO */}
      <section className="bg-[#6F2C91] text-white pt-20 md:pt-28 pb-12 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-[#EAE84B]" />
        <div className="max-w-[900px] mx-auto px-6 text-center">
          <h2 className={`${oswald.className} text-5xl md:text-6xl lg:text-7xl font-black uppercase leading-[0.95] mb-8`}>
            ¿Querés ser parte?
          </h2>
          <p className="font-lead text-white/90 text-lg md:text-2xl leading-relaxed mb-6 max-w-3xl mx-auto">
            Cada mensaje, cada caso, cada propuesta cuenta. Sumate a Operación
            Valentía dejándonos tu mensaje en el formulario de abajo.
          </p>
          <p className="text-[#EAE84B] text-base md:text-lg font-bold uppercase tracking-widest mt-8">
            ↓ Escribinos acá ↓
          </p>
        </div>
      </section>

      {/* FORMULARIO DEL BUZÓN — mismo componente que el home */}
      <div id="formulario-operacion">
        <BuzonCiudadano />
      </div>

      {/* PIE — volver al inicio */}
      <section className="bg-[#FBFBFD] py-10 text-center border-t border-gray-200">
        <Link
          href="/"
          className="text-[#6F2C91] hover:text-[#1D1D1F] text-sm font-bold uppercase tracking-widest transition-colors"
        >
          ← Volver al inicio
        </Link>
      </section>
    </main>
  );
}
