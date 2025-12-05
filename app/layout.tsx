import "./globals.css";
import type { Metadata } from "next";
import { Oswald, Bebas_Neue, Montserrat } from "next/font/google";
import Header from "@/components/Header";
import Footer from "@/components/Footer"; // 👈 NUEVO

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
  title: "Valentina Centeno | Asambleísta Nacional",
  description:
    "Sitio oficial de Valentina Centeno, Asambleísta Nacional por la Bancada ADN.",
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
          pt-[80px]
        `}
      >
        <Header />
        <main>{children}</main> {/* 👈 envuelvo el contenido en <main> */}
        <Footer />              {/* 👈 FOOTER AL FINAL */}
      </body>
    </html>
  );
}
