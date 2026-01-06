"use client";

// 1. Componentes de Identidad y Conexión
import Hero from "@/components/Hero";
import AboutBio from "@/components/AboutBio";
import SocialFollow from "@/components/SocialFollow"; // ⭐ Movido hacia arriba
import FraseOrgullo from "@/components/FraseOrgullo";

// 2. Componentes de Gestión y Resultados
import IniciativasLegislativas from "@/components/IniciativasLegislativas";
import Leyes from "@/components/Leyes";
import LogrosManabi from "@/components/LogrosManabi";
import Proyectos from "@/components/Proyectos";
import AgendaInternacional from "@/components/AgendaInternacional";

// 3. Componentes de Interacción y Globales
import BuzonCiudadano from "@/components/BuzonCiudadano";
import BuzonFloatingCTA from "@/components/BuzonFloatingCTA";

export default function Home() {
  return (
    <>
      <main className="w-full overflow-x-hidden bg-white selection:bg-[#6F2C91]/20">
        
        {/* BLOQUE 1: CONEXIÓN E IDENTIDAD */}
        {/* Presentamos a Valentina y abrimos canales de comunicación inmediata */}
        <Hero />
        <AboutBio cms={undefined} />
        <SocialFollow /> 

        {/* BLOQUE 2: PROPUESTA Y MARCO LEGAL */}
        {/* Explicamos el "por qué" antes del "qué" */}
        <section className="bg-[#FBFBFD]">
          <IniciativasLegislativas />
          <Leyes />
        </section>

        {/* BLOQUE 3: IMPACTO EMOCIONAL Y TERRITORIAL */}
        <FraseOrgullo />
        <LogrosManabi />

        {/* BLOQUE 4: VISIÓN E INTERNACIONALIZACIÓN */}
        <section className="bg-[#FBFBFD]">
          <Proyectos />
          <AgendaInternacional />
        </section>

        {/* BLOQUE 5: ESCUCHA ACTIVA (CIERRE) */}
        <div id="buzon" className="scroll-mt-20 pb-20">
          <BuzonCiudadano />
        </div>

      </main>

      {/* Interfaz Interactiva Flotante */}
      <BuzonFloatingCTA />
    </>
  );
}