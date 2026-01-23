"use client";

import { useState, useRef } from "react";
import { Oswald } from "next/font/google";
import { FaPaperclip, FaTrash, FaCheckCircle, FaLock } from "react-icons/fa";

const oswald = Oswald({
  subsets: ["latin"],
  weight: ["700"],
});

type FormState = {
  nombre: string;
  canton: string;
  correo: string;
  whatsapp: string;
  asunto: string;
  mensaje: string;
};

export default function BuzonCiudadano() {
  const [loading, setLoading] = useState(false);
  const [formState, setFormState] = useState<FormState>({
    nombre: "",
    canton: "",
    correo: "",
    whatsapp: "",
    asunto: "",
    mensaje: "",
  });
  const [fileName, setFileName] = useState<string>(
    "Ningún archivo seleccionado"
  );
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const onlyLetters = (value: string) =>
    value.replace(/[^a-zA-ZÁÉÍÓÚáéíóúÑñüÜ\s]/g, "");

  const onlyPhoneChars = (value: string) =>
    value.replace(/[^0-9+]/g, "");

  const handleChange =
    (field: keyof FormState, mode: "text" | "letters" | "phone" = "text") =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      let value = e.target.value;
      if (mode === "letters") value = onlyLetters(value);
      if (mode === "phone") value = onlyPhoneChars(value);
      setFormState((prev) => ({ ...prev, [field]: value }));
    };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      setFileName("Ningún archivo seleccionado");
      return;
    }
    const allowed = ["image/jpeg", "image/png", "application/pdf"];
    if (!allowed.includes(file.type)) {
      alert("Solo se permiten imágenes JPG/PNG o PDF.");
      e.target.value = "";
      setFileName("Ningún archivo seleccionado");
      return;
    }
    if (file.size > 1024 * 1024) {
      alert("El archivo supera el límite de 1MB.");
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
    const { nombre, canton, correo, whatsapp, asunto, mensaje } = formState;
    if (!nombre || !canton || !correo || !whatsapp || !asunto || !mensaje) {
      alert("Por favor completa todos los campos antes de enviar.");
      return;
    }
    setLoading(true);
    const formElement = e.currentTarget;
    const formData = new FormData(formElement);
    try {
      const res = await fetch(
        "https://peachpuff-cod-624982.hostingersite.com/wp-json/buzon/v1/guardar",
        {
          method: "POST",
          body: formData,
        }
      );
      const data = await res.json();
      if (data.status === "ok") {
        alert("¡Gracias! Tu mensaje ha sido enviado.");
        formElement.reset();
        setFormState({
          nombre: "", canton: "", correo: "", whatsapp: "", asunto: "", mensaje: "",
        });
        clearFile();
      } else {
        alert("Error: " + data.message);
      }
    } catch (error) {
      alert("Error enviando los datos.");
    }
    setLoading(false);
  };

  return (
    <section id="buzon" className="bg-[#FBFBFD] py-24 border-t border-gray-100 overflow-hidden relative">
      <div className="max-w-[1400px] mx-auto px-6">
        
        {/* HEADER */}
        <div className="text-center mb-16 relative z-10">
          <h2 className={`${oswald.className} text-[clamp(2.5rem,5vw,4.5rem)] text-[#1D1D1F] font-black uppercase leading-[0.9] mb-6`}>
            BUZÓN <span className="text-[#6F2C91]">ENVIAR MENSAJE</span>
          </h2>

          <div className="inline-block px-8 py-3 bg-[#EAE84B] text-[#6F2C91] font-black text-xl md:text-3xl rounded-2xl shadow-sm -rotate-1 transform">
            TU VOZ CUENTA
          </div>

          <p className="max-w-[750px] mx-auto mt-8 text-[#86868B] text-lg md:text-xl leading-relaxed font-medium">
            Este es un espacio para escucharte. Comparte tus propuestas, denuncias o historias.
            Tu participación es la base de nuestra gestión.
          </p>
        </div>

        {/* FORMULARIO */}
        <div className="max-w-[900px] mx-auto bg-white p-6 md:p-14 rounded-[2.5rem] md:rounded-[3rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] relative overflow-hidden z-10">
          {/* Barra decorativa superior */}
          <div className="absolute top-0 left-0 w-full h-2 md:h-3 bg-[#EAE84B]" />
          
          <form onSubmit={handleSubmit} encType="multipart/form-data" noValidate className="space-y-6 md:space-y-8 mt-4">
            
            {/* Grid 2 Columnas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
              <div className="space-y-2">
                <label className="form-label flex items-center gap-2">
                   Nombre completo <span className="text-red-500 font-bold">*</span>
                </label>
                <input
                  name="nombre"
                  type="text"
                  required
                  placeholder="Tu nombre completo"
                  value={formState.nombre}
                  onChange={handleChange("nombre", "letters")}
                  className="form-input"
                  autoComplete="name"
                />
              </div>

              <div className="space-y-2">
                <label className="form-label">
                  Cantón / Provincia <span className="text-red-500 font-bold">*</span>
                </label>
                <input
                  name="canton"
                  type="text"
                  required
                  placeholder="Ej: Portoviejo, Manabí"
                  value={formState.canton}
                  onChange={handleChange("canton", "letters")}
                  className="form-input"
                />
              </div>
            </div>

            {/* Grid 2 Columnas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
              <div className="space-y-2">
                <label className="form-label">
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
                <label className="form-label">
                  WhatsApp <span className="text-red-500 font-bold">*</span>
                </label>
                <input
                  name="whatsapp"
                  type="tel"
                  inputMode="numeric"
                  maxLength={13}
                  required
                  placeholder="099..."
                  value={formState.whatsapp}
                  onChange={handleChange("whatsapp", "phone")}
                  className="form-input"
                  autoComplete="tel"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="form-label">
                Asunto del Mensaje <span className="text-red-500 font-bold">*</span>
              </label>
              <input
                name="asunto"
                type="text"
                required
                placeholder="¿Sobre qué nos quieres escribir?"
                value={formState.asunto}
                onChange={handleChange("asunto")}
                className="form-input"
              />
            </div>

            <div className="space-y-2">
              <label className="form-label">
                Detalla tu mensaje <span className="text-red-500 font-bold">*</span>
              </label>
              <textarea
                name="mensaje"
                rows={6}
                required
                placeholder="Escribe aquí los detalles de tu propuesta o historia..."
                value={formState.mensaje}
                onChange={handleChange("mensaje")}
                className="form-input resize-none min-h-[150px]"
              />
            </div>

            {/* ZONA DE ARCHIVO REDISEÑADA */}
            <div className="space-y-3 pt-2">
              <label className="form-label text-[#86868B] flex items-center gap-2">
                Adjuntar documentos de respaldo <span className="text-xs font-normal opacity-70">(PDF o imagen, máx 1MB)</span>
              </label>

              <div className="flex flex-col sm:flex-row items-stretch gap-4">
                <label className="flex-none flex items-center justify-center gap-2 px-6 py-4 bg-[#6F2C91] text-white rounded-2xl cursor-pointer hover:bg-[#5a2376] transition-all font-bold shadow-lg shadow-purple-200/50 active:scale-95 group">
                  <FaPaperclip className="group-hover:rotate-45 transition-transform" /> 
                  Subir Archivo
                  <input
                    ref={fileInputRef}
                    name="archivo"
                    type="file"
                    accept="image/*,application/pdf"
                    className="hidden"
                    onChange={handleFileChange}
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
                      <FaTrash size={12} />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* BOTÓN REFORZADO */}
            <div className="pt-6">
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
                            ENVIANDO...
                        </>
                    ) : (
                        <>
                            ENVIAR MENSAJE
                            <FaCheckCircle className="opacity-0 group-hover:opacity-100 transition-opacity -ml-6 group-hover:ml-0" />
                        </>
                    )}
                </div>
                </button>
            </div>

            {loading && (
              <p className="text-center text-sm text-[#6F2C91] font-bold animate-pulse">
                Procesando envío, por favor no recargues la página...
              </p>
            )}

            <div className="flex items-center justify-center gap-2 text-gray-400 text-[10px] md:text-xs font-bold pt-6 border-t border-gray-100 mt-8">
              <FaLock size={10} /> TUS DATOS ESTÁN PROTEGIDOS Y SON CONFIDENCIALES
            </div>
          </form>
        </div>
      </div>

      <style jsx>{`
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
      `}</style>
    </section>
  );
}