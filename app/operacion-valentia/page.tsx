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
              <div className="inline-flex items-center gap-2 bg-[#EAE84B] text-[#6F2C91] font-bold uppercase text-[11px] md:text-xs tracking-widest px-4 py-1.5 rounded-full mb-5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#6F2C91] animate-pulse" />
                {cms.tag}
              </div>
            )}

            <h1
              className={`${oswald.className} text-5xl md:text-6xl lg:text-7xl font-black uppercase tracking-tight leading-[0.95] mb-5`}
            >
              {cms.titulo || "OPERACIÓN VALENTÍA"}
            </h1>

            {cms.subtitulo && (
              <p className="text-[#EAE84B] text-lg md:text-2xl font-medium leading-snug mb-6 max-w-2xl">
                {cms.subtitulo}
              </p>
            )}

            {cms.descripcion && (
              <p className="text-white/90 text-base md:text-lg leading-relaxed max-w-2xl">
                {cms.descripcion}
              </p>
            )}
          </div>

          <div className="lg:col-span-5 order-1 lg:order-2">
            <div className="relative aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl border-4 border-[#EAE84B]/30 max-w-[420px] mx-auto">
              <img
                src={imgSrc}
                alt={cms.titulo || "Operación Valentía"}
                className="absolute inset-0 w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* EJES — más espacio que en home */}
      {ejes.length > 0 && (
        <section className="bg-[#FBFBFD] py-20 md:py-28">
          <div className="max-w-[1200px] mx-auto px-6">
            <div className="text-center mb-12 md:mb-16">
              <span className="inline-block px-4 py-1.5 rounded-full bg-[#EAE84B] text-[#6F2C91] font-bold text-xs uppercase tracking-widest mb-3">
                Nuestros ejes
              </span>
              <h2
                className={`${oswald.className} text-3xl md:text-5xl font-black uppercase text-[#1D1D1F] leading-tight`}
              >
                Tres frentes, <span className="text-[#6F2C91]">un mismo objetivo</span>
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
              {ejes.map((eje, i) => (
                <article
                  key={i}
                  className="bg-white rounded-3xl border border-gray-100 p-7 md:p-9 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all"
                >
                  <div className={`${oswald.className} text-[#6F2C91] font-black text-5xl mb-4 leading-none`}>
                    {String(i + 1).padStart(2, "0")}
                  </div>
                  <h3 className={`${oswald.className} text-[#1D1D1F] font-black uppercase text-xl md:text-2xl tracking-wide mb-3`}>
                    {eje.titulo}
                  </h3>
                  <p className="text-[#424245] text-sm md:text-base leading-relaxed">
                    {eje.desc}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA FINAL */}
      <section className="bg-[#6F2C91] text-white py-20 md:py-28 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-[#EAE84B]" />
        <div className="max-w-[900px] mx-auto px-6 text-center">
          <h2 className={`${oswald.className} text-3xl md:text-5xl font-black uppercase leading-tight mb-6`}>
            ¿Querés ser parte?
          </h2>
          <p className="text-white/85 text-base md:text-lg leading-relaxed mb-10 max-w-2xl mx-auto">
            Cada mensaje, cada caso, cada propuesta cuenta. El buzón ciudadano
            es el primer paso para que tu voz se convierta en acción legislativa.
          </p>
          {cms.cta_texto && (
            <Link
              href={cms.cta_link || "/#buzon"}
              className={`${oswald.className} inline-flex items-center gap-3 bg-[#EAE84B] text-[#6F2C91] font-black uppercase text-sm md:text-base tracking-widest px-10 py-5 rounded-full hover:bg-white transition-colors shadow-xl hover:shadow-2xl active:scale-95 min-h-[52px]`}
            >
              {cms.cta_texto}
              <span aria-hidden>→</span>
            </Link>
          )}
          <div className="mt-10">
            <Link
              href="/"
              className="text-white/70 hover:text-[#EAE84B] text-sm font-medium uppercase tracking-widest transition-colors"
            >
              ← Volver al inicio
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
