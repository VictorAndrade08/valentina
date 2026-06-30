"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Oswald } from "next/font/google";
import { getSupabase } from "@/lib/supabaseClient";
import { safeImageUrl } from "@/lib/safeImage";

const oswald = Oswald({ subsets: ["latin"], weight: ["700"] });

type Noticia = {
  id: string;
  titulo: string;
  imagen: string;
  link_opcional: string | null;
  fecha: string | null;
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

export default function CorchoNoticias() {
  const [noticias, setNoticias] = useState<Noticia[]>([]);

  useEffect(() => {
    const cargar = async () => {
      try {
        const supabase = getSupabase();
        const { data, error } = await supabase
          .from("cms_noticias")
          .select("id, orden, titulo, imagen, link_opcional, fecha, activo")
          .eq("activo", true)
          .order("orden", { ascending: true });
        if (error || !data) return;
        const list: Noticia[] = data
          .filter((r) => r.imagen)
          .map((r) => ({
            id: String(r.id),
            titulo: r.titulo || "",
            imagen: safeImageUrl(r.imagen) || "",
            link_opcional: r.link_opcional || null,
            fecha: r.fecha || null,
          }));
        if (list.length > 0) setNoticias(list);
      } catch {
        // silencio: sección no renderiza si Supabase falla
      }
    };
    cargar();
  }, []);

  if (noticias.length === 0) return null;

  return (
    <section
      id="noticias"
      className="w-full py-20 bg-white border-t border-gray-100 relative"
    >
      <div className="max-w-[1400px] mx-auto px-6">
        <div className="text-center mb-12">
          <h2
            className={`${oswald.className} text-[#1D1D1F] text-[clamp(2.5rem,5vw,4rem)] font-black uppercase leading-[0.9] mb-4`}
          >
            ÚLTIMAS <span className="text-[#6F2C91]">NOTICIAS</span>
          </h2>
          <p className="text-[#86868B] text-lg md:text-xl font-medium">
            Anuncios, campañas y actividades en marcha.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {noticias.map((n) => {
            const cardClass =
              "group relative rounded-[2rem] overflow-hidden bg-gray-100 shadow-md hover:shadow-2xl hover:-translate-y-1 transition-all text-left block w-full";
            const cardContent = (
              <>
                <div className="aspect-[4/5] w-full overflow-hidden">
                  <img
                    src={n.imagen}
                    alt={n.titulo || "Noticia"}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  {n.fecha && (
                    <span className="inline-block px-3 py-1 rounded-full bg-[#EAE84B] text-[#6F2C91] font-bold text-[10px] uppercase tracking-widest mb-2">
                      {fmtFecha(n.fecha)}
                    </span>
                  )}
                  {n.titulo && (
                    <h3
                      className={`${oswald.className} text-white text-xl md:text-2xl font-black uppercase leading-tight drop-shadow-md line-clamp-2`}
                    >
                      {n.titulo}
                    </h3>
                  )}
                </div>
              </>
            );
            // 1) Si tiene link externo → click directo a esa URL en pestaña nueva
            if (n.link_opcional) {
              return (
                <a
                  key={n.id}
                  href={n.link_opcional}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cardClass}
                >
                  {cardContent}
                </a>
              );
            }
            // 2) Sin link → abre la página /noticias/[id] (estilo blog)
            return (
              <Link
                key={n.id}
                href={`/noticias/${n.id}`}
                className={cardClass}
              >
                {cardContent}
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
