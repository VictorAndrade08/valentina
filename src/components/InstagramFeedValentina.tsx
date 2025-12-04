"use client";

import React from "react";

const InstagramFeedValentina: React.FC = () => {
  return (
    <section
      id="instagram"
      className="
        w-full 
        py-20
        bg-gradient-to-b from-[#6F2C91]/8 via-[#F5F6FA] to-[#F5F6FA]
      "
    >
      <div className="max-w-[1200px] mx-auto px-6">
        {/* CABECERA */}
        <div className="flex flex-col gap-5 mb-10">
          {/* Línea gráfica / chip */}
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#6F2C91] text-[11px] font-[var(--font-boruino)] uppercase tracking-[0.18em] text-white">
              <span className="w-1.5 h-1.5 rounded-full bg-[#EAE84B]" />
              Instagram oficial
            </span>
            <div className="hidden sm:block h-px flex-1 bg-[#D4D5E0]" />
          </div>

          {/* Título + texto + botón */}
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
            <div>
              <h2 className="text-[clamp(2rem,3.2vw,2.6rem)] font-[var(--font-boruino)] text-[#2A2154] font-extrabold uppercase leading-tight">
                Valentina en redes
              </h2>
              <div className="mt-2 w-[120px] h-[6px] rounded-full bg-[#EAE84B]" />
              <p className="mt-3 text-sm sm:text-[15px] text-[#4B4B5C] font-[var(--font-body)] max-w-[520px]">
                Mira en tiempo real el trabajo territorial, las iniciativas
                legislativas y los momentos que comparte con la gente.
              </p>
            </div>

            <a
              href="https://www.instagram.com/valencentenoa/"
              target="_blank"
              rel="noreferrer"
              className="
                inline-flex items-center justify-center
                px-6 py-3
                rounded-full
                text-[13px] font-[var(--font-boruino)] font-bold uppercase
                bg-[#EAE84B] text-[#2A2154]
                shadow-md shadow-[#0000001a]
                hover:bg-[#fff76f]
                hover:-translate-y-[1px]
                transition-all
              "
            >
              Ver perfil completo
            </a>
          </div>
        </div>

        {/* CONTENEDOR DEL FEED */}
        <div
          className="
            bg-white rounded-3xl shadow-[0_18px_40px_rgba(0,0,0,0.12)]
            overflow-hidden border border-[#E2E3ED]
          "
        >
          {/* Barra superior estilo tarjeta */}
          <div className="flex items-center justify-between px-5 py-3 bg-[#F9F9FF] border-b border-[#E2E3ED]">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#6F2C91] flex items-center justify-center text-white text-xs font-[var(--font-boruino)]">
                VC
              </div>
              <div className="leading-tight">
                <p className="text-[13px] font-[var(--font-boruino)] text-[#2A2154] uppercase">
                  @valencentenoa
                </p>
                <p className="text-[11px] text-[#7A7B8C] font-[var(--font-body)]">
                  Contenido cargado desde Instagram
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#FF5F57]" />
              <span className="w-1.5 h-1.5 rounded-full bg-[#FEBB2E]" />
              <span className="w-1.5 h-1.5 rounded-full bg-[#28C840]" />
            </div>
          </div>

          {/* IFRAME RESPONSIVE */}
          <div className="w-full aspect-[4/5] sm:aspect-[16/9]">
            <iframe
              src="https://www.instagram.com/valencentenoa/embed/"
              title="Instagram feed Valentina Centeno"
              loading="lazy"
              className="w-full h-full border-0"
            />
          </div>
        </div>

        {/* NOTA CHIQUITA */}
        <p className="text-[11px] text-gray-500 mt-3 font-[var(--font-body)]">
          El feed se muestra mediante un iframe estático. Si no lo ves, revisa tu
          bloqueador de anuncios o permite contenido de Instagram en tu navegador.
        </p>
      </div>
    </section>
  );
};

export default InstagramFeedValentina;
