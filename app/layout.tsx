import "./globals.css";
import { Suspense } from "react";
import type { Metadata, Viewport } from "next";
import { Oswald, Bebas_Neue, Montserrat } from "next/font/google";
import Header from "@/components/Header";
import Footer from "@/components/Footer"; // 👈 NUEVO
import VisitTracker from "@/components/VisitTracker";
import TopProgress from "@/components/TopProgress";

// =========================
// FUENTES DEL DISEÑO (Variables exactas del HTML original)
// =========================

// --font-boruino  → Oswald (titulares)
const oswald = Oswald({
  subsets: ["latin"],
  variable: "--font-boruino",
  weight: ["500", "700"],
});

// --font-bebas → Bebas Neue (subtítulos)
const bebasNeue = Bebas_Neue({
  subsets: ["latin"],
  variable: "--font-bebas",
  weight: ["400"],
});

// --font-body → Montserrat (cuerpo de texto)
const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["300", "400", "500", "600", "700"],
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
        <Footer />
        <Suspense fallback={null}>
          <VisitTracker />
        </Suspense>
      </body>
    </html>
  );
}
