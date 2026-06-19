import type { Metadata } from "next";

const OG_IMG =
  "https://jcuromipofksetcixkyu.supabase.co/storage/v1/object/public/cms-imagenes/concurso_ia/banner_ia_placeholder.jpg";

export const metadata: Metadata = {
  title: "Desafío IA por la Educación — Valentina Centeno",
  description:
    "Convocatoria abierta para estudiantes de Bachillerato del Ecuador. Becas de formación en Inteligencia Artificial con la Universidad Tecnológica Empresarial de Guayaquil (UTEG) y Miami Business Technological University.",
  keywords: [
    "Concurso de IA",
    "Becas Inteligencia Artificial",
    "Estudiantes Ecuador",
    "Valentina Centeno",
    "UTEG",
    "Manabí",
  ],
  openGraph: {
    title: "Desafío IA por la Educación — Valentina Centeno",
    description:
      "Postula a la Beca de IA. Inscripciones abiertas hasta el 30 de junio.",
    url: "/concurso-ia",
    siteName: "Valentina Centeno",
    locale: "es_EC",
    type: "website",
    images: [
      {
        url: OG_IMG,
        width: 1600,
        height: 800,
        alt: "Desafío IA por la Educación",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Desafío IA por la Educación",
    description:
      "Postula a la Beca de IA. Inscripciones abiertas hasta el 30 de junio.",
    images: [OG_IMG],
  },
};

export default function ConcursoIALayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
