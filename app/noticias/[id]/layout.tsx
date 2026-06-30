// Cloudflare Pages requiere edge runtime para rutas dinámicas
export const runtime = "edge";

export default function NoticiaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
