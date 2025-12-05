import Hero from "@/components/Hero";
import AboutBio from "@/components/AboutBio";

import Leyes from "@/components/Leyes";
import FraseOrgullo from "@/components/FraseOrgullo";
import LogrosManabi from "@/components/LogrosManabi";

// ⭐ NUEVO COMPONENTE
import IniciativasLegislativas from "@/components/IniciativasLegislativas";

import AgendaInternacional from "@/components/AgendaInternacional";
import BuzonCiudadano from "@/components/BuzonCiudadano";

// ⭐ FEED INSTAGRAM
import InstagramFeedValentina from "@/components/InstagramFeedValentina";

// ⭐ FEED TIKTOK
import TikTokFeedValentina from "@/components/TikTokFeedValentina";

// ⭐ BOTÓN FLOTANTE BUZÓN
import BuzonFloatingCTA from "@/components/BuzonFloatingCTA";

export default function Home() {
  return (
    <>
      <main className="w-full overflow-x-hidden bg-white">
        {/* HERO PRINCIPAL */}
        <Hero />

        {/* SECCIÓN HOLA SOY */}
        <AboutBio />

        {/* NOTICIAS LEYES */}
        <Leyes />

        {/* BANNER ORGULLO */}
        <FraseOrgullo />

        {/* LOGROS MANABÍ */}
        <LogrosManabi />

        {/* FEED DE INSTAGRAM */}
        <InstagramFeedValentina />

        {/* FEED DE TIKTOK */}
        <TikTokFeedValentina />

        {/* ⭐ INICIATIVAS LEGISLATIVAS */}
        <IniciativasLegislativas />

        {/* AGENDA INTERNACIONAL */}
        <AgendaInternacional />

        {/* BUZÓN CIUDADANO */}
        <BuzonCiudadano />
      </main>

      {/* BOTÓN FLOTANTE HACIA #buzon */}
      <BuzonFloatingCTA />
    </>
  );
}
