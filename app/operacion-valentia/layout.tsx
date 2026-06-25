import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Operación Valentía — Valentina Centeno",
  description:
    "Iniciativa ciudadana por la transparencia, la juventud y la dignidad de Manabí. Una línea estratégica que articula los esfuerzos legislativos de Valentina Centeno con las necesidades reales de la ciudadanía.",
  keywords: [
    "Operación Valentía",
    "Valentina Centeno",
    "Iniciativa ciudadana",
    "Manabí",
    "Asamblea Nacional Ecuador",
  ],
  openGraph: {
    title: "Operación Valentía — Valentina Centeno",
    description:
      "Iniciativa ciudadana por la transparencia, la juventud y la dignidad de Manabí.",
    url: "/operacion-valentia",
    siteName: "Valentina Centeno",
    locale: "es_EC",
    type: "website",
    images: [
      {
        url: "/imagenes/operacion-valentia.svg",
        width: 800,
        height: 1000,
        alt: "Operación Valentía",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Operación Valentía — Valentina Centeno",
    description:
      "Iniciativa ciudadana por la transparencia, la juventud y la dignidad de Manabí.",
    images: ["/imagenes/operacion-valentia.svg"],
  },
};

export default function OperacionValentiaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
