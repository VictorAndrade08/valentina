"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Oswald } from "next/font/google";
import { getSupabase } from "@/lib/supabaseClient";

const oswald = Oswald({ subsets: ["latin"], weight: ["700"] });

type Data = {
  nombre: string;
  banner_url: string;
  fecha_fin: string;
};

// Imagen IA por defecto, alojada en Supabase Storage del propio proyecto.
const FALLBACK_AI_IMG =
  "https://jcuromipofksetcixkyu.supabase.co/storage/v1/object/public/cms-imagenes/concurso_ia/banner_ia_placeholder.jpg";

const fmtFecha = (s: string) => {
  if (!s) return "";
  try {
    return new Date(s + "T00:00:00").toLocaleDateString("es-EC", {
      day: "numeric",
      month: "long",
    });
  } catch {
    return s;
  }
};

export default function BannerConcursoIA() {
  const [data, setData] = useState<Data | null>(null);

  useEffect(() => {
    const cargar = async () => {
      try {
        const supabase = getSupabase();
        const { data: rows } = await supabase
          .from("cms_concurso_ia")
          .select("nombre, banner_url, fecha_fin, activo")
          .eq("activo", true)
          .limit(1);
        if (rows && rows[0] && rows[0].nombre) {
          setData({
            nombre: rows[0].nombre,
            banner_url: rows[0].banner_url || "",
            fecha_fin: rows[0].fecha_fin || "",
          });
        }
      } catch {
        // silencio
      }
    };
    cargar();
  }, []);

  if (!data) return null;

  // Solo la parte principal del nombre (antes del " — ")
  const tituloCorto = data.nombre.split(" — ")[0] || data.nombre;

  // Si no hay banner seteado, o es un placeholder de un dominio externo (picsum, unsplash, etc.),
  // usar la imagen IA propia alojada en Supabase Storage.
  const isExternal =
    !data.banner_url ||
    data.banner_url.includes("picsum.photos") ||
    data.banner_url.includes("images.unsplash.com");
  const imageUrl = isExternal ? FALLBACK_AI_IMG : data.banner_url;

  return (
    <section className="w-full py-8 md:py-12 bg-white">
      <div className="max-w-[1200px] mx-auto px-6">
        <Link
          href="/concurso-ia"
          className="block group relative rounded-[2rem] overflow-hidden bg-[#6F2C91] shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1"
        >
          <img
            src={imageUrl}
            alt={tituloCorto}
            className="absolute inset-0 w-full h-full object-cover opacity-45 group-hover:opacity-55 transition-opacity"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#6F2C91] via-[#6F2C91]/85 to-[#6F2C91]/40 pointer-events-none" />
          <div className="absolute top-0 left-0 right-0 h-1 bg-[#EAE84B]" />

          <div className="relative flex flex-col md:flex-row md:items-center gap-4 md:gap-6 p-6 md:p-8 lg:p-10">
            <div className="flex-1 min-w-0">
              <span className="inline-block px-3 py-1 rounded-full bg-[#EAE84B] text-[#6F2C91] font-bold text-[10px] uppercase tracking-widest mb-2">
                Concurso
              </span>
              <h2
                className={`${oswald.className} text-white text-2xl md:text-3xl lg:text-4xl font-black uppercase leading-tight`}
              >
                {tituloCorto}
              </h2>
              {data.fecha_fin && (
                <p className="text-[#EAE84B] text-sm md:text-base font-bold mt-2">
                  Postulaciones hasta el {fmtFecha(data.fecha_fin)}
                </p>
              )}
            </div>
            <span className="flex-none inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#EAE84B] text-[#6F2C91] font-black uppercase tracking-widest text-xs md:text-sm group-hover:bg-white transition-all shadow-lg whitespace-nowrap">
              Postular
              <svg
                className="w-4 h-4 transition-transform group-hover:translate-x-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </span>
          </div>
        </Link>
      </div>
    </section>
  );
}
