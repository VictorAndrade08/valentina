import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Biografía — Valentina Centeno",
  description:
    "Asambleísta del Ecuador. Trayectoria, compromiso y propuestas por un país más justo desde la Asamblea Nacional.",
  keywords: [
    "Valentina Centeno",
    "Asambleísta Ecuador",
    "Biografía",
    "Manabí",
    "Política Ecuador",
  ],
  openGraph: {
    title: "Biografía — Valentina Centeno",
    description:
      "Conocé la trayectoria y el compromiso de Valentina Centeno por el Ecuador.",
    url: "/biografia",
    siteName: "Valentina Centeno",
    locale: "es_EC",
    type: "profile",
  },
  twitter: {
    card: "summary_large_image",
    title: "Biografía — Valentina Centeno",
    description:
      "Conocé la trayectoria y el compromiso de Valentina Centeno por el Ecuador.",
  },
};

export default function BiografiaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
