"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { 
  ArrowRight, Star, Target, Users, Quote, Calendar, MapPin, Award, ChevronRight, 
  CheckCircle2, Heart, Zap, Shield, BookOpen, AlertCircle, LucideIcon, Loader2
} from "lucide-react";

// --- CONFIGURACIÓN ---
const BIO_CSV_URL = "https://docs.google.com/spreadsheets/d/1eYERExfcLuzh_VYgByaDNgCj_6Pzm4WHlrLm5oL-pxQ/export?format=csv&gid=1612750821";

// --- TIPOS DE DATOS ---
interface HeroData {
  tag: string;
  title: string;
  quote: string;
  description: string;
  cta: string;
  imageMain: string;
  imageSec?: string;
}

interface TimelineItem {
  year: string;
  title: string;
  desc: string;
  icon: string;
}

interface GalleryItem {
  title: string;
  image: string;
}

interface PillarItem {
  title: string;
  desc: string;
  icon: string;
}

interface FinalCtaData {
  title: string;
  btnText: string;
}

interface BioData {
  hero: HeroData;
  timeline: TimelineItem[];
  gallery: GalleryItem[];
  pillars: PillarItem[];
  finalCta: FinalCtaData;
}

// MAPA DE ICONOS
const ICON_MAP: Record<string, LucideIcon> = {
  star: Star, target: Target, users: Users, quote: Quote, calendar: Calendar,
  mappin: MapPin, award: Award, check: CheckCircle2, heart: Heart,
  zap: Zap, shield: Shield, book: BookOpen,
};

// DATOS DE RESPALDO (SOLO SE USAN SI FALLA EL CSV, NO AL INICIO)
const FALLBACK_DATA: BioData = {
  hero: {
    tag: "Biografía",
    title: "Cargando perfil...",
    quote: "",
    description: "Espere un momento mientras cargamos la información actualizada.",
    cta: "Contactar",
    imageMain: "", // Dejamos vacío para no cargar imágenes incorrectas
    imageSec: ""
  },
  timeline: [],
  gallery: [],
  pillars: [],
  finalCta: { title: "", btnText: "" }
};

// --- PARSER CSV ---
function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let cur = ""; let row: string[] = []; let inQuotes = false; let i = 0;
  while (i < text.length) {
    const char = text[i];
    if (inQuotes) {
      if (char === '"') {
        if (i + 1 < text.length && text[i + 1] === '"') { cur += '"'; i += 2; }
        else { inQuotes = false; i++; }
      } else { cur += char; i++; }
    } else {
      if (char === '"') { inQuotes = true; i++; }
      else if (char === ",") { row.push(cur); cur = ""; i++; }
      else if (char === "\r" || char === "\n") {
        row.push(cur); rows.push(row); row = []; cur = "";
        if (char === "\r" && i + 1 < text.length && text[i + 1] === "\n") i += 2; else i++;
      } else { cur += char; i++; }
    }
  }
  row.push(cur); rows.push(row); return rows;
}

const RenderIcon = ({ iconName, className }: { iconName: string, className: string }) => {
  const safeKey = (iconName || "").toLowerCase().trim();
  const IconComponent = ICON_MAP[safeKey] || Star; 
  return <IconComponent className={className} />;
};

