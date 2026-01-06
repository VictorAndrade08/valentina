"use client";

import { useState, useEffect, useRef } from "react";
import { Oswald } from "next/font/google";

const oswald = Oswald({
  subsets: ["latin"],
  weight: ["700"],
});

interface Proyecto {
  id: string;
  titulo: string;
  categoria: string;
  estado: "PLANIFICACIÓN" | "EN PROCESO" | "PRÓXIMAMENTE";
  entrega: string;
  descripcion: string;
  imagen: string;
}

export default function ProyectosQueVienen() {
  const [proyectos, setProyectos] = useState<Proyecto[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Simulación de carga de datos (Se puede conectar a Google Sheets)
    const mockData: Proyecto[] = [
      {
        id: "1",
        titulo: "Centro de Innovación Tecnológica Manta",
        categoria: "Educación",
        estado: "PLANIFICACIÓN",
        entrega: "Q3 2026",
        descripcion: "Un espacio dedicado al desarrollo de habilidades digitales para jóvenes manabitas.",
        imagen: "https://peachpuff-cod-624982.hostingersite.com/wp-content/uploads/2025/12/PUERTO-DE-MANTA-3.jpg"
      },
      {
        id: "2",
        titulo: "Reactivación Productiva Agro-Industrial",
        categoria: "Economía",
        estado: "PRÓXIMAMENTE",
        entrega: "Agosto 2026",
        descripcion: "Líneas de crédito y tecnificación para pequeños productores de la zona norte.",
        imagen: "https://peachpuff-cod-624982.hostingersite.com/wp-content/uploads/2025/12/ZONAS-FRANCAS-2.webp"
      },
      {
        id: "3",
        titulo: "Plan Maestro de Agua Segura",
        categoria: "Infraestructura",
        estado: "EN PROCESO",
        entrega: "Diciembre 2026",
        descripcion: "Extensión de redes de alcantarillado y agua potable para parroquias rurales.",
        imagen: "https://peachpuff-cod-624982.hostingersite.com/wp-content/uploads/2025/12/ALIVIO-FINANCIERO-BIESS.webp"
      }
    ];
    setProyectos(mockData);
  }, []);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollTo = direction === "left" ? scrollLeft - clientWidth / 1.5 : scrollLeft + clientWidth / 1.5;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: "smooth" });
    }
  };

  return (
    <section className="w-full py-24 bg-[#FBFBFD] overflow-hidden relative">
      <div className="max-w-[1400px] mx-auto px-6 mb-12 flex justify-between items-end">
        <div>
          <h2 className={`${oswald.className} text-[clamp(2.5rem,5vw,4.5rem)] font-black uppercase leading-[0.85] text-[#1D1D1F]`}>
            PROYECTOS <br /> <span className="text-[#6F2C91]">QUE VIENEN</span>
          </h2>
          <div className="w-20 h-1.5 bg-[#EAE84B] rounded-full mt-4" />
        </div>

        {/* Flechas Estilo Apple */}
        <div className="hidden md:flex gap-4">
          <button onClick={() => scroll("left")} className="w-14 h-14 rounded-full bg-white shadow-lg flex items-center justify-center hover:bg-gray-50 border border-gray-100 transition-all">
            <svg width="28" height="28" fill="none" viewBox="0 0 24 24" className="rotate-180"><path stroke="#6F2C91" strokeWidth="3" d="m9 5 7 7-7 7"/></svg>
          </button>
          <button onClick={() => scroll("right")} className="w-14 h-14 rounded-full bg-white shadow-lg flex items-center justify-center hover:bg-gray-50 border border-gray-100 transition-all">
            <svg width="28" height="28" fill="none" viewBox="0 0 24 24"><path stroke="#6F2C91" strokeWidth="3" d="m9 5 7 7-7 7"/></svg>
          </button>
        </div>
      </div>

      {/* Slider Horizontal Snap */}
      <div 
        ref={scrollRef} 
        className="flex gap-8 overflow-x-auto px-6 md:px-[calc((100vw-1300px)/2)] pb-12 no-scrollbar snap-x snap-mandatory"
      >
        {proyectos.map((proy) => (
          <div 
            key={proy.id} 
            className="flex-none w-[88vw] md:w-[480px] h-[650px] relative rounded-[3rem] overflow-hidden snap-center group shadow-xl transition-all duration-700 hover:shadow-purple-200"
          >
            {/* Imagen Inmersiva */}
            <img src={proy.imagen} className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" alt="" />
            
            {/* Gradiente Morado Institucional */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#6F2C91] via-[#6F2C91]/40 to-transparent opacity-90 group-hover:opacity-100 transition-opacity" />

            {/* Contenido */}
            <div className="absolute inset-0 p-10 flex flex-col justify-between z-10">
              <div className="self-start px-6 py-2 rounded-full bg-[#EAE84B] text-[#6F2C91] font-black text-xs tracking-widest shadow-xl">
                {proy.estado}
              </div>

              <div className="space-y-4">
                <span className="text-[#EAE84B] font-bold text-sm uppercase tracking-[0.2em]">Categoría: {proy.categoria}</span>
                <h3 className={`${oswald.className} text-white text-3xl md:text-4xl uppercase leading-none drop-shadow-lg`}>
                  {proy.titulo}
                </h3>
                <p className="text-white/90 text-lg font-medium leading-relaxed line-clamp-3 group-hover:line-clamp-none transition-all duration-500">
                  {proy.descripcion}
                </p>
                <div className="pt-4 flex items-center justify-between">
                    <span className="text-[#EAE84B] font-bold">Entrega: {proy.entrega}</span>
                    <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center text-[#6F2C91] shadow-2xl transition-all group-hover:bg-[#EAE84B] group-hover:scale-110">
                        <span className="text-3xl font-light">+</span>
                    </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* CTA Sección Inferior (Diseño Final de Captura) */}
      <div className="max-w-[1300px] mx-auto px-6 mt-12">
        <div className="bg-[#6F2C91] rounded-[3.5rem] p-10 md:p-16 flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl relative overflow-hidden">
            <div className="relative z-10 text-center md:text-left">
                <h4 className={`${oswald.className} text-white text-3xl md:text-5xl uppercase leading-none mb-4`}>
                    ¿QUIERES RECIBIR <br /> <span className="text-[#EAE84B]">NOTICIAS EXCLUSIVAS?</span>
                </h4>
                <p className="text-white/80 text-lg font-medium max-w-lg">Suscríbete para conocer los avances de estos proyectos en tiempo real.</p>
            </div>
            <button className="relative z-10 bg-[#EAE84B] text-[#6F2C91] px-12 py-5 rounded-full font-black uppercase tracking-widest hover:bg-white hover:scale-105 transition-all shadow-xl active:scale-95">
                AVISARME POR WHATSAPP
            </button>
            {/* Círculo decorativo de fondo */}
            <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
        </div>
      </div>

      <style jsx>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </section>
  );
}