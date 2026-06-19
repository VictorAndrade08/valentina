"use client";

import { useEffect } from "react";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // En producción esto debería ir a un servicio (Sentry, LogRocket, etc.).
    console.error("[ErrorBoundary]", error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#6F2C91] text-white px-6 py-16">
      <div className="max-w-md w-full text-center">
        <div className="inline-block px-4 py-1.5 rounded-full bg-[#EAE84B] text-[#6F2C91] font-bold text-xs uppercase tracking-widest mb-6">
          Error
        </div>
        <h1
          style={{ fontFamily: "'Oswald', sans-serif" }}
          className="text-5xl md:text-6xl font-black uppercase leading-tight mb-4"
        >
          Algo salió mal
        </h1>
        <p className="text-white/80 text-lg mb-8 leading-relaxed">
          Tuvimos un problema cargando esta página. Estamos al tanto y vamos a
          resolverlo a la brevedad.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => reset()}
            className="px-8 py-3 rounded-2xl bg-[#EAE84B] text-[#6F2C91] font-black uppercase tracking-widest text-sm hover:bg-white transition-all shadow-xl active:scale-95"
          >
            Intentar de nuevo
          </button>
          <a
            href="/"
            className="px-8 py-3 rounded-2xl bg-white/10 text-white font-black uppercase tracking-widest text-sm hover:bg-white/20 transition-all backdrop-blur-sm"
          >
            Volver al inicio
          </a>
        </div>
      </div>
    </div>
  );
}
