/**
 * safeImageUrl — filtra URLs que NO queremos servir (perf + privacy).
 *
 * Las tablas del CMS (cms_textos, cms_logros, cms_noticias, etc.) pueden
 * tener URLs viejas a hostingersite.com (15+ MB por archivo). Si las
 * dejamos pasar, el sitio descarga 28+ MB por visita → LCP > 13 s.
 *
 * Reglas:
 *  · OK: rutas locales (/imagenes/...) y Supabase Storage
 *  · BLOQUEADAS: dominios externos pesados (hostingersite, placeholder, etc.)
 *
 * Devuelve null cuando la URL no es segura → el componente cae al fallback
 * local sin descargar nada externo.
 */

const BLOCKED_HOSTS = [
  "hostingersite.com",
  "via.placeholder.com",
  "placehold.co",
  "picsum.photos",
  "images.unsplash.com",
];

export function safeImageUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  const trimmed = String(url).trim();
  if (!trimmed) return null;

  // Rutas locales SIEMPRE OK
  if (trimmed.startsWith("/")) return trimmed;
  if (trimmed.startsWith("./")) return trimmed;

  // Data URIs OK (placeholders inline)
  if (trimmed.startsWith("data:")) return trimmed;

  // Cualquier otra debe ser http(s)
  try {
    const u = new URL(trimmed);
    // Bloqueamos dominios viejos / pesados
    if (BLOCKED_HOSTS.some((host) => u.hostname.includes(host))) {
      return null;
    }
    // Solo aceptamos Supabase (storage) o subdominios oficiales
    const isSupabase = u.hostname.includes("supabase.co");
    const isOwnDomain = u.hostname.includes("valentinacenteno.com.ec");
    if (isSupabase || isOwnDomain) return trimmed;

    // Cualquier otro → bloqueado por defecto (paranoia + perf)
    return null;
  } catch {
    return null;
  }
}
