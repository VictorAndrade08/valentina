import "./globals.css";
import { Suspense } from "react";
import type { Metadata, Viewport } from "next";
import { Oswald, Bebas_Neue, Montserrat, Plus_Jakarta_Sans } from "next/font/google";
import Header from "@/components/Header";
import Footer from "@/components/Footer"; // 👈 NUEVO
import VisitTracker from "@/components/VisitTracker";
import TopProgress from "@/components/TopProgress";
import ScrollReveal from "@/components/ScrollReveal";

// =========================
// FUENTES DEL DISEÑO (Variables exactas del HTML original)
// =========================

// --font-boruino  → Oswald (titulares). display:swap → render instantáneo.
const oswald = Oswald({
  subsets: ["latin"],
  variable: "--font-boruino",
  weight: ["500", "700"],
  display: "swap",
});

// --font-bebas → Bebas Neue (subtítulos)
const bebasNeue = Bebas_Neue({
  subsets: ["latin"],
  variable: "--font-bebas",
  weight: ["400"],
  display: "swap",
});

// --font-body → Montserrat. Solo 3 weights críticos (era 5 → -40% peso).
const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "600", "700"],
  display: "swap",
});

// --font-lead → Plus Jakarta Sans. Solo 2 weights (era 5 → -60% peso).
const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-lead",
  weight: ["500", "700"],
  display: "swap",
});

// =========================
// METADATA GLOBAL
// =========================
export const metadata: Metadata = {
  title: "Valentina Centeno | Asambleísta Ecuatoriana",
  description:
    "Sitio oficial de Valentina Centeno, Asambleísta ecuatoriana por Acción Democrática Nacional.",
  manifest: "/site.webmanifest",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon-32x32.png", type: "image/png", sizes: "32x32" },
    ],
    apple: [
      { url: "/favicon-180x180.png", sizes: "180x180", type: "image/png" },
    ],
  },
};

// Color de la barra del navegador en mobile (PWA / Chrome Android / Safari).
export const viewport: Viewport = {
  themeColor: "#74278F",
};

// =========================
// ROOT LAYOUT
// =========================
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="scroll-smooth">
      <body
        className={`
          ${oswald.variable}
          ${bebasNeue.variable}
          ${montserrat.variable}
          ${plusJakarta.variable}
          font-[--font-body]
          antialiased
          bg-white
          text-gray-900
        `}
      >
        <a href="#main-content" className="skip-to-content">
          Saltar al contenido
        </a>
        <Suspense fallback={null}>
          <TopProgress />
        </Suspense>
        <Header />
        <main id="main-content">{children}</main>
        <Suspense fallback={null}>
          <ScrollReveal />
        </Suspense>
        <Footer />
        <Suspense fallback={null}>
          <VisitTracker />
        </Suspense>
      </body>
    </html>
  );
}
