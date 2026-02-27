"use client";

export default function TerminosYPrivacidad() {
  return (
    <section className="bg-[#FBFBFD] py-24 border-t border-gray-100 overflow-hidden relative min-h-screen">
      <div className="max-w-[1400px] mx-auto px-6">
        
        {/* HEADER */}
        <div className="text-center mb-16 relative z-10">
          <h2 style={{ fontFamily: "'Oswald', sans-serif" }} className="text-[clamp(2.5rem,5vw,4.5rem)] text-[#1D1D1F] font-black uppercase leading-[0.9] mb-6">
            TÉRMINOS Y <span className="text-[#6F2C91]">POLÍTICAS</span>
          </h2>

          <div className="inline-block px-8 py-3 bg-[#EAE84B] text-[#6F2C91] font-black text-xl md:text-3xl rounded-2xl shadow-sm -rotate-1 transform">
            MEMORÁNDUM JURÍDICO
          </div>

          <p className="max-w-[750px] mx-auto mt-8 text-[#86868B] text-lg md:text-xl leading-relaxed font-medium">
            Transparencia y protección en el manejo de tu información y uso de nuestros canales de atención ciudadana.
          </p>
        </div>

        {/* CONTENIDO LEGAL */}
        <div className="max-w-[900px] mx-auto bg-white p-6 md:p-14 rounded-[2.5rem] md:rounded-[3rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] relative overflow-hidden z-10">
          {/* Barra decorativa superior */}
          <div className="absolute top-0 left-0 w-full h-2 md:h-3 bg-[#EAE84B]" />
          
          <div className="space-y-12 mt-4 text-[#1D1D1F]">
            
            {/* SECCIÓN 1 */}
            <section className="space-y-4">
              <h3 style={{ fontFamily: "'Oswald', sans-serif" }} className="text-2xl md:text-3xl font-bold text-[#6F2C91] uppercase tracking-wide flex items-center gap-3">
                <span className="bg-[#F5F5F7] p-3 rounded-xl text-[#1D1D1F]">1</span>
                Sobre buzón de “quejas” y no denuncias
              </h3>
              
              <div className="space-y-4 text-base md:text-lg text-gray-700 leading-relaxed font-medium bg-[#F5F5F7] p-6 md:p-8 rounded-2xl border border-gray-100">
                <p>
                  El presente buzón de quejas tiene un carácter informativo y administrativo. Su uso no sustituye, reemplaza ni cumple con la obligación legal que tiene toda persona de presentar denuncias o acciones formales a través de los canales oficiales de la Fiscalía General del Estado del Ecuador u otras autoridades competentes, conforme a la normativa legal vigente.
                </p>
                <p>
                  Las comunicaciones recibidas por este medio no constituyen una denuncia penal, ni generan por sí mismas el inicio de procesos judiciales, administrativos o investigativos ante la autoridad competente.
                </p>
                <p>
                  En caso de que los hechos descritos puedan constituir una infracción penal o requieran intervención legal, el usuario es responsable de realizar la denuncia correspondiente directamente ante la Fiscalía General del Estado, utilizando los mecanismos oficiales como el siguiente enlace:
                </p>
                <a 
                  href="https://www.fiscalia.gob.ec/accesibilidad/servicios-fge/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-block mt-2 text-[#6F2C91] underline font-bold hover:text-[#5a2376] break-all bg-white px-4 py-2 rounded-lg border border-purple-100 shadow-sm"
                >
                  https://www.fiscalia.gob.ec/accesibilidad/servicios-fge/
                </a>
              </div>
            </section>

            {/* SECCIÓN 2 */}
            <section className="space-y-4">
              <h3 style={{ fontFamily: "'Oswald', sans-serif" }} className="text-2xl md:text-3xl font-bold text-[#6F2C91] uppercase tracking-wide flex items-center gap-3">
                <span className="bg-[#F5F5F7] p-3 rounded-xl text-[#1D1D1F]">2</span>
               Sobre Datos Personales
              </h3>
              
              <div className="space-y-4 text-base md:text-lg text-gray-700 leading-relaxed font-medium bg-[#F5F5F7] p-6 md:p-8 rounded-2xl border border-gray-100">
                <p>
                  En cumplimiento de la Ley Orgánica de Protección de Datos Personales, al proporcionar mis datos personales a través de este sitio web, autorizo de manera libre, expresa, informada e inequívoca al despacho de la Asambleísta Valentina Centeno de a recopilar, almacenar, usar, procesar y, de ser necesario, actualizar mis datos personales.
                </p>
                <p>
                  Los datos proporcionados serán utilizados exclusivamente para fines de gestión legislativa, comunicación institucional, atención ciudadana, seguimiento de solicitudes, actividades de participación ciudadana y demás funciones propias del ejercicio legislativo, y no serán destinados a fines distintos a los aquí señalados.
                </p>
                <p>
                  El titular de los datos declara que la información proporcionada es veraz, exacta y actualizada, y conoce que puede ejercer sus derechos de acceso, rectificación, actualización, eliminación, oposición y portabilidad, conforme a la normativa vigente, mediante solicitud dirigida a los canales oficiales habilitados para tal efecto. Los datos personales no serán transferidos ni comunicados a terceros, salvo en los casos permitidos o exigidos por la ley.
                </p>
              </div>
            </section>

          </div>

          {/* BADGES DE CONFIANZA (UX) */}
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 text-gray-400 text-xs font-bold pt-10 border-t border-gray-100 mt-12">
            <div className="flex items-center gap-2">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg> 
              ENTORNO SEGURO
            </div>
            <span className="hidden md:block text-gray-300">•</span>
            <div className="flex items-center gap-2">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"></path></svg>
              PRIVACIDAD GARANTIZADA
            </div>
          </div>

        </div>
      </div>
      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Oswald:wght@700&display=swap');
      `}</style>
    </section>
  );
}