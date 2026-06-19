"use client";

import { useEffect, useState } from "react";
import { Oswald } from "next/font/google";
import { getSupabase } from "@/lib/supabaseClient";
import ConcursoIAForm from "@/components/ConcursoIAForm";

const oswald = Oswald({ subsets: ["latin"], weight: ["700"] });

type Data = {
  nombre: string;
  banner_url: string;
  introduccion: string;
  reglas: string;
  fecha_inicio: string;
  fecha_fin: string;
  link_bases: string;
};

const EMPTY: Data = {
  nombre: "Concurso de Becas en Inteligencia Artificial",
  banner_url: "",
  introduccion: "Convocatoria abierta para estudiantes de colegio.",
  reglas: "",
  fecha_inicio: "",
  fecha_fin: "",
  link_bases: "",
};

const fmtFecha = (s: string) => {
  if (!s) return "";
  try {
    return new Date(s + "T00:00:00").toLocaleDateString("es-EC", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  } catch {
    return s;
  }
};

type ReglaItem = { type: "p" | "b"; text: string };
type ReglaSection = { title: string; items: ReglaItem[] };

function parseReglas(text: string): ReglaSection[] {
  if (!text) return [];
  const sections: ReglaSection[] = [];
  let current: ReglaSection | null = null;
  for (const raw of text.split("\n")) {
    const line = raw.trim();
    if (!line) continue;
    const header = line.match(/^\d+\)\s*(.+)$/);
    if (header) {
      if (current) sections.push(current);
      current = { title: header[1], items: [] };
    } else if (line.startsWith("•")) {
      current?.items.push({ type: "b", text: line.replace(/^•\s*/, "") });
    } else if (current) {
      current.items.push({ type: "p", text: line });
    }
  }
  if (current) sections.push(current);
  return sections;
}

function renderInline(text: string): React.ReactNode {
  const m = text.match(/^([A-Za-záéíóúÁÉÍÓÚñÑ\s]{3,40}?):\s+(.+)$/);
  if (m) {
    return (
      <>
        <span className="font-black text-[#1D1D1F]">{m[1]}:</span> {m[2]}
      </>
    );
  }
  return text;
}

