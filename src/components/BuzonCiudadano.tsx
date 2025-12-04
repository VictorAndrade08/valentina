"use client";

import { useState, useRef } from "react";

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

  // Helpers de sanitización
  const onlyLetters = (value: string) =>
    value.replace(/[^a-zA-ZÁÉÍÓÚáéíóúÑñüÜ\s]/g, "");

  const onlyPhoneChars = (value: string) =>
    value.replace(/[^0-9+]/g, ""); // permite números y +

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

    // Validación rápida en front (igual está validado en el plugin)
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

    // evita envíos duplicados
    if (loading) return;

    // validación rápida en front: todo obligatorio
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
          nombre: "",
          canton: "",
          correo: "",
          whatsapp: "",
          asunto: "",
          mensaje: "",
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
    <section id="buzon" className="bg-white py-20 border-t border-gray-200">
      <div className="container mx-auto px-4">
        {/* HEADER */}
        <div className="text-center mb-10">
          <h2 className="text-[clamp(2.4rem,5vw,3.4rem)] text-[#6F2C91] font-[var(--font-boruino)] font-extrabold uppercase tracking-tight">
            BUZÓN CIUDADANO
          </h2>

          <div className="inline-block mt-2 px-6 py-1 bg-[#EAE84B] text-[#6F2C91] font-[var(--font-bebas)] text-[2.4rem]">
            TU VOZ SÍ IMPORTA
          </div>

          <p className="max-w-[700px] mx-auto mt-5 text-gray-700 text-[1.1rem] leading-relaxed font-[var(--font-body)]">
            Este es un espacio para escucharte. Puedes compartir problemas de tu
            comunidad, propuestas, denuncias o historias que debamos conocer.
            Cada mensaje cuenta.
          </p>
        </div>

        {/* FORM */}
        <div className="max-w-[850px] mx-auto bg-white p-10 rounded-xl shadow-xl border-t-[6px] border-[#EAE84B]">
          <form onSubmit={handleSubmit} encType="multipart/form-data" noValidate>
            {/* NOMBRE + CANTÓN */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-5">
              <div>
                <label className="form-label">
                  Nombre completo <span className="text-red-500">*</span>
                </label>
                <input
                  name="nombre"
                  type="text"
                  required
                  placeholder="Tu nombre"
                  value={formState.nombre}
                  onChange={handleChange("nombre", "letters")}
                  className="form-input"
                />
                <p className="helper-text">Solo letras y espacios.</p>
              </div>

              <div>
                <label className="form-label">
                  Cantón / Provincia <span className="text-red-500">*</span>
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
                <p className="helper-text">Ejemplo: Portoviejo, Manabí.</p>
              </div>
            </div>

            {/* CORREO + WHATSAPP */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-5">
              <div>
                <label className="form-label">
                  Correo electrónico <span className="text-red-500">*</span>
                </label>
                <input
                  name="correo"
                  type="email"
                  required
                  placeholder="tu@correo.com"
                  value={formState.correo}
                  onChange={handleChange("correo")}
                  className="form-input"
                />
                <p className="helper-text">
                  Usaremos este correo solo para responderte.
                </p>
              </div>

              <div>
                <label className="form-label">
                  WhatsApp <span className="text-red-500">*</span>
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
                />
                <p className="helper-text">
                  Solo números, puedes empezar con 0 o +593.
                </p>
              </div>
            </div>

            {/* ASUNTO */}
            <div className="mb-5">
              <label className="form-label">
                Asunto <span className="text-red-500">*</span>
              </label>
              <input
                name="asunto"
                type="text"
                required
                placeholder="Breve título del mensaje"
                value={formState.asunto}
                onChange={handleChange("asunto")}
                className="form-input"
              />
            </div>

            {/* MENSAJE */}
            <div className="mb-5">
              <label className="form-label">
                Mensaje <span className="text-red-500">*</span>
              </label>
              <textarea
                name="mensaje"
                rows={5}
                required
                placeholder="Escribe aquí los detalles..."
                value={formState.mensaje}
                onChange={handleChange("mensaje")}
                className="form-input resize-none"
              />
            </div>

            {/* ARCHIVO */}
            <div className="mb-6">
              <label className="form-label mb-2 block">
                Adjuntar archivo{" "}
                <span className="text-gray-400">(PDF o imagen, máx 1MB)</span>
              </label>

              <div className="flex items-center gap-3">
                <label className="inline-flex items-center gap-2 px-4 py-2 bg-[#6F2C91] text-white rounded-lg cursor-pointer hover:bg-[#4F1570] transition-all text-sm font-[var(--font-boruino)]">
                  📎 Subir archivo
                  <input
                    ref={fileInputRef}
                    name="archivo"
                    type="file"
                    accept="image/*,application/pdf"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </label>

                <div className="flex-1 flex items-center justify-between px-3 py-2 bg-gray-50 rounded-lg border border-dashed border-gray-300 text-xs sm:text-sm font-[var(--font-body)] text-gray-600">
                  <span className="truncate">{fileName}</span>
                  {fileName !== "Ningún archivo seleccionado" && (
                    <button
                      type="button"
                      onClick={clearFile}
                      className="ml-3 text-gray-400 hover:text-red-500 text-lg leading-none"
                      aria-label="Quitar archivo"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* BOTÓN */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full bg-[#6F2C91] text-white py-4 rounded-lg text-[1.4rem] font-[var(--font-bebas)] tracking-wider transition-all ${
                loading
                  ? "opacity-60 cursor-not-allowed"
                  : "hover:bg-[#4F1570]"
              }`}
            >
              {loading ? "ENVIANDO..." : "ENVIAR MI MENSAJE"}
            </button>

            {/* Mensaje UX mientras se envía */}
            {loading && (
              <p className="mt-4 text-center text-sm text-[#6F2C91] font-[var(--font-body)]">
                Enviando tu mensaje, por favor no cierres esta ventana.
              </p>
            )}

            <div className="text-center text-gray-400 text-sm mt-6 font-[var(--font-body)]">
              🔒 Tus datos son confidenciales.
            </div>
          </form>
        </div>
      </div>

      {/* Styles */}
      <style>{`
        .form-label {
          font-family: var(--font-boruino);
          color: #6F2C91;
          font-weight: 600;
          display: block;
          margin-bottom: 4px;
        }

        .form-input {
          width: 100%;
          padding: 14px 16px;
          border: 1px solid #ddd;
          border-radius: 10px;
          font-size: 1rem;
          font-family: var(--font-body);
          background: white;
          outline: none;
          transition: 0.2s;
          color: #333 !important;
        }

        .form-input::placeholder {
          color: #999 !important;
        }

        .form-input:focus {
          border-color: #6F2C91;
          box-shadow: 0 0 0 2px rgba(111,44,145,0.15);
        }

        textarea.form-input {
          color: #333 !important;
        }

        .helper-text {
          margin-top: 4px;
          font-size: 0.8rem;
          color: #9CA3AF;
          font-family: var(--font-body);
        }
      `}</style>
    </section>
  );
}
