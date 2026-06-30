"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { Oswald } from "next/font/google";
import { getSupabase } from "@/lib/supabaseClient";

const oswald = Oswald({ subsets: ["latin"], weight: ["700"] });

type Noticia = {
  id: string;
  titulo: string;
  imagen: string;
  link_opcional: string | null;
  fecha: string | null;
  resumen: string | null;
  contenido: string | null;
};

const fmtFecha = (iso: string | null) => {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleDateString("es-EC", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  } catch {
    return "";
  }
};

export default function NoticiaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [noticia, setNoticia] = useState<Noticia | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const cargar = async () => {
      try {
        const supabase = getSupabase();
        const { data, error } = await supabase
          .from("cms_noticias")
          .select(
            "id, titulo, imagen, link_opcional, fecha, resumen, contenido, activo"
          )
          .eq("id", id)
          .eq("activo", true)
          .limit(1);
        if (error || !data || data.length === 0) {
          setNotFound(true);
          return;
        }
        const r = data[0];
        setNoticia({
          id: String(r.id),
          titulo: r.titulo || "",
          imagen: r.imagen || "",
          link_opcional: r.link_opcional || null,
          fecha: r.fecha || null,
          resumen: r.resumen || null,
          contenido: r.contenido || null,
        });
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };
    cargar();
  }, [id]);

  if (loading) {
    return (
      <main className="min-h-[70vh] flex items-center justify-center bg-white">
        <p className="text-gray-500 animate-pulse text-sm">Cargando noticia...</p>
      </main>
    );
  }

  if (notFound || !noticia) {
    return (
      <main className="min-h-[70vh] w-full bg-[#6F2C91] text-white flex flex-col items-center justify-center px-6 py-16 text-center">
        <span className="inline-block bg-[#EAE84B] text-[#6F2C91] font-black uppercase tracking-widest text-xs px-5 py-2 rounded-full mb-6">
          Sin contenido
        </span>
        <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tight mb-4">
          Esta noticia no está disponible
        </h1>
        <p className="text-white/85 mb-10 max-w-md">
          Es posible que haya sido despublicada o que la dirección esté incorrecta.
        </p>
        <Link
          href="/#noticias"
          className="bg-[#EAE84B] text-[#6F2C91] font-bold uppercase tracking-widest text-sm px-8 py-4 rounded-full hover:bg-white transition-colors min-h-[48px] flex items-center"
        >
          Ver todas las noticias
        </Link>
      </main>
    );
  }

  // Convertir contenido a párrafos (cada línea en blanco es separador)
  const parrafos = (noticia.contenido || "")
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <main className="w-full bg-white">
      {/* HERO con imagen + título */}
      <section className="relative bg-[#6F2C91] text-white overflow-hidden">
        {noticia.imagen && (
          <img
            src={noticia.imagen}
            alt={noticia.titulo}
            className="absolute inset-0 w-full h-full object-cover opacity-30"
          />
        )}
        <div className="relative max-w-[900px] mx-auto px-6 py-20 md:py-28">
          <Link
            href="/#noticias"
            className="inline-flex items-center gap-2 text-[#EAE84B] hover:text-white text-xs font-bold uppercase tracking-widest mb-6 transition-colors"
          >
            <span aria-hidden>←</span> Volver a noticias
          </Link>

          {noticia.fecha && (
            <span className="inline-block px-4 py-1.5 rounded-full bg-[#EAE84B] text-[#6F2C91] font-bold text-xs uppercase tracking-widest mb-6">
              {fmtFecha(noticia.fecha)}
            </span>
          )}

          <h1
            className={`${oswald.className} text-4xl md:text-6xl lg:text-7xl font-black uppercase tracking-tight leading-[0.95]`}
          >
            {noticia.titulo}
          </h1>

          {noticia.resumen && (
            <p className="text-[#EAE84B] text-lg md:text-2xl font-medium leading-snug mt-6 max-w-2xl">
              {noticia.resumen}
            </p>
          )}
        </div>
      </section>

      {/* IMAGEN ampliada (si existe) */}
      {noticia.imagen && (
        <section className="bg-[#FBFBFD] py-12">
          <div className="max-w-[1000px] mx-auto px-6">
            <div className="rounded-3xl overflow-hidden shadow-xl border-4 border-white">
              <img
                src={noticia.imagen}
                alt={noticia.titulo}
                className="w-full h-auto object-contain bg-white"
                loading="eager"
              />
            </div>
          </div>
        </section>
      )}

      {/* CONTENIDO del blog post */}
      <section className="bg-white py-16 md:py-24">
        <div className="max-w-[760px] mx-auto px-6">
          {parrafos.length > 0 ? (
            <article className="space-y-6 text-[#1D1D1F] text-base md:text-lg leading-relaxed">
              {parrafos.map((p, i) => (
                <p key={i} className="whitespace-pre-line">
                  {p}
                </p>
              ))}
            </article>
          ) : (
            <div className="text-center text-gray-500">
              <p className="text-sm">
                Esta noticia todavía no tiene contenido extendido. Pronto vas a
                encontrar más detalles acá.
              </p>
            </div>
          )}

          {noticia.link_opcional && (
            <div className="mt-12 pt-10 border-t border-gray-200 text-center">
              <a
                href={noticia.link_opcional}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 bg-[#6F2C91] text-white font-bold uppercase tracking-widest text-sm px-8 py-4 rounded-full hover:bg-[#1D1D1F] hover:text-[#EAE84B] transition-colors min-h-[48px]"
              >
                Ver más información oficial
                <span aria-hidden>↗</span>
              </a>
            </div>
          )}

          <div className="mt-16 text-center">
            <Link
              href="/#noticias"
              className="text-[#6F2C91] hover:text-[#1D1D1F] text-sm font-bold uppercase tracking-widest transition-colors"
            >
              ← Ver todas las noticias
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