export default function ConcursoIAPage() {
  const [data, setData] = useState<Data>(EMPTY);

  useEffect(() => {
    const cargar = async () => {
      try {
        const supabase = getSupabase();
        const { data: rows, error } = await supabase
          .from("cms_concurso_ia")
          .select("*")
          .eq("activo", true)
          .order("updated_at", { ascending: false })
          .limit(1);
        if (error || !rows || rows.length === 0) return;
        const r = rows[0];
        setData({
          nombre: r.nombre || EMPTY.nombre,
          banner_url: r.banner_url || "",
          introduccion: r.introduccion || EMPTY.introduccion,
          reglas: r.reglas || "",
          fecha_inicio: r.fecha_inicio || "",
          fecha_fin: r.fecha_fin || "",
          link_bases: r.link_bases || "",
        });
      } catch {
        // silencio: deja los EMPTY si falla
      }
    };
    cargar();
  }, []);

  return (
    <main className="w-full bg-white">
      {/* HERO */}
      <section className="relative bg-[#6F2C91] text-white overflow-hidden">
        {data.banner_url && (
          <img
            src={data.banner_url}
            alt={data.nombre}
            className="absolute inset-0 w-full h-full object-cover opacity-30"
          />
        )}
        <div className="relative max-w-[1400px] mx-auto px-6 py-24 md:py-32">
          <span className="inline-block px-4 py-1.5 rounded-full bg-[#EAE84B] text-[#6F2C91] font-bold text-xs uppercase tracking-widest mb-6">
            Iniciativa
          </span>
          <h1
            className={`${oswald.className} text-[clamp(2.5rem,6vw,5rem)] font-black uppercase leading-[0.95] max-w-4xl mb-6`}
          >
            {data.nombre}
          </h1>
          {data.fecha_inicio && data.fecha_fin && (
            <p className="text-lg md:text-xl font-medium opacity-90">
              Inscripciones: {fmtFecha(data.fecha_inicio)} —{" "}
              {fmtFecha(data.fecha_fin)}
            </p>
          )}
          <a
            href="#inscripcion"
            className="inline-block mt-8 px-8 py-4 rounded-full bg-[#EAE84B] text-[#6F2C91] font-black uppercase tracking-widest text-sm hover:bg-white transition-all shadow-xl active:scale-95"
          >
            Quiero inscribirme
          </a>
        </div>
      </section>

      {/* INTRODUCCIÓN */}
      {data.introduccion && (
        <section className="bg-[#FBFBFD] py-20">
          <div className="max-w-[900px] mx-auto px-6">
            <h2
              className={`${oswald.className} text-3xl md:text-5xl font-black uppercase text-[#1D1D1F] mb-6`}
            >
              Sobre el <span className="text-[#6F2C91]">concurso</span>
            </h2>
            <p className="text-lg md:text-xl text-[#424245] leading-relaxed whitespace-pre-line">
              {data.introduccion}
            </p>
          </div>
        </section>
      )}

      {/* REGLAS */}
      {data.reglas && (
        <section className="bg-white py-20 md:py-28">
          <div className="max-w-[920px] mx-auto px-6">
            <div className="text-center mb-14">
              <span className="inline-block px-4 py-1.5 rounded-full bg-[#EAE84B] text-[#6F2C91] font-bold text-xs uppercase tracking-widest mb-4">
                Bases de la convocatoria
              </span>
              <h2
                className={`${oswald.className} text-3xl md:text-5xl font-black uppercase text-[#1D1D1F] leading-tight`}
              >
                Reglas y <span className="text-[#6F2C91]">bases</span>
              </h2>
            </div>

            {(() => {
              const sections = parseReglas(data.reglas);
              if (sections.length === 0) {
                return (
                  <div className="text-[#424245] text-base md:text-lg leading-relaxed whitespace-pre-line">
                    {data.reglas}
                  </div>
                );
              }
              return (
                <div className="space-y-10 md:space-y-14">
                  {sections.map((sec, i) => (
                    <div
                      key={i}
                      className="bg-[#FBFBFD] rounded-[2rem] p-6 md:p-10 border border-gray-100 shadow-sm relative"
                    >
                      <div className="absolute -top-5 left-6 md:left-10 w-12 h-12 bg-[#6F2C91] text-white rounded-2xl flex items-center justify-center font-black text-xl shadow-lg">
                        {i + 1}
                      </div>
                      <h3
                        className={`${oswald.className} text-xl md:text-2xl font-black uppercase text-[#1D1D1F] mb-5 mt-4 leading-tight`}
                      >
                        {sec.title}
                      </h3>
                      <div className="space-y-4">
                        {sec.items.map((item, j) =>
                          item.type === "p" ? (
                            <p
                              key={j}
                              className="text-base md:text-lg text-[#424245] leading-relaxed"
                            >
                              {renderInline(item.text)}
                            </p>
                          ) : (
                            <div key={j} className="flex gap-3 items-start">
                              <span className="flex-none mt-1.5 w-5 h-5 bg-[#EAE84B] rounded-full flex items-center justify-center shadow-sm">
                                <svg
                                  className="w-3 h-3 text-[#6F2C91]"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              </span>
                              <p className="text-base md:text-lg text-[#424245] leading-relaxed flex-1">
                                {renderInline(item.text)}
                              </p>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}

            {data.link_bases && (
              <div className="text-center mt-10">
                <a
                  href={data.link_bases}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-7 py-4 rounded-2xl bg-[#1D1D1F] text-[#EAE84B] font-black uppercase tracking-widest text-xs hover:bg-[#6F2C91] hover:text-white transition-all shadow-lg active:scale-95"
                >
                  Descargar bases en PDF
                </a>
              </div>
            )}
          </div>
        </section>
      )}

      {/* INSCRIPCIÓN */}
      <section id="inscripcion" className="bg-[#FBFBFD] py-20 scroll-mt-24">
        <div className="max-w-[1000px] mx-auto px-6">
          <div className="text-center mb-10">
            <h2
              className={`${oswald.className} text-3xl md:text-5xl font-black uppercase text-[#1D1D1F] mb-3`}
            >
              Formulario de <span className="text-[#6F2C91]">inscripción</span>
            </h2>
            <p className="text-[#86868B] text-lg font-medium">
              Completá los datos y te contactaremos para los siguientes pasos.
            </p>
          </div>
          <ConcursoIAForm />
        </div>
      </section>
    </main>
  );
}
