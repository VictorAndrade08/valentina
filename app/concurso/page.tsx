"use client";

import { useState, useRef, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

// Credenciales de Supabase
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://jcuromipofksetcixkyu.supabase.co";
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY || "sb_publishable_wAiUv2aZWqYQDLcYqDf-Q_CPJnB2As";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

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
  const [isDragging, setIsDragging] = useState(false);
  const [maxDate, setMaxDate] = useState(""); 

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

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    setMaxDate(today);
  }, []);

  const onlyLetters = (value: string) =>
    value.replace(/[^a-zA-ZÁÉÍÓÚáéíóúÑñüÜ\s]/g, "");

  const onlyNumbers = (value: string) =>
    value.replace(/[^0-9]/g, "");

  const onlyPhoneChars = (value: string) =>
    value.replace(/[^0-9+]/g, "");

  const handleChange =
    (field: keyof ConcursoState, mode: "text" | "letters" | "numbers" | "phone" | "date" = "text") =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      let value = e.target.value;
      if (mode === "letters") value = onlyLetters(value);
      if (mode === "numbers") value = onlyNumbers(value);
      if (mode === "phone") value = onlyPhoneChars(value);
      setFormState((prev) => ({ ...prev, [field]: value }));
    };

  const processFile = (file: File) => {
    const validExtensions = /\.(doc|docx|mp4)$/i;
    if (!validExtensions.test(file.name)) {
      alert("Solo se permiten documentos Word (.doc, .docx) o videos (.mp4).");
      clearFile();
      return;
    }
    
    if (file.size > 100 * 1024 * 1024) {
      alert("El archivo supera el límite de 100MB.");
      clearFile();
      return;
    }
    
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(file);
    if (fileInputRef.current) {
      fileInputRef.current.files = dataTransfer.files;
    }
    setFileName(file.name);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      clearFile();
      return;
    }
    processFile(file);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
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

    if (!nombres || !cedula || !edad || !cantonParroquia || !direccion || !telefono || !correo || !redesSociales || !ocupacion || !institucion || !areaInteres || !tituloProyecto || !linkProyecto) {
      alert("Por favor completa todos los campos obligatorios y pega el enlace de tu proyecto.");
      return;
    }

    if (!acceptedTerms) {
      setShowTermsError(true);
      return;
    }

    setLoading(true);
    
    try {
      // Inserción directa en Supabase (Más rápido)
      const { error } = await supabase
        .from('proyectos')
        .insert([formState]);

      if (error) {
        throw new Error(`Fallo en la base de datos: ${error.message}`);
      } else {
        alert("¡Excelente! Tu proyecto ha sido registrado con éxito.");
        setFormState({
          nombres: "", cedula: "", edad: "", cantonParroquia: "", direccion: "", telefono: "", 
          correo: "", redesSociales: "", ocupacion: "", institucion: "", areaInteres: "", tituloProyecto: "", linkProyecto: ""
        });
        clearFile();
        setAcceptedTerms(false);
        setShowTermsError(false);
      }
      
    } catch (error: any) {
      console.error("Error crítico:", error);
      alert(`Hubo un error al conectar: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="concurso-form" className="bg-[#FBFBFD] py-24 border-t border-gray-100 overflow-hidden relative">
      <div className="max-w-[1400px] mx-auto px-6">
        
        <div className="max-w-[900px] mx-auto mb-16 rounded-[2rem] md:rounded-[3rem] overflow-hidden shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] relative z-10 border-4 md:border-8 border-white bg-white group cursor-default">
          <img 
            src="https://darkturquoise-capybara-951908.hostingersite.com/wp-content/uploads/2026/03/BannerAI.jpg.webp" 
            alt="Banner Concurso de Proyectos" 
            className="w-full h-auto object-cover transform transition-transform duration-700 group-hover:scale-[1.03]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent pointer-events-none" />
        </div>

        <div className="text-center mb-16 relative z-10">
          <h2 style={{ fontFamily: "'Oswald', sans-serif" }} className="text-[clamp(2.5rem,5vw,4.5rem)] text-[#1D1D1F] font-black uppercase leading-[0.9] mb-6">
            CONCURSO <span className="text-[#6F2C91]">REGISTRA TU PROYECTO</span>
          </h2>

          <div className="inline-block px-8 py-3 bg-[#EAE84B] text-[#6F2C91] font-black text-xl md:text-3xl rounded-2xl shadow-sm -rotate-1 transform">
            PARTICIPA Y GANA
          </div>

          <p className="max-w-[750px] mx-auto mt-8 text-[#86868B] text-lg md:text-xl leading-relaxed font-medium">
            Llena el formulario con tus datos y pega el link de tu video o documento (YouTube, Google Drive, etc.) para participar. Tu talento transforma Manabí.
          </p>
        </div>

        <div className="max-w-[900px] mx-auto bg-white p-6 md:p-14 rounded-[2.5rem] md:rounded-[3rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] relative overflow-hidden z-10">
          <div className="absolute top-0 left-0 w-full h-2 md:h-3 bg-[#EAE84B]" />
          
          <form onSubmit={handleSubmit} noValidate className="space-y-6 md:space-y-8 mt-4">
            
            <h3 style={{ fontFamily: "'Oswald', sans-serif" }} className="text-xl md:text-2xl text-[#6F2C91] uppercase mb-4 border-b-2 border-gray-100 pb-2">
              1. Datos Personales
            </h3>

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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
              <div className="space-y-2">
                <label className="form-label">
                  Fecha de Nacimiento <span className="text-red-500 font-bold">*</span>
                </label>
                <div className="relative">
                  <input
                    name="edad"
                    type="date"
                    required
                    max={maxDate}
                    value={formState.edad}
                    onChange={handleChange("edad", "date")}
                    className="form-input cursor-pointer appearance-none w-full"
                    style={{ color: formState.edad ? '#1D1D1F' : '#86868B' }}
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#6F2C91]">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                  </div>
                </div>
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

            <h3 style={{ fontFamily: "'Oswald', sans-serif" }} className="text-xl md:text-2xl text-[#6F2C91] uppercase mt-8 mb-4 border-b-2 border-gray-100 pb-2">
              2. Detalles del Proyecto
            </h3>

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

            <div className="space-y-4 pt-4">
              <label className="form-label text-[#86868B] flex items-center gap-2">
                Enlace de tu proyecto (YouTube / Drive) <span className="text-red-500 font-bold">*</span>
              </label>

              <div className="relative">
                <input
                  name="linkProyecto"
                  type="url"
                  required
                  placeholder="Pega aquí el enlace de tu proyecto (YouTube, Google Drive, etc.)"
                  value={formState.linkProyecto}
                  onChange={handleChange("linkProyecto")}
                  className="form-input"
                />
              </div>
              
              <div className="text-[10px] md:text-xs text-gray-500 italic mt-2 bg-gray-50 p-4 rounded-2xl border border-gray-100 leading-relaxed">
                ⚠️ <strong>Aviso Importante:</strong> Si el link es de <strong>Google Drive</strong>, asegúrate de que el archivo tenga los permisos como <strong>"Cualquier persona con el enlace puede ver"</strong>. De lo contrario, no podremos calificar tu proyecto.
              </div>
            </div>

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
                <span className={`text-sm leading-tight mt-1.5 ${showTermsError ? "text-red-600 font-medium" : "text-[#86868B]"}`}>
                  Declaro que la información es verídica y acepto las <a href="/politicasdeprivacidad" target="_blank" rel="noopener noreferrer" className="text-[#6F2C91] underline font-bold hover:text-[#5a2376]">Bases del Concurso</a> y las <a href="/politicasdeprivacidad" target="_blank" rel="noopener noreferrer" className="text-[#6F2C91] underline font-bold hover:text-[#5a2376]">Políticas de Privacidad</a>. <span className="text-red-500 font-bold">*</span>
                </span>
              </label>
              {showTermsError && (
                <span className="text-red-500 text-xs font-bold ml-11 animate-pulse">
                  Por favor, acepta los términos para continuar.
                </span>
              )}
            </div>

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

            <div className="flex items-center justify-center gap-2 text-gray-400 text-[10px] md:text-xs font-bold pt-6 border-t border-gray-100 mt-8">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg> TUS DATOS ESTÁN PROTEGIDOS Y SON CONFIDENCIALES
            </div>
          </form>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
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

        select.form-input {
          appearance: none;
          background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%236F2C91' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
          background-repeat: no-repeat;
          background-position: right 1rem center;
          background-size: 1.5em 1.5em;
        }

        input[type="date"]::-webkit-calendar-picker-indicator {
          opacity: 0;
          width: 100%;
          height: 100%;
          position: absolute;
          top: 0;
          left: 0;
          cursor: pointer;
        }
      `}} />
    </section>
  );
}