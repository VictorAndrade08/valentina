"use client";

import React, { useEffect } from "react";

const TikTokFeedValentina: React.FC = () => {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const scriptId = "tiktok-embed-script";
    const existing = document.getElementById(
      scriptId
    ) as HTMLScriptElement | null;

    if (!existing) {
      const s = document.createElement("script");
      s.id = scriptId;
      s.src = "https://www.tiktok.com/embed.js";
      s.async = true;
      document.body.appendChild(s);
    } else {
      // Si el script ya existe, forzamos el render de los embeds
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const w = window as any;
      if (w.tiktokEmbed && typeof w.tiktokEmbed.load === "function") {
        try {
          w.tiktokEmbed.load();
        } catch (e) {
          console.warn("No se pudo recargar el embed de TikTok:", e);
        }
      }
    }
  }, []);

  return (
    <section
      id="tiktok"
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
              TikTok oficial
            </span>
            <div className="hidden sm:block h-px flex-1 bg-[#D4D5E0]" />
          </div>

          {/* Título + texto + botón */}
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
            <div>
              <h2 className="text-[clamp(2rem,3.2vw,2.6rem)] font-[var(--font-boruino)] text-[#2A2154] font-extrabold uppercase leading-tight">
                Valentina en TikTok
              </h2>
              <div className="mt-2 w-[120px] h-[6px] rounded-full bg-[#EAE84B]" />
              <p className="mt-3 text-sm sm:text-[15px] text-[#4B4B5C] font-[var(--font-body)] max-w-[520px]">
                Videos cortos, mensajes clave y contenido en formato vertical
                para conectar con más jóvenes en TikTok.
              </p>
            </div>

            <a
              href="https://www.tiktok.com/@valencentenoa"
              target="_blank"
              rel="noreferrer"
              className="
                inline-flex items-center justify-center
                px-6 py-3
                rounded-full
                text-[13px] font-[var(--font-boruino)] font-bold uppercase
                bg-black text-white
                shadow-md shadow-[#0000001a]
                hover:bg-[#262626]
                hover:-translate-y-[1px]
                transition-all
              "
            >
              Ver perfil en TikTok
            </a>
          </div>
        </div>

        {/* CONTENEDOR DEL FEED / PERFIL */}
        <div
          className="
            bg-white rounded-3xl shadow-[0_18px_40px_rgba(0,0,0,0.12)]
            overflow-hidden border border-[#E2E3ED]
          "
        >
          {/* Barra superior estilo tarjeta */}
          <div className="flex items-center justify-between px-5 py-3 bg-[#F9F9FF] border-b border-[#E2E3ED]">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-black flex items-center justify-center text-white text-xs font-[var(--font-boruino)]">
                TT
              </div>
              <div className="leading-tight">
                <p className="text-[13px] font-[var(--font-boruino)] text-[#2A2154] uppercase">
                  @valencentenoa
                </p>
                <p className="text-[11px] text-[#7A7B8C] font-[var(--font-body)]">
                  Contenido cargado desde TikTok
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#FF5F57]" />
              <span className="w-1.5 h-1.5 rounded-full bg-[#FEBB2E]" />
              <span className="w-1.5 h-1.5 rounded-full bg-[#28C840]" />
            </div>
          </div>

          {/* EMBED SIN FRANJA BLANCA EXTRA */}
          <div className="w-full">
            <blockquote
              className="tiktok-embed w-full"
              cite="https://www.tiktok.com/@valencentenoa"
              data-unique-id="valencentenoa"
              data-embed-type="creator"
              style={{
                width: "100%",
                maxWidth: "100%",
                minWidth: "100%",
                margin: 0,
              }}
            >
              <section>
                <a
                  target="_blank"
                  rel="noreferrer"
                  href="https://www.tiktok.com/@valencentenoa"
                >
                  @valencentenoa
                </a>
              </section>
            </blockquote>
          </div>
        </div>

        {/* NOTA CHIQUITA */}
        <p className="text-[11px] text-gray-500 mt-3 font-[var(--font-body)]">
          El feed se muestra mediante el embed oficial de TikTok. Si no ves los
          videos, revisa tu bloqueador de anuncios o permite contenido de TikTok
          en tu navegador.
        </p>
      </div>
    </section>
  );
};

export default TikTokFeedValentina;
