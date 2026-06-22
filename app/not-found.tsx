import Link from "next/link";

export const metadata = {
  title: "Página no encontrada | Valentina Centeno",
  description: "La página que buscás no existe o fue movida.",
};

export default function NotFound() {
  return (
    <div className="min-h-[70vh] w-full bg-[#6F2C91] text-white flex flex-col items-center justify-center px-6 py-16 text-center">
      <span className="inline-block bg-[#EAE84B] text-[#6F2C91] font-black uppercase tracking-widest text-xs md:text-sm px-5 py-2 rounded-full mb-6">
        Error 404
      </span>

      <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tight leading-none mb-6 max-w-2xl">
        Esta página no existe
      </h1>

      <p className="text-base md:text-lg text-white/80 max-w-md mb-10 leading-relaxed">
        La dirección que ingresaste no se encuentra en nuestro sitio. Volvé al
        inicio y seguí explorando.
      </p>

      <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
        <Link
          href="/"
          className="flex-1 bg-[#EAE84B] text-[#6F2C91] font-bold uppercase tracking-widest text-sm md:text-base px-8 py-4 rounded-full hover:bg-white transition-colors text-center min-h-[48px] flex items-center justify-center"
        >
          Volver al Inicio
        </Link>
        <Link
          href="/#buzon"
          className="flex-1 bg-white/10 text-white border-2 border-white/40 font-bold uppercase tracking-widest text-sm md:text-base px-8 py-4 rounded-full hover:bg-white/20 transition-colors text-center min-h-[48px] flex items-center justify-center"
        >
          Contactar
        </Link>
      </div>
    </div>
  );
}
