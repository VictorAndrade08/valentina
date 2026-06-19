"use client";

import { useState, useRef } from "react";
import { Oswald } from "next/font/google";
import { getSupabase } from "@/lib/supabaseClient";
import { validarCedulaEcuatoriana, MSG_CEDULA_INVALIDA } from "@/lib/validators";

const oswald = Oswald({ subsets: ["latin"], weight: ["700"] });

const STORAGE_BUCKET = "buzon-archivos";

type FormState = {
  // Estudiante
  nombres_estudiante: string;
  cedula_estudiante: string;
  fecha_nacimiento: string;
  edad: string;
  genero: string;
  // Académico
  colegio: string;
  grado: string;
  ciudad: string;
  provincia: string;
  // Contacto
  correo: string;
  whatsapp: string;
  // Representante
  nombres_representante: string;
  cedula_representante: string;
  correo_representante: string;
  telefono_representante: string;
  // Adicionales
  motivacion: string;
};

const EMPTY: FormState = {
  nombres_estudiante: "",
  cedula_estudiante: "",
  fecha_nacimiento: "",
  edad: "",
  genero: "",
  colegio: "",
  grado: "",
  ciudad: "",
  provincia: "",
  correo: "",
  whatsapp: "",
  nombres_representante: "",
  cedula_representante: "",
  correo_representante: "",
  telefono_representante: "",
  motivacion: "",
};

const inputCls =
  "w-full py-3 px-4 rounded-xl bg-[#F5F5F7] focus:bg-white border-2 border-transparent focus:border-[#6F2C91] outline-none transition-all text-sm text-[#1D1D1F]";
const labelCls =
  "block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1.5";

const onlyLetters = (v: string) =>
  v.replace(/[^a-zA-ZÁÉÍÓÚáéíóúÑñüÜ\s]/g, "");
const onlyNumbers = (v: string) => v.replace(/[^0-9]/g, "");
const onlyPhoneChars = (v: string) => v.replace(/[^0-9+]/g, "");

type Mode = "text" | "letters" | "numbers" | "phone";

