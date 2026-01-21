"use client";

// 1. Componentes de Identidad y Conexión
import Hero from "@/components/Hero";
import AboutBio from "@/components/AboutBio";
import SocialFollow from "@/components/SocialFollow"; 
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
        <Hero />
        {/* AboutBio ahora carga sus datos internamente desde el CSV */}
        <AboutBio /> 
        
        {/* BLOQUE 2: PROPUESTA Y MARCO LEGAL */}
        <section className="bg-[#FBFBFD]">
          <IniciativasLegislativas />
          {/* Nota: Si "PresentacionFormacionDual" es lo que querías mostrar aquí, asegúrate de importarlo o renombrarlo como "Leyes" */}
          <Leyes />
        </section>

        {/* BLOQUE 3: IMPACTO EMOCIONAL Y TERRITORIAL */}
        <FraseOrgullo />
        <LogrosManabi />

        {/* BLOQUE 4: VISIÓN E INTERNACIONALIZACIÓN */}
        <section className="bg-[#FBFBFD]">
           {/* <Proyectos /> */}
          <AgendaInternacional />
        </section>

        {/* SECCIÓN DE REDES SOCIALES (Movida aquí para mejor flujo antes del contacto) */}
        <SocialFollow /> 

        {/* BLOQUE 5: ESCUCHA ACTIVA (CIERRE) */}
        <div id="buzon" className="scroll-mt-20 pb-20">
          <BuzonCiudadano />
        </div>

      </main>

      <BuzonFloatingCTA />
    </>
  );
}