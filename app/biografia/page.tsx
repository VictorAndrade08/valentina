"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { 
  ArrowRight, Star, Target, Users, Quote, Calendar, MapPin, Award, ChevronRight, 
  CheckCircle2, Heart, Zap, Shield, BookOpen, AlertCircle, LucideIcon
} from "lucide-react";

// --- CONFIGURACIÓN ---
// CAMBIO CLAVE: Usamos /export?format=csv en lugar de /pub para mayor compatibilidad
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
  star: Star,
  target: Target,
  users: Users,
  quote: Quote,
  calendar: Calendar,
  mappin: MapPin,
  award: Award,
  check: CheckCircle2,
  heart: Heart,
  zap: Zap,
  shield: Shield,
  book: BookOpen,
};

// DATOS POR DEFECTO
const INITIAL_DATA: BioData = {
  hero: {
    tag: "Biografía",
    title: "Pasión por Servir a Ecuador",
    quote: "No llegué a la política para ser una espectadora, sino para jugar el partido más importante: el futuro de nuestras familias.",
    description: "Desde las canchas deportivas hasta el pleno de la Asamblea, mi vida ha estado marcada por la disciplina. Soy una manabita orgullosa que cree firmemente que la juventud no es el futuro, sino el presente activo que Ecuador necesita.",
    cta: "Escríbeme al Buzón",
    imageMain: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=800&auto=format&fit=crop",
    imageSec: "https://images.unsplash.com/photo-1529070538774-1843cb3265df?q=80&w=600&auto=format&fit=crop"
  },
  timeline: [
    { year: "Orígenes", title: "Raíces Manabitas", desc: "Nací y crecí en Manabí, donde aprendí el valor del trabajo duro de mi familia.", icon: "mappin" },
    { year: "Deporte", title: "Selección Nacional", desc: "Representé a Ecuador en voleibol, aprendiendo que ningún logro es individual.", icon: "award" },
    { year: "Formación", title: "Abogada de la República", desc: "Me especialicé en Derecho Deportivo y Gestión Pública para defender causas justas.", icon: "book" },
    { year: "Actualidad", title: "Asambleísta Nacional", desc: "Legislando con honestidad y transparencia por un nuevo Ecuador.", icon: "target" },
  ],
  gallery: [
    { title: "Escuchando a nuestros emprendedores", image: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?q=80&w=800&auto=format&fit=crop" },
    { title: "Sesión en la Asamblea Nacional", image: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?q=80&w=800&auto=format&fit=crop" },
    { title: "Trabajo de campo", image: "https://images.unsplash.com/photo-1531206715517-5c0ba140b2b8?q=80&w=800&auto=format&fit=crop" },
    { title: "Manabí", image: "https://images.unsplash.com/photo-1577962917302-cd874c4e31d2?q=80&w=800&auto=format&fit=crop" },
  ],
  pillars: [
    { title: "Liderazgo Joven", desc: "Renovando la política con energía y nuevas ideas.", icon: "star" },
    { title: "Territorio 24/7", desc: "No soy asambleísta de escritorio, recorro cada cantón.", icon: "users" },
    { title: "Resultados Reales", desc: "Leyes aprobadas y fiscalización efectiva para Manabí.", icon: "target" },
  ],
  finalCta: {
    title: "Pilares de mi Gestión",
    btnText: "Únete al Cambio"
  }
};

// --- PARSER CSV IDENTICO AL QUE FUNCIONA ---
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

// Renderizador de Iconos
const RenderIcon = ({ iconName, className }: { iconName: string, className: string }) => {
  const safeKey = (iconName || "").toLowerCase().trim();
  const IconComponent = ICON_MAP[safeKey] || Star; 
  return <IconComponent className={className} />;
};

export default function AboutBio() {
  const [data, setData] = useState<BioData>(INITIAL_DATA);

  useEffect(() => {
    fetch(BIO_CSV_URL, { cache: "no-store" })
      .then((res) => {
        if (!res.ok) throw new Error("Error de red al cargar CSV");
        return res.text();
      })
      .then((csv) => {
        const rawRows = parseCsv(csv);
        // Filtramos filas vacías igual que en tu ejemplo funcional
        const rows = rawRows.filter(r => r && r.some(cell => cell.trim() !== ""));
        
        if (rows.length < 2) return; // Si no hay datos (solo header o nada), salimos

        // Clonamos estructura inicial
        const newHero: HeroData = { ...INITIAL_DATA.hero };
        const newTimeline: TimelineItem[] = [];
        const newGallery: GalleryItem[] = [];
        const newPillars: PillarItem[] = [];
        const newFinalCta: FinalCtaData = { ...INITIAL_DATA.finalCta };

        // Procesamos fila por fila
        rows.forEach((col) => {
          if (col.length < 2) return;

          // Normalizamos la sección y la clave para lógica
          const section = (col[0] || "").toString().trim().toUpperCase();
          const rawKey = (col[1] || "").toString().trim();
          const logicKey = rawKey.toUpperCase();
          
          const title = (col[2] || "").toString().trim();
          const desc = (col[3] || "").toString().trim();
          const image = (col[4] || "").toString().trim();
          const extra = (col[5] || "").toString().trim();

          if (section === "HERO") {
            if (logicKey === "MAIN") {
              if (title) newHero.title = title;
              if (desc) newHero.description = desc;
              if (image) newHero.imageMain = image;
            } else if (logicKey === "QUOTE") {
              if (title) newHero.quote = title;
              if (desc) newHero.quote = desc;
            } else if (logicKey === "SECONDARY") {
              if (image) newHero.imageSec = image;
            } else if (logicKey === "TAG") {
              if (title) newHero.tag = title;
            } else if (logicKey === "CTA") {
              if (title) newHero.cta = title;
            }
          } 
          else if (section === "TIMELINE") {
            if (title || desc) {
              newTimeline.push({
                year: rawKey || extra || "", 
                title: title || "Sin título",
                desc: desc || "",
                icon: (extra || "").toLowerCase().trim() 
              });
            }
          }
          else if (section === "GALLERY") {
            if (image) {
              newGallery.push({ title, image });
            }
          }
          else if (section === "PILLARS") {
            if (title || desc) {
              newPillars.push({
                title: title || "Pilar",
                desc: desc || "",
                icon: extra.toLowerCase().trim()
              });
            }
          }
          else if (section === "FINAL") {
             if (logicKey === "TITLE" && title) newFinalCta.title = title;
             if (logicKey === "BTN" && title) newFinalCta.btnText = title;
          }
        });

        // Solo actualizamos si hay datos nuevos reales, si no mantenemos defaults
        setData({
          hero: newHero,
          timeline: newTimeline.length > 0 ? newTimeline : INITIAL_DATA.timeline,
          gallery: newGallery.length > 0 ? newGallery : INITIAL_DATA.gallery,
          pillars: newPillars.length > 0 ? newPillars : INITIAL_DATA.pillars,
          finalCta: newFinalCta
        });
      })
      .catch((err) => {
        console.error("Error cargando biografía desde CSV:", err);
      });
  }, []);

  // --- ANIMACIONES ---
  const fadeIn = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  };

  return (
    <div className="w-full bg-white text-slate-800">
      
      {/* =========================================
          SECCIÓN 1: HERO BIO
         ========================================= */}
      <section className="relative w-full py-20 lg:py-28 overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-b from-[#6F2C91]/5 to-transparent rounded-full blur-3xl translate-x-1/3 -translate-y-1/4 pointer-events-none" />
        
        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            
            {/* IMÁGENES */}
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="lg:col-span-5 relative"
            >
              <div className="relative z-10 w-full aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl border-4 border-white bg-slate-100">
                {data.hero.imageMain ? (
                  <Image
                    src={data.hero.imageMain}
                    alt={data.hero.title || "Imagen Principal"}
                    fill
                    className="object-cover hover:scale-105 transition-transform duration-700"
                    priority
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                ) : (
                   <div className="w-full h-full flex items-center justify-center bg-gray-200">
                     <span className="text-gray-400">Imagen no disponible</span>
                   </div>
                )}
              </div>
              
              {data.hero.imageSec && (
                <div className="absolute -bottom-10 -right-10 w-2/3 aspect-square rounded-2xl overflow-hidden shadow-xl border-4 border-white z-20 hidden md:block bg-[#6F2C91]">
                   <div className="relative w-full h-full bg-[#6F2C91]">
                      <Image
                        src={data.hero.imageSec}
                        alt="Detalle secundario"
                        fill
                        className="object-cover opacity-90 hover:opacity-100 transition-opacity duration-500"
                        sizes="(max-width: 768px) 0vw, 33vw"
                      />
                      <div className="absolute inset-0 bg-[#6F2C91]/20 mix-blend-multiply" />
                   </div>
                </div>
              )}
            </motion.div>

            {/* TEXTO HERO */}
            <motion.div 
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="lg:col-span-7 flex flex-col space-y-6"
            >
              {data.hero.tag && (
                <motion.div variants={fadeIn} className="inline-flex items-center space-x-2 bg-[#6F2C91]/5 border border-[#6F2C91]/20 px-4 py-1.5 rounded-full w-fit">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#6F2C91] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#6F2C91]"></span>
                  </span>
                  <span className="text-[#6F2C91] font-bold text-xs uppercase tracking-widest">
                    {data.hero.tag}
                  </span>
                </motion.div>
              )}
              
              <motion.h2 variants={fadeIn} className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 tracking-tight leading-tight">
                {data.hero.title.includes(" ") ? (
                  <>
                    {data.hero.title.split(" ").slice(0, Math.ceil(data.hero.title.split(" ").length / 2)).join(" ")} <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#6F2C91] to-[#9c4ac1]">
                      {data.hero.title.split(" ").slice(Math.ceil(data.hero.title.split(" ").length / 2)).join(" ")}
                    </span>
                  </>
                ) : (
                  <span className="text-[#6F2C91]">{data.hero.title}</span>
                )}
              </motion.h2>

              {data.hero.quote && (
                <motion.div variants={fadeIn} className="relative pl-6 border-l-4 border-[#6F2C91]/30 py-2 my-4">
                  <Quote className="absolute top-0 left-6 text-[#6F2C91]/10 w-12 h-12 -translate-x-full -translate-y-2" />
                  <p className="text-xl md:text-2xl font-serif italic text-slate-700 leading-relaxed">
                    "{data.hero.quote}"
                  </p>
                </motion.div>
              )}

              <motion.p variants={fadeIn} className="text-slate-600 text-lg leading-relaxed whitespace-pre-line">
                {data.hero.description}
              </motion.p>
              
              <motion.div variants={fadeIn} className="pt-4">
                <Link 
                  href="/#buzon" 
                  className="group inline-flex items-center justify-center px-8 py-3.5 text-base font-bold text-white transition-all duration-200 bg-[#6F2C91] rounded-full hover:bg-[#5a2275] hover:shadow-lg hover:shadow-[#6F2C91]/30 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#6F2C91]"
                >
                  {data.hero.cta}
                  <ArrowRight className="w-5 h-5 ml-2 transition-transform duration-200 group-hover:translate-x-1" />
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* =========================================
          SECCIÓN 2: TRAYECTORIA (Timeline)
         ========================================= */}
      {data.timeline && data.timeline.length > 0 && (
        <section className="py-20 bg-slate-50 relative">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h3 className="text-3xl font-bold text-slate-900 mb-4">Mi Camino al Servicio</h3>
              <p className="text-slate-600">De la disciplina deportiva a la gestión legislativa.</p>
            </div>

            <div className="relative max-w-4xl mx-auto">
              <div className="absolute left-0 md:left-1/2 top-0 bottom-0 w-px bg-[#6F2C91]/20 transform md:-translate-x-1/2 ml-4 md:ml-0" />

              <div className="space-y-12">
                {data.timeline.map((item, index) => (
                  <motion.div 
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className={`relative flex items-center md:justify-between ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} flex-row`}
                  >
                    <div className={`w-full md:w-[45%] pl-12 md:pl-0 ${index % 2 === 0 ? 'md:pr-8 md:text-right' : 'md:pl-8 md:text-left'}`}>
                      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                        {item.year && <span className="inline-block text-[#6F2C91] font-bold text-sm mb-2">{item.year}</span>}
                        <h4 className="text-xl font-bold text-slate-900 mb-2">{item.title}</h4>
                        <p className="text-slate-600 text-sm">{item.desc}</p>
                      </div>
                    </div>

                    <div className="absolute left-4 md:left-1/2 w-8 h-8 bg-white border-4 border-[#6F2C91] rounded-full transform -translate-x-1/2 flex items-center justify-center z-10 shadow-sm">
                      <RenderIcon iconName={item.icon} className="w-3 h-3 text-[#6F2C91]" />
                    </div>

                    <div className="hidden md:block w-[45%]" />
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* =========================================
          SECCIÓN 3: GALERÍA VISUAL (Collage)
         ========================================= */}
      {data.gallery && data.gallery.length > 0 && (
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4 md:px-6">
            <div className="flex flex-col md:flex-row justify-between items-end mb-12">
              <div>
                <span className="text-[#6F2C91] font-semibold tracking-wider text-sm uppercase">En Territorio</span>
                <h3 className="text-3xl font-bold text-slate-900 mt-2">Cerca de la Gente</h3>
              </div>
              <Link href="/galeria" className="hidden md:flex items-center text-[#6F2C91] font-medium hover:underline mt-4 md:mt-0">
                Ver todas las fotos <ChevronRight className="w-4 h-4 ml-1" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 grid-rows-2 gap-4 h-[600px] md:h-[500px]">
              {data.gallery.slice(0, 4).map((item, i) => {
                let gridClasses = "md:col-span-1 md:row-span-1"; 
                if (i === 0) gridClasses = "md:col-span-2 md:row-span-2";
                else if (i === 1) gridClasses = "md:col-span-2 md:row-span-1";

                return (
                  <motion.div 
                    key={i}
                    whileHover={{ scale: 1.02 }}
                    className={`${gridClasses} relative rounded-2xl overflow-hidden group bg-slate-100`}
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
                      <div className="flex items-center justify-center w-full h-full text-slate-300">
                        <AlertCircle />
                      </div>
                    )}
                    {item.title && (
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                        <p className="text-white font-medium">{item.title}</p>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
            
            <div className="mt-6 md:hidden text-center">
              <Link href="/galeria" className="inline-flex items-center text-[#6F2C91] font-medium">
                Ver todas las fotos <ChevronRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* =========================================
          SECCIÓN 4: VALORES Y CTA FINAL
         ========================================= */}
      {data.pillars && data.pillars.length > 0 && (
        <section className="py-20 bg-[#6F2C91]/5">
          <div className="container mx-auto px-4 text-center">
            <h3 className="text-3xl font-bold text-slate-900 mb-10">{data.finalCta.title}</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              {data.pillars.map((item, index) => (
                <motion.div 
                  key={index}
                  whileHover={{ y: -5 }}
                  className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:border-[#6F2C91]/30 transition-all"
                >
                  <div className="w-12 h-12 bg-[#6F2C91]/10 rounded-full flex items-center justify-center text-[#6F2C91] mx-auto mb-4">
                    <RenderIcon iconName={item.icon} className="w-6 h-6" />
                  </div>
                  <h4 className="text-lg font-bold text-slate-900 mb-2">{item.title}</h4>
                  <p className="text-slate-600">{item.desc}</p>
                </motion.div>
              ))}
            </div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="inline-block"
            >
              <Link 
                href="/#buzon" 
                className="group inline-flex items-center space-x-3 bg-[#6F2C91] text-white px-10 py-5 rounded-full font-bold shadow-lg shadow-[#6F2C91]/30 hover:shadow-[#6F2C91]/50 hover:-translate-y-1 transition-all duration-300"
              >
                <span>{data.finalCta.btnText}</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          </div>
        </section>
      )}
    </div>
  );
}