export default function ConcursoIAForm() {
  const [form, setForm] = useState<FormState>(EMPTY);
  const [loading, setLoading] = useState(false);
  const [okMsg, setOkMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showTermsError, setShowTermsError] = useState(false);
  const [fileName, setFileName] = useState("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const set =
    (k: keyof FormState, mode: Mode = "text") =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      let v = e.target.value;
      if (mode === "letters") v = onlyLetters(v);
      if (mode === "numbers") v = onlyNumbers(v);
      if (mode === "phone") v = onlyPhoneChars(v);
      setForm((prev) => ({ ...prev, [k]: v }));
    };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) {
      setFileName("");
      return;
    }
    if (f.size > 5 * 1024 * 1024) {
      alert("El archivo supera 5MB.");
      e.target.value = "";
      setFileName("");
      return;
    }
    setFileName(f.name);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (loading) return;
    const required: (keyof FormState)[] = [
      "nombres_estudiante",
      "cedula_estudiante",
      "edad",
      "colegio",
      "grado",
      "ciudad",
      "correo",
      "whatsapp",
      "nombres_representante",
      "telefono_representante",
      "motivacion",
    ];
    if (required.some((k) => !form[k])) {
      setError("Por favor completá los campos requeridos (*).");
      return;
    }
    if (!validarCedulaEcuatoriana(form.cedula_estudiante)) {
      setError(MSG_CEDULA_INVALIDA);
      return;
    }
    if (
      form.cedula_representante &&
      !validarCedulaEcuatoriana(form.cedula_representante)
    ) {
      setError("La cédula del representante no es válida.");
      return;
    }
    if (!acceptedTerms) {
      setShowTermsError(true);
      return;
    }
    const file = fileInputRef.current?.files?.[0] || null;
    if (!file) {
      setError("Por favor adjuntá la autorización firmada del padre o representante (es obligatoria).");
      return;
    }
    setLoading(true);
    setError(null);
    setOkMsg(null);
    try {
      const supabase = getSupabase();
      let archivo_url: string | null = null;
      let archivo_nombre: string | null = null;
      if (file) {
        const safe = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
        const path = `concurso_ia/${Date.now()}_${safe}`;
        const { error: upErr } = await supabase.storage
          .from(STORAGE_BUCKET)
          .upload(path, file, { contentType: file.type, upsert: false });
        if (upErr) throw new Error("No se pudo subir el archivo: " + upErr.message);
        const { data: u } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path);
        archivo_url = u.publicUrl;
        archivo_nombre = file.name;
      }
      const payload = {
        ...form,
        fecha_nacimiento: form.fecha_nacimiento || null,
        archivo_url,
        archivo_nombre,
      };
      const { error: insErr } = await supabase
        .from("inscripciones_concurso_ia")
        .insert(payload);
      if (insErr) {
        // 23505 = unique_violation (cédula duplicada por el constraint UNIQUE)
        if (insErr.code === "23505") {
          throw new Error(
            "Ya existe una inscripción registrada con esta cédula. Si crees que es un error, escribinos."
          );
        }
        throw new Error(insErr.message);
      }
      setOkMsg(
        "¡Inscripción enviada con éxito! Pronto te contactaremos por correo o WhatsApp."
      );
      setForm(EMPTY);
      if (fileInputRef.current) fileInputRef.current.value = "";
      setFileName("");
      setAcceptedTerms(false);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error enviando la inscripción."
      );
    }
    setLoading(false);
  };

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="bg-white rounded-[2.5rem] p-6 md:p-12 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] relative overflow-hidden"
    >
      <div className="absolute top-0 left-0 w-full h-2 md:h-3 bg-[#EAE84B]" />

      {okMsg && (
        <div className="mb-6 p-4 rounded-2xl bg-green-50 border border-green-200 text-green-700 text-sm font-bold">
          {okMsg}
        </div>
      )}
      {error && (
        <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm font-bold">
          {error}
        </div>
      )}

      <div className="space-y-10 mt-4">
        {/* SECCIÓN: ESTUDIANTE */}
        <section>
          <h3
            className={`${oswald.className} text-xl md:text-2xl font-black uppercase text-[#6F2C91] mb-5`}
          >
            1. Datos del estudiante
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="md:col-span-2">
              <label className={labelCls}>
                Nombres y apellidos <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={form.nombres_estudiante}
                onChange={set("nombres_estudiante", "letters")}
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>
                Cédula <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={form.cedula_estudiante}
                onChange={set("cedula_estudiante", "numbers")}
                maxLength={10}
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Fecha de nacimiento</label>
              <input
                type="date"
                value={form.fecha_nacimiento}
                onChange={set("fecha_nacimiento")}
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>
                Edad <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                required
                value={form.edad}
                onChange={set("edad", "numbers")}
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Género</label>
              <select
                value={form.genero}
                onChange={set("genero")}
                className={inputCls}
              >
                <option value="">—</option>
                <option value="femenino">Femenino</option>
                <option value="masculino">Masculino</option>
                <option value="otro">Otro</option>
                <option value="prefiero_no_decir">Prefiero no decir</option>
              </select>
            </div>
          </div>
        </section>

        {/* SECCIÓN: ACADÉMICO */}
        <section>
          <h3
            className={`${oswald.className} text-xl md:text-2xl font-black uppercase text-[#6F2C91] mb-5`}
          >
            2. Datos académicos
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="md:col-span-2">
              <label className={labelCls}>
                Colegio <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={form.colegio}
                onChange={set("colegio")}
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>
                Grado / Curso <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={form.grado}
                onChange={set("grado")}
                placeholder="Ej: 2do BGU"
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>
                Ciudad <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={form.ciudad}
                onChange={set("ciudad", "letters")}
                className={inputCls}
              />
            </div>
            <div className="md:col-span-2">
              <label className={labelCls}>Provincia</label>
              <input
                type="text"
                value={form.provincia}
                onChange={set("provincia", "letters")}
                className={inputCls}
              />
            </div>
          </div>
        </section>

        {/* SECCIÓN: CONTACTO */}
        <section>
          <h3
            className={`${oswald.className} text-xl md:text-2xl font-black uppercase text-[#6F2C91] mb-5`}
          >
            3. Contacto del estudiante
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className={labelCls}>
                Correo electrónico <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                required
                value={form.correo}
                onChange={set("correo")}
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>
                WhatsApp <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                inputMode="numeric"
                required
                value={form.whatsapp}
                onChange={set("whatsapp", "phone")}
                maxLength={13}
                className={inputCls}
              />
            </div>
          </div>
        </section>

        {/* SECCIÓN: REPRESENTANTE */}
        <section>
          <h3
            className={`${oswald.className} text-xl md:text-2xl font-black uppercase text-[#6F2C91] mb-5`}
          >
            4. Datos del representante
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="md:col-span-2">
              <label className={labelCls}>
                Nombres y apellidos del representante{" "}
                <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={form.nombres_representante}
                onChange={set("nombres_representante", "letters")}
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Cédula del representante</label>
              <input
                type="text"
                value={form.cedula_representante}
                onChange={set("cedula_representante", "numbers")}
                maxLength={10}
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>
                Teléfono del representante <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                inputMode="numeric"
                required
                value={form.telefono_representante}
                onChange={set("telefono_representante", "phone")}
                maxLength={13}
                className={inputCls}
              />
            </div>
            <div className="md:col-span-2">
              <label className={labelCls}>Correo del representante</label>
              <input
                type="email"
                value={form.correo_representante}
                onChange={set("correo_representante")}
                className={inputCls}
              />
            </div>
          </div>
        </section>

        {/* SECCIÓN: MOTIVACIÓN Y AUTORIZACIÓN */}
        <section>
          <h3
            className={`${oswald.className} text-xl md:text-2xl font-black uppercase text-[#6F2C91] mb-5`}
          >
            5. Motivación y autorización
          </h3>
          <div className="space-y-5">
            <div>
              <label className={labelCls}>
                ¿Por qué querés participar? (motivación){" "}
                <span className="text-red-500">*</span>
              </label>
              <textarea
                value={form.motivacion}
                onChange={set("motivacion")}
                rows={4}
                placeholder="Contanos brevemente por qué te interesa el programa..."
                className={inputCls + " resize-y"}
              />
            </div>
            <div>
              <label className={labelCls}>
                Autorización de la madre/padre o representante firmada (PDF o imagen, máx 5MB){" "}
                <span className="text-red-500">*</span>
              </label>
              <div className="flex flex-col sm:flex-row gap-4 items-stretch">
                <label className="flex-none flex items-center justify-center gap-2 px-6 py-3 bg-[#6F2C91] text-white rounded-2xl cursor-pointer hover:bg-[#5a2376] transition-all font-bold text-sm">
                  Subir archivo
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,application/pdf"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </label>
                <div className="flex-1 flex items-center px-5 py-3 bg-[#F5F5F7] rounded-2xl border-2 border-dashed border-gray-300 text-gray-500 text-sm font-medium truncate">
                  {fileName || "Ningún archivo seleccionado"}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* TÉRMINOS */}
        <div className="flex flex-col gap-1 pt-2">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={acceptedTerms}
              onChange={(e) => {
                setAcceptedTerms(e.target.checked);
                if (e.target.checked) setShowTermsError(false);
              }}
              className={`flex-none w-7 h-7 rounded text-[#6F2C91] mt-0.5 ${
                showTermsError ? "ring-2 ring-red-300" : ""
              }`}
            />
            <span
              className={`text-sm leading-tight ${
                showTermsError
                  ? "text-red-600 font-medium"
                  : "text-[#86868B]"
              }`}
            >
              He leído y acepto los{" "}
              <a
                href="/politicasdeprivacidad"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#6F2C91] underline font-bold"
              >
                Términos y Condiciones
              </a>{" "}
              y las{" "}
              <a
                href="/politicasdeprivacidad"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#6F2C91] underline font-bold"
              >
                Políticas de Privacidad
              </a>
              . <span className="text-red-500">*</span>
            </span>
          </label>
          {showTermsError && (
            <span className="text-red-500 text-xs font-bold ml-10 animate-pulse">
              Por favor, aceptá los términos para continuar.
            </span>
          )}
        </div>

        {/* SUBMIT */}
        <button
          type="submit"
          disabled={loading}
          className={`w-full py-5 rounded-[1.5rem] text-xl font-black uppercase tracking-widest transition-all shadow-xl ${
            loading
              ? "bg-gray-200 text-gray-400 cursor-not-allowed"
              : "bg-[#1D1D1F] text-[#EAE84B] hover:bg-[#6F2C91] hover:text-white active:scale-95"
          }`}
        >
          {loading ? "Enviando..." : "Enviar inscripción"}
        </button>
      </div>
    </form>
  );
}
