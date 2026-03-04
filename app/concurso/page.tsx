"use client";

import { useState, useRef } from "react";

type ConcursoState = {
  nombres: string;
  cedula: string;
  edad: string;
  cantonParroquia: string;
  direccion: string;
  telefono: string;
  correo: string;
  redesSociales: string;
  ocupacion: string;
  institucion: string;
  areaInteres: string;
  tituloProyecto: string;
  linkProyecto: string;
};

export default function ConcursoForm() {
  const [loading, setLoading] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showTermsError, setShowTermsError] = useState(false);
  const [formState, setFormState] = useState<ConcursoState>({
    nombres: "",
    cedula: "",
    edad: "",
    cantonParroquia: "",
    direccion: "",
    telefono: "",
    correo: "",
    redesSociales: "",
    ocupacion: "",
    institucion: "",
    areaInteres: "",
    tituloProyecto: "",
    linkProyecto: "",
  });
  
  const [fileName, setFileName] = useState<string>("Ningún archivo seleccionado");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const onlyLetters = (value: string) =>
    value.replace(/[^a-zA-ZÁÉÍÓÚáéíóúÑñüÜ\s]/g, "");

  const onlyNumbers = (value: string) =>
    value.replace(/[^0-9]/g, "");

  const onlyPhoneChars = (value: string) =>
    value.replace(/[^0-9+]/g, "");

  const handleChange =
    (field: keyof ConcursoState, mode: "text" | "letters" | "numbers" | "phone" = "text") =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      let value = e.target.value;
      if (mode === "letters") value = onlyLetters(value);
      if (mode === "numbers") value = onlyNumbers(value);
      if (mode === "phone") value = onlyPhoneChars(value);
      setFormState((prev) => ({ ...prev, [field]: value }));
    };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      setFileName("Ningún archivo seleccionado");
      return;
    }
    
    // Validar extensiones Word o MP4
    const validExtensions = /\.(doc|docx|mp4)$/i;
    if (!validExtensions.test(file.name)) {
      alert("Solo se permiten documentos Word (.doc, .docx) o videos (.mp4).");
      e.target.value = "";
      setFileName("Ningún archivo seleccionado");
      return;
    }
    
    // Limite de 50MB (Ideal para videos cortos mp4)
    if (file.size > 50 * 1024 * 1024) {
      alert("El archivo supera el límite de 50MB.");
      e.target.value = "";
      setFileName("Ningún archivo seleccionado");
      return;
    }
    setFileName(file.name);
  };

  const clearFile = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setFileName("Ningún archivo seleccionado");
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (loading) return;
    
    const { 
      nombres, cedula, edad, cantonParroquia, direccion, telefono, 
      correo, redesSociales, ocupacion, institucion, areaInteres, tituloProyecto, linkProyecto 
    } = formState;

    // Validación estricta de TODOS los campos obligatorios
    if (!nombres || !cedula || !edad || !cantonParroquia || !direccion || !telefono || !correo || !redesSociales || !ocupacion || !institucion || !areaInteres || !tituloProyecto) {
      alert("Por favor completa todos los campos obligatorios antes de enviar.");
      return;
    }

    // Validación inteligente: Obliga a subir un archivo O pegar un enlace
    const hasFile = fileInputRef.current?.files && fileInputRef.current.files.length > 0;
    if (!hasFile && !linkProyecto.trim()) {
      alert("Por favor, adjunta el archivo de tu proyecto o proporciona un enlace válido.");
      return;
    }

    if (!acceptedTerms) {
      setShowTermsError(true);
      return;
    }

    setLoading(true);
    const formElement = e.currentTarget;
    
    try {
      // SIMULACIÓN DE ENVÍO: Espera 2 segundos para mostrar el estado de carga
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulamos que la respuesta del servidor fue exitosa
      const data = { status: "ok" };

      if (data.status === "ok") {
        alert("¡Excelente! Tu proyecto ha sido registrado con éxito.");
        formElement.reset();
        setFormState({
          nombres: "", cedula: "", edad: "", cantonParroquia: "", direccion: "", telefono: "", 
          correo: "", redesSociales: "", ocupacion: "", institucion: "", areaInteres: "", tituloProyecto: "", linkProyecto: ""
        });
        clearFile();
        setAcceptedTerms(false);
        setShowTermsError(false);
      } else {
        alert("Error: Simulación fallida.");
      }
    } catch (error) {
      alert("Error enviando los datos. Por favor intenta nuevamente.");
    }
    setLoading(false);
  };

  return (
    <section id="concurso-form" className="bg-[#FBFBFD] py-24 border-t border-gray-100 overflow-hidden relative">
      <div className="max-w-[1400px] mx-auto px-6">
        
        {/* BANNER DEL CONCURSO (NUEVO - INICIO) */}
        <div className="max-w-[900px] mx-auto mb-16 rounded-[2rem] md:rounded-[3rem] overflow-hidden shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] relative z-10 border-4 md:border-8 border-white bg-white group cursor-default">
          <img 
            src="https://darkturquoise-capybara-951908.hostingersite.com/wp-content/uploads/2026/03/BannerAI.jpg.webp" 
            alt="Banner Concurso de Proyectos" 
            className="w-full h-auto object-cover transform transition-transform duration-700 group-hover:scale-[1.03]"
          />
          {/* Sutil overlay de degradado para mejor integración */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent pointer-events-none" />
        </div>

        {/* HEADER */}
        <div className="text-center mb-16 relative z-10">
          <h2 style={{ fontFamily: "'Oswald', sans-serif" }} className="text-[clamp(2.5rem,5vw,4.5rem)] text-[#1D1D1F] font-black uppercase leading-[0.9] mb-6">
            CONCURSO <span className="text-[#6F2C91]">REGISTRA TU PROYECTO</span>
          </h2>

          <div className="inline-block px-8 py-3 bg-[#EAE84B] text-[#6F2C91] font-black text-xl md:text-3xl rounded-2xl shadow-sm -rotate-1 transform">
            PARTICIPA Y GANA
          </div>

          <p className="max-w-[750px] mx-auto mt-8 text-[#86868B] text-lg md:text-xl leading-relaxed font-medium">
            Llena el formulario con tus datos y los detalles de tu proyecto para participar en nuestra convocatoria. Tu talento transforma Manabí.
          </p>
        </div>

        {/* FORMULARIO */}
        <div className="max-w-[900px] mx-auto bg-white p-6 md:p-14 rounded-[2.5rem] md:rounded-[3rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] relative overflow-hidden z-10">
          {/* Barra decorativa superior */}
          <div className="absolute top-0 left-0 w-full h-2 md:h-3 bg-[#EAE84B]" />
          
          <form onSubmit={handleSubmit} encType="multipart/form-data" noValidate className="space-y-6 md:space-y-8 mt-4">
            
            {/* Título de Sección */}
            <h3 style={{ fontFamily: "'Oswald', sans-serif" }} className="text-xl md:text-2xl text-[#6F2C91] uppercase mb-4 border-b-2 border-gray-100 pb-2">
              1. Datos Personales
            </h3>

            {/* Fila 1: Nombres y Cédula */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
              <div className="space-y-2">
                <label className="form-label flex items-center gap-2">
                   Nombres y apellidos <span className="text-red-500 font-bold">*</span>
                </label>
                <input
                  name="nombres"
                  type="text"
                  required
                  placeholder="Tu nombre completo"
                  value={formState.nombres}
                  onChange={handleChange("nombres", "letters")}
                  className="form-input"
                  autoComplete="name"
                />
              </div>

              <div className="space-y-2">
                <label className="form-label">
                  Cédula / ID <span className="text-red-500 font-bold">*</span>
                </label>
                <input
                  name="cedula"
                  type="text"
                  maxLength={10}
                  required
                  placeholder="Número de identificación"
                  value={formState.cedula}
                  onChange={handleChange("cedula", "numbers")}
                  className="form-input"
                />
              </div>
            </div>

            {/* Fila 2: Edad y Teléfono */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
              <div className="space-y-2">
                <label className="form-label">
                  Edad o Fecha de Nacimiento <span className="text-red-500 font-bold">*</span>
                </label>
                <input
                  name="edad"
                  type="text"
                  required
                  placeholder="Ej: 24 años o 15/05/2000"
                  value={formState.edad}
                  onChange={handleChange("edad")}
                  className="form-input"
                />
              </div>

              <div className="space-y-2">
                <label className="form-label">
                  Teléfono / WhatsApp <span className="text-red-500 font-bold">*</span>
                </label>
                <input
                  name="telefono"
                  type="tel"
                  inputMode="numeric"
                  maxLength={13}
                  required
                  placeholder="099..."
                  value={formState.telefono}
                  onChange={handleChange("telefono", "phone")}
                  className="form-input"
                  autoComplete="tel"
                />
              </div>
            </div>

            {/* Fila 3: Cantón y Ciudad */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
              <div className="space-y-2">
                <label className="form-label flex items-center gap-2">
                   Cantón / Parroquia (Manabí) <span className="text-red-500 font-bold">*</span>
                </label>
                <input
                  name="cantonParroquia"
                  type="text"
                  required
                  placeholder="Ej: Portoviejo, Picoazá"
                  value={formState.cantonParroquia}
                  onChange={handleChange("cantonParroquia", "letters")}
                  className="form-input"
                />
              </div>

              <div className="space-y-2">
                <label className="form-label">
                  Ciudad / Dirección Referencial <span className="text-red-500 font-bold">*</span>
                </label>
                <input
                  name="direccion"
                  type="text"
                  required
                  placeholder="Tu dirección actual"
                  value={formState.direccion}
                  onChange={handleChange("direccion")}
                  className="form-input"
                />
              </div>
            </div>

            {/* Fila 4: Correo y Redes Sociales */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
              <div className="space-y-2">
                <label className="form-label flex items-center gap-2">
                  Correo electrónico <span className="text-red-500 font-bold">*</span>
                </label>
                <input
                  name="correo"
                  type="email"
                  required
                  placeholder="ejemplo@correo.com"
                  value={formState.correo}
                  onChange={handleChange("correo")}
                  className="form-input"
                  autoComplete="email"
                />
              </div>

              <div className="space-y-2">
                <label className="form-label flex items-center gap-2">
                  Usuario Instagram/TikTok <span className="text-red-500 font-bold">*</span>
                </label>
                <input
                  name="redesSociales"
                  type="text"
                  required
                  placeholder="@usuario"
                  value={formState.redesSociales}
                  onChange={handleChange("redesSociales")}
                  className="form-input"
                />
              </div>
            </div>

            {/* Fila 5: Ocupación e Institución */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
              <div className="space-y-2">
                <label className="form-label">
                  Ocupación <span className="text-red-500 font-bold">*</span>
                </label>
                <select
                  name="ocupacion"
                  required
                  value={formState.ocupacion}
                  onChange={handleChange("ocupacion")}
                  className="form-input cursor-pointer"
                >
                  <option value="" disabled hidden>Selecciona tu ocupación</option>
                  <option value="Estudiante">Estudiante</option>
                  <option value="Emprendedor">Emprendedor</option>
                  <option value="Profesional">Profesional</option>
                  <option value="Otro">Otro</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="form-label flex items-center gap-2">
                  Institución (Colegio/Universidad) <span className="text-red-500 font-bold">*</span>
                </label>
                <input
                  name="institucion"
                  type="text"
                  required
                  placeholder="Nombre de la institución"
                  value={formState.institucion}
                  onChange={handleChange("institucion")}
                  className="form-input"
                />
              </div>
            </div>

            {/* Título de Sección Proyecto */}
            <h3 style={{ fontFamily: "'Oswald', sans-serif" }} className="text-xl md:text-2xl text-[#6F2C91] uppercase mt-8 mb-4 border-b-2 border-gray-100 pb-2">
              2. Detalles del Proyecto
            </h3>

            {/* Fila 6: Área de Interés y Título Proyecto */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
              <div className="space-y-2">
                <label className="form-label">
                  Área de interés <span className="text-red-500 font-bold">*</span>
                </label>
                <select
                  name="areaInteres"
                  required
                  value={formState.areaInteres}
                  onChange={handleChange("areaInteres")}
                  className="form-input cursor-pointer"
                >
                  <option value="" disabled hidden>Selecciona un área</option>
                  <option value="Tecnología">Tecnología e Innovación</option>
                  <option value="Educación">Educación</option>
                  <option value="Salud">Salud y Bienestar</option>
                  <option value="Turismo">Turismo y Cultura</option>
                  <option value="Ambiente">Medio Ambiente</option>
                  <option value="Empleo">Empleo y Emprendimiento</option>
                  <option value="Otro">Otro</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="form-label">
                  Título del proyecto <span className="text-red-500 font-bold">*</span>
                </label>
                <input
                  name="tituloProyecto"
                  type="text"
                  required
                  placeholder="Nombre de tu idea o proyecto"
                  value={formState.tituloProyecto}
                  onChange={handleChange("tituloProyecto")}
                  className="form-input"
                />
              </div>
            </div>

            {/* ZONA DE ARCHIVO REDISEÑADA CON OPCIÓN DE ENLACE */}
            <div className="space-y-4 pt-4">
              <label className="form-label text-[#86868B] flex items-center gap-2">
                Adjuntar Proyecto o Enlace <span className="text-red-500 font-bold">*</span> <span className="text-xs font-normal opacity-70">(Elige una opción)</span>
              </label>

              {/* Opción 1: Archivo */}
              <div className="flex flex-col sm:flex-row items-stretch gap-4">
                <label className="flex-none flex items-center justify-center gap-2 px-6 py-4 bg-[#6F2C91] text-white rounded-2xl cursor-pointer hover:bg-[#5a2376] transition-all font-bold shadow-lg shadow-purple-200/50 active:scale-95 group">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 group-hover:rotate-45 transition-transform"><path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48"></path></svg> 
                  Subir Archivo
                  <input
                    ref={fileInputRef}
                    name="archivo"
                    type="file"
                    accept=".doc,.docx,video/mp4"
                    className="hidden"
                    onChange={handleFileChange}
                    // Nota: Se elimina 'required' de aquí porque el usuario puede preferir enviar un enlace en su lugar.
                  />
                </label>

                <div className="flex-1 flex items-center justify-between px-5 py-4 bg-[#F5F5F7] rounded-2xl border-2 border-dashed border-gray-300 text-gray-500 text-sm font-medium">
                  <span className="truncate max-w-[200px] md:max-w-xs">{fileName}</span>
                  {fileName !== "Ningún archivo seleccionado" && (
                    <button
                      type="button"
                      onClick={clearFile}
                      className="w-9 h-9 flex-none flex items-center justify-center rounded-full bg-white text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-sm border border-gray-100"
                      title="Eliminar archivo"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                    </button>
                  )}
                </div>
              </div>

              {/* Opción 2: Enlace */}
              <div className="relative">
                <input
                  name="linkProyecto"
                  type="url"
                  placeholder="O pega el enlace de tu proyecto aquí (Google Drive, YouTube, etc.)"
                  value={formState.linkProyecto}
                  onChange={handleChange("linkProyecto")}
                  className="form-input"
                />
              </div>
            </div>

            {/* CHECKBOX TÉRMINOS Y CONDICIONES */}
            <div className="pt-6 flex flex-col gap-1">
              <label className="flex items-start gap-3 cursor-pointer group p-1 -ml-1 rounded-lg hover:bg-gray-50 transition-colors">
                <input
                  type="checkbox"
                  id="terms"
                  required
                  checked={acceptedTerms}
                  onChange={(e) => {
                    setAcceptedTerms(e.target.checked);
                    if (e.target.checked) setShowTermsError(false);
                  }}
                  className={`flex-none w-8 h-8 rounded text-[#6F2C91] focus:ring-[#6F2C91] cursor-pointer transition-all ${showTermsError ? "border-red-500 ring-2 ring-red-200" : "border-gray-300"}`}
                />
                <span className={`text-sm leading-tight transition-colors mt-1.5 ${showTermsError ? "text-red-600 font-medium" : "text-[#86868B]"}`}>
                  Declaro que la información proporcionada es verídica y acepto las <a href="/politicasdeprivacidad" target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="text-[#6F2C91] underline font-bold hover:text-[#5a2376]">Bases del Concurso</a> y las <a href="/politicasdeprivacidad" target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="text-[#6F2C91] underline font-bold hover:text-[#5a2376]">Políticas de Privacidad</a>. <span className="text-red-500 font-bold">*</span>
                </span>
              </label>
              {showTermsError && (
                <span className="text-red-500 text-xs font-bold ml-11 animate-pulse">
                  Por favor, acepta los términos para continuar.
                </span>
              )}
            </div>

            {/* BOTÓN REFORZADO */}
            <div className="pt-4">
                <button
                type="submit"
                disabled={loading}
                className={`group relative w-full py-5 rounded-[1.5rem] text-xl font-black uppercase tracking-widest transition-all duration-300 shadow-xl overflow-hidden ${
                    loading
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                    : "bg-[#1D1D1F] text-[#EAE84B] hover:bg-[#6F2C91] hover:text-white hover:scale-[1.01] active:scale-[0.99] shadow-lg"
                }`}
                >
                <div className="relative z-10 flex items-center justify-center gap-3">
                    {loading ? (
                        <>
                            <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                            REGISTRANDO...
                        </>
                    ) : (
                        <>
                            ENVIAR PROYECTO
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity -ml-6 group-hover:ml-0"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                        </>
                    )}
                </div>
                </button>
            </div>

            {loading && (
              <p className="text-center text-sm text-[#6F2C91] font-bold animate-pulse">
                Procesando envío de tu proyecto, por favor no recargues la página...
              </p>
            )}

            <div className="flex items-center justify-center gap-2 text-gray-400 text-[10px] md:text-xs font-bold pt-6 border-t border-gray-100 mt-8">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg> TUS DATOS ESTÁN PROTEGIDOS Y SON CONFIDENCIALES
            </div>
          </form>
        </div>
      </div>

      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Oswald:wght@700&display=swap');

        .form-label {
          font-family: var(--font-boruino), sans-serif;
          color: #1D1D1F;
          font-size: 0.9rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .form-input {
          width: 100%;
          padding: 1rem 1.25rem;
          border: 2px solid #F5F5F7;
          border-radius: 1rem;
          font-size: 1rem;
          background: #F5F5F7;
          color: #1D1D1F;
          outline: none;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .form-input::placeholder {
          color: #86868B;
          opacity: 0.6;
        }

        .form-input:focus {
          background: white;
          border-color: #6F2C91;
          box-shadow: 0 4px 20px rgba(111,44,145,0.05);
        }

        .form-input:hover:not(:focus) {
          border-color: #e5e7eb;
        }

        select.form-input {
          appearance: none;
          background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%236F2C91' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
          background-repeat: no-repeat;
          background-position: right 1rem center;
          background-size: 1.5em 1.5em;
        }
      `}</style>
    </section>
  );
}