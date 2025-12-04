"use client";

import { useRef, useEffect, useState } from "react";

export default function AboutBio() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [cms, setCms] = useState<Record<string, string> | null>(null);

  useEffect(() => {
    const url =
      "https://docs.google.com/spreadsheets/d/e/2PACX-1vTYKQwKNfKrrKl6J91u7X26Yr8cQxsalFeHIjnZfxjDaHcgS5JYPn_KzHt5naz_-yFXfLidX96gr_yg/pub?output=csv";

    fetch(url, { cache: "no-store" })
      .then(res => res.text())
      .then(csv => {
        const lines = csv.trim().split("\n");
        const data: Record<string, string> = {};

        for (let i = 1; i < lines.length; i++) {
          const [key, ...rest] = lines[i].split(",");
          const value = rest.join(",");
          if (key) data[key.trim()] = value.trim();
        }

        setCms(data);
      })
      .catch(err => console.error("ERROR CMS:", err));
  }, []);

  /**  
   * get() ahora:
   * - si cms no existe → fallback
   * - si cms[key] está vacío → fallback
   * - si cms[key] existe y tiene texto → lo usa
   */
  const get = (key: string, fallback: string) => {
    const val = cms?.[key];
    if (!val || val.trim() === "") return fallback;
    return val;
  };

  const handleMouseEnter = () => {
    if (videoRef.current) {
      videoRef.current.muted = false;
      videoRef.current.volume = 1;
    }
  };

  const handleMouseLeave = () => {
    if (videoRef.current) {
      videoRef.current.muted = true;
      videoRef.current.volume = 0;
    }
  };

  return (
    <section
      id="acerca-de-mi"
      className="w-full bg-white py-20 border-t-[6px] border-[#6F2C91]"
    >
      <div className="max-w-[1400px] mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
        
        {/* TEXTO */}
        <div>
          <h2 className="text-[#6F2C91] font-boruino text-[clamp(2rem,4vw,3rem)] font-extrabold uppercase mb-6">
            {get("title", "¡HOLA! SOY VALENTINA CENTENO")}
          </h2>

          <p className="text-[18px] text-gray-800 font-body leading-relaxed mb-6">
            {get(
              "p1",
              "Soy una abogada y política ecuatoriana, nacida en Portoviejo – Manabí. Fui elegida asambleísta nacional en 2023 y reelecta como asambleísta por Manabí en 2025. Lidero en la Asamblea Nacional la bancada de Acción Democrática Nacional (ADN)."
            )}
          </p>

          <p className="text-[18px] text-gray-800 font-body leading-relaxed">
            {get(
              "p2",
              "Como presidenta de la Comisión de Desarrollo Económico he impulsado leyes que promueven la seguridad, los alivios financieros, la innovación en sectores estratégicos y leyes que generan empleo joven como parte del desarrollo de nuestro país."
            )}
          </p>
        </div>

        {/* VIDEO */}
        <div
          className="
            w-full h-[350px] lg:h-[420px]
            bg-[#333333]
            relative overflow-hidden rounded-md
            flex items-center justify-center
          "
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <video
            ref={videoRef}
            src={get(
              "video",
              "https://peachpuff-cod-624982.hostingersite.com/wp-content/uploads/2025/12/Manabi-tendra-el-lugar-que-siempre-merecio.-Vamos-a-luchar-juntos-por-una-asamblea-distintaestiempodemanabi-Adn7-votatodo7.mp4"
            )}
            className="w-full h-full object-cover"
            autoPlay
            loop
            muted
            playsInline
            controls
          />
        </div>
      </div>
    </section>
  );
}
