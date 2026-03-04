"use client";

import React from 'react';

export default function BasesPage() {
  return (
    <main className="bg-[#FBFBFD] min-h-screen pb-24 font-sans selection:bg-[#EAE84B] selection:text-[#6F2C91]">
      
      {/* Importación de la fuente Oswald */}
      <style dangerouslySetInnerHTML={{ __html: `@import url('https://fonts.googleapis.com/css2?family=Oswald:wght@500;700;900&display=swap');` }} />

      {/* Hero Section - Estilo extraído de la web oficial */}
      <section className="relative pt-20 pb-16 px-6 overflow-hidden flex flex-col items-center text-center">
        {/* Elemento decorativo de fondo sutil */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[800px] h-[300px] bg-gradient-to-b from-[#f3e8f8] to-transparent opacity-50 pointer-events-none rounded-b-full"></div>

        <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center">
          <h1 className="flex flex-col items-center justify-center mb-6 leading-none">
            <span style={{ fontFamily: "'Oswald', sans-serif" }} className="text-3xl md:text-5xl text-[#1D1D1F] font-black uppercase tracking-wide">
              Bases del
            </span>
            <span style={{ fontFamily: "'Oswald', sans-serif" }} className="text-6xl md:text-8xl text-[#6F2C91] font-black uppercase tracking-tighter mt-[-5px] md:mt-[-10px]">
              Concurso
            </span>
          </h1>

          <div className="inline-flex items-center justify-center px-6 py-3 bg-[#EAE84B] text-[#6F2C91] font-bold rounded-full shadow-[0_8px_20px_rgba(234,232,75,0.4)] text-xs md:text-sm uppercase tracking-widest max-w-2xl text-center">
            Concurso Manabí: Becas 100% – Curso de Fundamentos de Inteligencia Artificial Generativa (UNIR)
          </div>
        </div>
      </section>

      {/* Contenedor Principal (Grid de Tarjetas) */}
      <section className="max-w-[1200px] mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">

          {/* 1 */}
          <div className="bg-white rounded-[2rem] shadow-[0_10px_40px_-10px_rgba(0,0,0,0.05)] p-8 hover:shadow-[0_20px_50px_-10px_rgba(111,44,145,0.15)] transition-all duration-300 group flex flex-col">
            <div className="flex items-center gap-4 mb-5">
              <div style={{ fontFamily: "'Oswald', sans-serif" }} className="w-12 h-12 rounded-[1rem] bg-[#f3e8f8] text-[#6F2C91] flex items-center justify-center text-2xl font-black group-hover:bg-[#6F2C91] group-hover:text-white transition-colors">
                1
              </div>
              <h2 style={{ fontFamily: "'Oswald', sans-serif" }} className="text-2xl text-[#1D1D1F] font-bold uppercase leading-tight">
                Objetivo del concurso
              </h2>
            </div>
            <p className="text-gray-600 font-medium leading-relaxed text-base flex-grow">
              Impulsar ideas innovadoras de jóvenes de Manabí que propongan el uso de herramientas de inteligencia artificial para mejorar su ciudad o la provincia, fortaleciendo sus habilidades con formación académica de calidad.
            </p>
          </div>

          {/* 2 */}
          <div className="bg-white rounded-[2rem] shadow-[0_10px_40px_-10px_rgba(0,0,0,0.05)] p-8 hover:shadow-[0_20px_50px_-10px_rgba(111,44,145,0.15)] transition-all duration-300 group flex flex-col">
            <div className="flex items-center gap-4 mb-5">
              <div style={{ fontFamily: "'Oswald', sans-serif" }} className="w-12 h-12 rounded-[1rem] bg-[#f3e8f8] text-[#6F2C91] flex items-center justify-center text-2xl font-black group-hover:bg-[#6F2C91] group-hover:text-white transition-colors">
                2
              </div>
              <h2 style={{ fontFamily: "'Oswald', sans-serif" }} className="text-2xl text-[#1D1D1F] font-bold uppercase leading-tight">
                Organiza y aliado
              </h2>
            </div>
            <ul className="space-y-4 text-gray-600 font-medium flex-grow">
              <li className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-[#EAE84B] mt-2 flex-shrink-0"></div>
                <span><strong className="text-[#1D1D1F]">Convoca:</strong> La asambleísta Valentina Centeno</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-[#EAE84B] mt-2 flex-shrink-0"></div>
                <span><strong className="text-[#1D1D1F]">Aliado académico:</strong> UNIR (becas 100% para formación)</span>
              </li>
            </ul>
          </div>

          {/* 3 */}
          <div className="bg-white rounded-[2rem] shadow-[0_10px_40px_-10px_rgba(0,0,0,0.05)] p-8 hover:shadow-[0_20px_50px_-10px_rgba(111,44,145,0.15)] transition-all duration-300 group flex flex-col md:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-4 mb-5">
              <div style={{ fontFamily: "'Oswald', sans-serif" }} className="w-12 h-12 rounded-[1rem] bg-[#f3e8f8] text-[#6F2C91] flex items-center justify-center text-2xl font-black group-hover:bg-[#6F2C91] group-hover:text-white transition-colors">
                3
              </div>
              <h2 style={{ fontFamily: "'Oswald', sans-serif" }} className="text-2xl text-[#1D1D1F] font-bold uppercase leading-tight">
                Quiénes pueden participar (requisitos)
              </h2>
            </div>
            <p className="text-gray-600 font-medium mb-3">Podrán participar personas que cumplan con lo siguiente:</p>
            <ul className="space-y-3 text-gray-600 font-medium flex-grow">
              <li className="flex items-start gap-3">
                <svg className="w-5 h-5 text-[#6F2C91] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"></path></svg>
                <span>Ser <strong>menor de 30 años</strong> al momento de postular.</span>
              </li>
              <li className="flex items-start gap-3">
                <svg className="w-5 h-5 text-[#6F2C91] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"></path></svg>
                <span>Residir en la provincia de <strong>Manabí</strong>.</span>
              </li>
              <li className="flex items-start gap-3">
                <svg className="w-5 h-5 text-[#6F2C91] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"></path></svg>
                <span>Completar la inscripción en la <strong>página web oficial</strong> (formulario).</span>
              </li>
              <li className="flex items-start gap-3">
                <svg className="w-5 h-5 text-[#6F2C91] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"></path></svg>
                <span>Presentar una propuesta original conforme al tema del concurso.</span>
              </li>
            </ul>
          </div>

          {/* 4 (Destacado) */}
          <div className="bg-[#1D1D1F] rounded-[2rem] shadow-2xl p-8 md:p-10 transition-all duration-300 md:col-span-2 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#6F2C91] opacity-20 blur-[80px] rounded-full pointer-events-none group-hover:opacity-40 transition-opacity"></div>
            
            <div className="flex items-center gap-4 mb-6 relative z-10">
              <div style={{ fontFamily: "'Oswald', sans-serif" }} className="w-12 h-12 rounded-[1rem] bg-[#EAE84B] text-[#1D1D1F] flex items-center justify-center text-2xl font-black">
                4
              </div>
              <h2 style={{ fontFamily: "'Oswald', sans-serif" }} className="text-2xl md:text-3xl text-white font-bold uppercase leading-tight">
                Tema del concurso
              </h2>
            </div>
            
            <div className="relative z-10 md:ml-16">
              <blockquote className="border-l-4 border-[#EAE84B] pl-5 md:pl-6 text-xl md:text-2xl text-white mb-6 font-light italic leading-snug">
                “¿Qué harías con herramientas de inteligencia artificial para mejorar tu ciudad o tu provincia?”
              </blockquote>
              <p className="text-gray-400 font-medium text-base md:text-lg">
                La propuesta puede enfocarse, por ejemplo, en: educación, empleo, turismo, salud, ambiente, servicios públicos, emprendimiento, movilidad, atención ciudadana.
              </p>
            </div>
          </div>

          {/* 5 */}
          <div className="bg-white rounded-[2rem] shadow-[0_10px_40px_-10px_rgba(0,0,0,0.05)] p-8 hover:shadow-[0_20px_50px_-10px_rgba(111,44,145,0.15)] transition-all duration-300 group flex flex-col">
            <div className="flex items-center gap-4 mb-5">
              <div style={{ fontFamily: "'Oswald', sans-serif" }} className="w-12 h-12 rounded-[1rem] bg-[#f3e8f8] text-[#6F2C91] flex items-center justify-center text-2xl font-black group-hover:bg-[#6F2C91] group-hover:text-white transition-colors">
                5
              </div>
              <h2 style={{ fontFamily: "'Oswald', sans-serif" }} className="text-2xl text-[#1D1D1F] font-bold uppercase leading-tight">
                Cómo participar (inscripción y envío)
              </h2>
            </div>
            <p className="text-gray-600 font-medium mb-3">Para postular:</p>
            <ol className="space-y-4 text-gray-600 font-medium flex-grow counter-reset-list">
              <li className="flex items-start gap-3"><span className="text-[#6F2C91] font-black">1.</span> <span>Ingresar a la <strong>página web oficial</strong> de Valentina Centeno.</span></li>
              <li className="flex items-start gap-3"><span className="text-[#6F2C91] font-black">2.</span> <span>Llenar el formulario con datos completos y verídicos.</span></li>
              <li className="flex items-start gap-3"><span className="text-[#6F2C91] font-black">3.</span> <span>Enviar la propuesta del proyecto (en el mismo formulario).</span></li>
              <li className="flex items-start gap-3 bg-[#FBFBFD] p-3 rounded-xl border border-gray-100">
                <span className="text-gray-400 font-bold uppercase text-xs tracking-wider mt-0.5">Opcional:</span> 
                <span className="text-sm">Adjuntar enlaces o archivos de apoyo (video, PDF, presentación, prototipo, etc.).</span>
              </li>
            </ol>
          </div>

          {/* 6 */}
          <div className="bg-white rounded-[2rem] shadow-[0_10px_40px_-10px_rgba(0,0,0,0.05)] p-8 hover:shadow-[0_20px_50px_-10px_rgba(111,44,145,0.15)] transition-all duration-300 group flex flex-col">
            <div className="flex items-center gap-4 mb-5">
              <div style={{ fontFamily: "'Oswald', sans-serif" }} className="w-12 h-12 rounded-[1rem] bg-[#f3e8f8] text-[#6F2C91] flex items-center justify-center text-2xl font-black group-hover:bg-[#6F2C91] group-hover:text-white transition-colors">
                6
              </div>
              <h2 style={{ fontFamily: "'Oswald', sans-serif" }} className="text-2xl text-[#1D1D1F] font-bold uppercase leading-tight">
                Fecha límite
              </h2>
            </div>
            <div className="flex-grow flex flex-col justify-center">
              <div className="bg-[#FBFBFD] p-6 rounded-2xl border-2 border-[#f3e8f8] text-center group-hover:border-[#6F2C91] transition-colors">
                <p className="text-gray-500 font-bold uppercase tracking-widest text-xs mb-2">Plazo máximo para postular</p>
                <strong style={{ fontFamily: "'Oswald', sans-serif" }} className="text-3xl text-[#6F2C91] uppercase tracking-wide block">
                  15 DE MARZO
                </strong>
                <span className="text-gray-400 font-medium text-sm block mt-1">(Hasta las 23:59)</span>
              </div>
            </div>
          </div>

          {/* 7 */}
          <div className="bg-white rounded-[2rem] shadow-[0_10px_40px_-10px_rgba(0,0,0,0.05)] p-8 hover:shadow-[0_20px_50px_-10px_rgba(111,44,145,0.15)] transition-all duration-300 group flex flex-col md:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-4 mb-5">
              <div style={{ fontFamily: "'Oswald', sans-serif" }} className="w-12 h-12 rounded-[1rem] bg-[#f3e8f8] text-[#6F2C91] flex items-center justify-center text-2xl font-black group-hover:bg-[#6F2C91] group-hover:text-white transition-colors">
                7
              </div>
              <h2 style={{ fontFamily: "'Oswald', sans-serif" }} className="text-2xl text-[#1D1D1F] font-bold uppercase leading-tight">
                Formato propuesta
              </h2>
            </div>
            <ul className="flex flex-wrap gap-2 flex-grow content-start">
              {[
                "Título del proyecto", "Problema a resolver", "Solución con IA", 
                "Herramientas IA", "Población beneficiaria", "Estado del proyecto"
              ].map((item, i) => (
                <li key={i} className="bg-[#FBFBFD] border border-gray-100 text-gray-600 font-medium px-4 py-2 rounded-lg text-sm flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#6F2C91]"></div>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* 8 */}
          <div className="bg-white rounded-[2rem] shadow-[0_10px_40px_-10px_rgba(0,0,0,0.05)] p-8 hover:shadow-[0_20px_50px_-10px_rgba(111,44,145,0.15)] transition-all duration-300 group flex flex-col">
            <div className="flex items-center gap-4 mb-5">
              <div style={{ fontFamily: "'Oswald', sans-serif" }} className="w-12 h-12 rounded-[1rem] bg-[#f3e8f8] text-[#6F2C91] flex items-center justify-center text-2xl font-black group-hover:bg-[#6F2C91] group-hover:text-white transition-colors">
                8
              </div>
              <h2 style={{ fontFamily: "'Oswald', sans-serif" }} className="text-2xl text-[#1D1D1F] font-bold uppercase leading-tight">
                Evaluación
              </h2>
            </div>
            <ul className="space-y-3 text-gray-600 font-medium flex-grow">
              {["Impacto social", "Innovación", "Viabilidad", "Uso estratégico de IA", "Claridad de la propuesta"].map((item, i) => (
                <li key={i} className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-[#EAE84B] flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* 9 (Gran Premio - Identidad web) */}
          <div className="bg-gradient-to-br from-[#6F2C91] to-[#581c87] rounded-[2rem] shadow-[0_20px_50px_-10px_rgba(111,44,145,0.4)] p-8 md:p-10 transition-all duration-300 md:col-span-2 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 pointer-events-none"></div>
            
            <div className="flex items-center gap-4 mb-6 relative z-10">
              <div style={{ fontFamily: "'Oswald', sans-serif" }} className="w-12 h-12 rounded-[1rem] bg-[#EAE84B] text-[#6F2C91] flex items-center justify-center text-2xl font-black">
                9
              </div>
              <h2 style={{ fontFamily: "'Oswald', sans-serif" }} className="text-2xl md:text-3xl text-white font-bold uppercase leading-tight">
                Premio
              </h2>
            </div>
            
            <div className="relative z-10 md:ml-16 flex flex-col sm:flex-row items-center sm:items-start gap-6">
              <div style={{ fontFamily: "'Oswald', sans-serif" }} className="text-7xl md:text-8xl font-black text-[#EAE84B] leading-none drop-shadow-lg">
                20
              </div>
              <p className="text-white font-medium text-xl md:text-2xl leading-relaxed text-center sm:text-left">
                Becas <strong className="text-[#EAE84B] font-black underline decoration-2 underline-offset-4">100% gratuitas</strong> para el Curso de Fundamentos de Inteligencia Artificial Generativa (UNIR).
              </p>
            </div>
          </div>

          {/* 10 */}
          <div className="bg-white rounded-[2rem] shadow-[0_10px_40px_-10px_rgba(0,0,0,0.05)] p-8 hover:shadow-[0_20px_50px_-10px_rgba(111,44,145,0.15)] transition-all duration-300 group flex flex-col">
            <div className="flex items-center gap-4 mb-5">
              <div style={{ fontFamily: "'Oswald', sans-serif" }} className="w-12 h-12 rounded-[1rem] bg-[#f3e8f8] text-[#6F2C91] flex items-center justify-center text-2xl font-black group-hover:bg-[#6F2C91] group-hover:text-white transition-colors">
                10
              </div>
              <h2 style={{ fontFamily: "'Oswald', sans-serif" }} className="text-2xl text-[#1D1D1F] font-bold uppercase leading-tight">
                Selección
              </h2>
            </div>
            <ul className="space-y-3 text-gray-600 font-medium flex-grow">
              <li className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-[#6F2C91] mt-2 flex-shrink-0"></div>
                <span>La organización revisará las postulaciones.</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-[#6F2C91] mt-2 flex-shrink-0"></div>
                <span>Se contactará a ganadores o finalistas.</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-[#6F2C91] mt-2 flex-shrink-0"></div>
                <span>Los resultados podrán difundirse en canales oficiales.</span>
              </li>
            </ul>
          </div>

          {/* 11 */}
          <div className="bg-white rounded-[2rem] shadow-[0_10px_40px_-10px_rgba(0,0,0,0.05)] p-8 hover:shadow-[0_20px_50px_-10px_rgba(111,44,145,0.15)] transition-all duration-300 group flex flex-col">
            <div className="flex items-center gap-4 mb-5">
              <div style={{ fontFamily: "'Oswald', sans-serif" }} className="w-12 h-12 rounded-[1rem] bg-[#f3e8f8] text-[#6F2C91] flex items-center justify-center text-2xl font-black group-hover:bg-[#6F2C91] group-hover:text-white transition-colors">
                11
              </div>
              <h2 style={{ fontFamily: "'Oswald', sans-serif" }} className="text-2xl text-[#1D1D1F] font-bold uppercase leading-tight">
                Condiciones
              </h2>
            </div>
            <ul className="space-y-3 text-gray-600 font-medium flex-grow">
              {[
                "La participación es gratuita.",
                "Cada participante puede enviar una propuesta.",
                "Las propuestas deben ser originales.",
                "La organización puede validar información."
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#6F2C91] mt-2 flex-shrink-0"></div>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* 12 */}
          <div className="bg-white rounded-[2rem] shadow-[0_10px_40px_-10px_rgba(0,0,0,0.05)] p-8 hover:shadow-[0_20px_50px_-10px_rgba(111,44,145,0.15)] transition-all duration-300 group flex flex-col lg:col-span-1">
            <div className="flex items-center gap-4 mb-5">
              <div style={{ fontFamily: "'Oswald', sans-serif" }} className="w-12 h-12 rounded-[1rem] bg-[#f3e8f8] text-[#6F2C91] flex items-center justify-center text-2xl font-black group-hover:bg-[#6F2C91] group-hover:text-white transition-colors">
                12
              </div>
              <h2 style={{ fontFamily: "'Oswald', sans-serif" }} className="text-2xl text-[#1D1D1F] font-bold uppercase leading-tight">
                Protección de datos
              </h2>
            </div>
            <div className="flex flex-col gap-3 flex-grow">
              {[
                "Los datos se usarán únicamente para fines del concurso.",
                "El nombre y proyecto pueden mencionarse en difusión."
              ].map((item, i) => (
                <div key={i} className="bg-[#FBFBFD] p-4 rounded-xl flex items-start gap-3 border border-gray-50">
                  <svg className="w-5 h-5 text-[#6F2C91] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                  <span className="text-gray-600 font-medium text-sm">{item}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>
    </main>
  );
}