export default function AboutBio() {
  // CAMBIO IMPORTANTE: Iniciamos en null o loading para no mostrar datos viejos
  const [data, setData] = useState<BioData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    fetch(BIO_CSV_URL, { cache: "no-store" })
      .then((res) => {
        if (!res.ok) throw new Error("Error de red");
        return res.text();
      })
      .then((csv) => {
        const rawRows = parseCsv(csv);
        const rows = rawRows.filter(r => r && r.some(cell => cell.trim() !== ""));
        
        if (rows.length < 2) throw new Error("Datos insuficientes");

        // Estructura temporal basada en el Fallback pero vacía para llenar con CSV
        const newData: BioData = {
            hero: { ...FALLBACK_DATA.hero },
            timeline: [],
            gallery: [],
            pillars: [],
            finalCta: { ...FALLBACK_DATA.finalCta }
        };

        rows.forEach((col) => {
          if (col.length < 2) return;
          const section = (col[0] || "").toString().trim().toUpperCase();
          const rawKey = (col[1] || "").toString().trim();
          const logicKey = rawKey.toUpperCase();
          const title = (col[2] || "").toString().trim();
          const desc = (col[3] || "").toString().trim();
          const image = (col[4] || "").toString().trim();
          const extra = (col[5] || "").toString().trim();

          if (section === "HERO") {
            if (logicKey === "MAIN") {
              if (title) newData.hero.title = title;
              if (desc) newData.hero.description = desc;
              if (image) newData.hero.imageMain = image;
            } else if (logicKey === "QUOTE") {
              if (title) newData.hero.quote = title;
              if (desc) newData.hero.quote = desc; // Fallback si está en la col desc
            } else if (logicKey === "SECONDARY" && image) newData.hero.imageSec = image;
            else if (logicKey === "TAG" && title) newData.hero.tag = title;
            else if (logicKey === "CTA" && title) newData.hero.cta = title;
          } 
          else if (section === "TIMELINE" && (title || desc)) {
            newData.timeline.push({ year: rawKey || extra, title, desc, icon: extra });
          }
          else if (section === "GALLERY" && image) {
            newData.gallery.push({ title, image });
          }
          else if (section === "PILLARS" && (title || desc)) {
            newData.pillars.push({ title, desc, icon: extra });
          }
          else if (section === "FINAL") {
             if (logicKey === "TITLE" && title) newData.finalCta.title = title;
             if (logicKey === "BTN" && title) newData.finalCta.btnText = title;
          }
        });

        setData(newData);
      })
      .catch((err) => {
        console.error("Error CSV:", err);
        // Solo usamos fallback si falla la red, no antes
        setData(FALLBACK_DATA); 
      })
      .finally(() => setIsLoading(false));
  }, []);

  // --- RENDERIZADO DE CARGA (SKELETON) ---
  // Esto evita que se vea la imagen anterior. Se muestra esto mientras carga el Excel.
  if (isLoading || !data) {
    return (
      <div className="w-full min-h-[80vh] flex flex-col items-center justify-center bg-white">
        <Loader2 className="w-10 h-10 text-[#6F2C91] animate-spin mb-4" />
        <p className="text-slate-500 animate-pulse">Cargando biografía...</p>
      </div>
    );
  }

  // --- ANIMACIONES ---
  const fadeIn = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
  };

  return (
    <div className="w-full bg-white text-slate-800 overflow-x-hidden">
      
      {/* SECCIÓN 1: HERO BIO */}
      <section className="relative w-full py-16 lg:py-28 overflow-hidden">
        {/* Decoración de fondo */}
        <div className="absolute top-0 right-0 w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-gradient-to-b from-[#6F2C91]/5 to-transparent rounded-full blur-3xl translate-x-1/3 -translate-y-1/4 pointer-events-none" />
        
        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="flex flex-col lg:grid lg:grid-cols-12 gap-10 lg:gap-16 items-center">
            
            {/* IMAGEN PRINCIPAL (Arriba en móvil, Izquierda en PC) */}
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="w-full lg:col-span-5 relative max-w-[500px] lg:max-w-none mx-auto"
            >
              <div className="relative z-10 w-full aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl border-4 border-white bg-slate-100">
                {data.hero.imageMain ? (
                  <Image
                    src={data.hero.imageMain}
                    alt={data.hero.title}
                    fill
                    className="object-cover"
                    priority
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                ) : (
                   <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">Sin imagen</div>
                )}
              </div>
              
              {/* Imagen secundaria (Oculta en móvil para limpiar la vista) */}
              {data.hero.imageSec && (
                <div className="absolute -bottom-10 -right-10 w-2/3 aspect-square rounded-2xl overflow-hidden shadow-xl border-4 border-white z-20 hidden lg:block bg-[#6F2C91]">
                   <Image
                     src={data.hero.imageSec}
                     alt="Detalle"
                     fill
                     className="object-cover opacity-90"
                   />
                </div>
              )}
            </motion.div>

            {/* TEXTO HERO */}
            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="w-full lg:col-span-7 flex flex-col space-y-6 text-center lg:text-left"
            >
              {data.hero.tag && (
                <div className="flex justify-center lg:justify-start">
                    <motion.div variants={fadeIn} className="inline-flex items-center space-x-2 bg-[#6F2C91]/5 border border-[#6F2C91]/20 px-4 py-1.5 rounded-full w-fit">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#6F2C91] opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-[#6F2C91]"></span>
                    </span>
                    <span className="text-[#6F2C91] font-bold text-xs uppercase tracking-widest">
                        {data.hero.tag}
                    </span>
                    </motion.div>
                </div>
              )}
              
              <motion.h2 variants={fadeIn} className="text-3xl md:text-5xl lg:text-6xl font-bold text-slate-900 tracking-tight leading-tight">
                {data.hero.title}
              </motion.h2>

              {data.hero.quote && (
                <motion.div variants={fadeIn} className="relative lg:pl-6 lg:border-l-4 border-[#6F2C91]/30 py-2 my-4">
                  <p className="text-lg md:text-2xl font-serif italic text-slate-700 leading-relaxed px-4 lg:px-0">
                    "{data.hero.quote}"
                  </p>
                </motion.div>
              )}

              <motion.p variants={fadeIn} className="text-slate-600 text-base md:text-lg leading-relaxed whitespace-pre-line px-2 lg:px-0">
                {data.hero.description}
              </motion.p>
              
              <motion.div variants={fadeIn} className="pt-4 flex justify-center lg:justify-start">
                <Link 
                  href="/#buzon" 
                  className="group inline-flex items-center justify-center px-8 py-3.5 text-base font-bold text-white transition-all duration-200 bg-[#6F2C91] rounded-full hover:bg-[#5a2275] shadow-lg shadow-[#6F2C91]/30"
                >
                  {data.hero.cta}
                  <ArrowRight className="w-5 h-5 ml-2 transition-transform duration-200 group-hover:translate-x-1" />
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* SECCIÓN 2: TRAYECTORIA (RESPONSIVE MEJORADO) */}
      {data.timeline && data.timeline.length > 0 && (
        <section className="py-16 bg-slate-50 relative">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <h3 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">Mi Trayectoria</h3>
              <p className="text-slate-600 text-sm md:text-base">De la disciplina deportiva a la gestión legislativa.</p>
            </div>

            <div className="relative max-w-4xl mx-auto">
              {/* Línea vertical: Izquierda en móvil, Centro en PC */}
              <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-px bg-[#6F2C91]/20 transform md:-translate-x-1/2" />

              <div className="space-y-8 md:space-y-12">
                {data.timeline.map((item, index) => (
                  <motion.div 
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    // EN MÓVIL: Siempre flex-row normal. EN PC: Alternado
                    className={`relative flex items-start md:items-center md:justify-between ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} flex-row`}
                  >
                    {/* Contenido: En móvil siempre a la derecha de la línea */}
                    <div className={`w-full md:w-[45%] pl-16 md:pl-0 ${index % 2 === 0 ? 'md:pr-8 md:text-right' : 'md:pl-8 md:text-left'}`}>
                      <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                        {item.year && <span className="inline-block text-[#6F2C91] font-bold text-xs uppercase mb-1">{item.year}</span>}
                        <h4 className="text-lg font-bold text-slate-900 mb-1">{item.title}</h4>
                        <p className="text-slate-600 text-sm leading-relaxed">{item.desc}</p>
                      </div>
                    </div>

                    {/* Icono: Posicionado sobre la línea */}
                    <div className="absolute left-6 md:left-1/2 w-8 h-8 bg-white border-4 border-[#6F2C91] rounded-full transform -translate-x-1/2 flex items-center justify-center z-10 shadow-sm mt-6 md:mt-0">
                      <RenderIcon iconName={item.icon} className="w-3 h-3 text-[#6F2C91]" />
                    </div>

                    {/* Espaciador para PC */}
                    <div className="hidden md:block w-[45%]" />
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* SECCIÓN 3: GALERÍA VISUAL */}
      {data.gallery && data.gallery.length > 0 && (
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4 md:px-6">
            <div className="flex flex-col md:flex-row justify-between items-end mb-8 md:mb-12">
              <div className="text-center md:text-left w-full">
                <span className="text-[#6F2C91] font-semibold tracking-wider text-xs uppercase">En Territorio</span>
                <h3 className="text-2xl md:text-3xl font-bold text-slate-900 mt-1">Cerca de la Gente</h3>
              </div>
            </div>

            {/* Grid Galería: 1 col en móvil, 4 en PC */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 md:grid-rows-2 gap-4 h-auto md:h-[500px]">
              {data.gallery.slice(0, 4).map((item, i) => {
                // Lógica de grid responsive
                let desktopClasses = "md:col-span-1 md:row-span-1"; 
                if (i === 0) desktopClasses = "md:col-span-2 md:row-span-2";
                else if (i === 1) desktopClasses = "md:col-span-2 md:row-span-1";

                return (
                  <div 
                    key={i}
                    className={`${desktopClasses} relative rounded-2xl overflow-hidden group bg-slate-100 h-[250px] md:h-auto`}
                  >
                    {item.image ? (
                      <Image 
                        src={item.image} 
                        alt={item.title || "Galería"} 
                        fill 
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                        sizes="(max-width: 768px) 100vw, 33vw"
                      />
                    ) : (
                      <div className="flex items-center justify-center w-full h-full bg-slate-200"><AlertCircle className="text-slate-400" /></div>
                    )}
                    {item.title && (
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4 md:p-6">
                        <p className="text-white font-medium text-sm md:text-base">{item.title}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* SECCIÓN 4: PILARES Y CTA FINAL */}
      {data.pillars && data.pillars.length > 0 && (
        <section className="py-16 bg-[#6F2C91]/5">
          <div className="container mx-auto px-4 text-center">
            <h3 className="text-2xl md:text-3xl font-bold text-slate-900 mb-8">{data.finalCta.title}</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-10">
              {data.pillars.map((item, index) => (
                <div 
                  key={index}
                  className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100"
                >
                  <div className="w-10 h-10 bg-[#6F2C91]/10 rounded-full flex items-center justify-center text-[#6F2C91] mx-auto mb-3">
                    <RenderIcon iconName={item.icon} className="w-5 h-5" />
                  </div>
                  <h4 className="text-lg font-bold text-slate-900 mb-1">{item.title}</h4>
                  <p className="text-slate-600 text-sm">{item.desc}</p>
                </div>
              ))}
            </div>

            <Link 
                href="/#buzon" 
                className="inline-flex items-center space-x-2 bg-[#6F2C91] text-white px-8 py-4 rounded-full font-bold shadow-lg shadow-[#6F2C91]/30 hover:scale-105 transition-transform"
            >
                <span>{data.finalCta.btnText}</span>
                <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </section>
      )}
    </div>
  );
}