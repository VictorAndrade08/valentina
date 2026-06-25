"use client";

import { useEffect, useState } from "react";
import { getSupabase } from "@/lib/supabaseClient";

type CampoConfig = {
  clave: string;
  label: string;
  hint?: string;
  multilinea?: boolean;
  esImagen?: boolean;
  esToggle?: boolean;
};

const CAMPOS: CampoConfig[] = [
  { clave: "activo", label: "¿Mostrar esta sección en el sitio?", esToggle: true, hint: "Si lo apagás, la sección no aparece para los visitantes." },
  { clave: "tag", label: "Etiqueta superior", hint: "Texto pequeño arriba del título (ej: 'Iniciativa ciudadana')." },
  { clave: "titulo", label: "Título principal" },
  { clave: "subtitulo", label: "Subtítulo (en amarillo)" },
  { clave: "descripcion", label: "Descripción principal", multilinea: true },
  { clave: "imagen", label: "Imagen lateral", esImagen: true, hint: "Recomendado: 800×1000 (vertical) o 1080×1350. Formato WEBP o JPG." },
  { clave: "eje_1_titulo", label: "Eje 1 — Título" },
  { clave: "eje_1_desc", label: "Eje 1 — Descripción", multilinea: true },
  { clave: "eje_2_titulo", label: "Eje 2 — Título" },
  { clave: "eje_2_desc", label: "Eje 2 — Descripción", multilinea: true },
  { clave: "eje_3_titulo", label: "Eje 3 — Título" },
  { clave: "eje_3_desc", label: "Eje 3 — Descripción", multilinea: true },
  { clave: "cta_texto", label: "Texto del botón final" },
  { clave: "cta_link", label: "Link del botón", hint: "Ej: '/#buzon' para ir al buzón, o '/becas' para la página de becas." },
];

const STORAGE_BUCKET = "cms-imagenes";
const MAX_BYTES = 5 * 1024 * 1024; // 5MB

export default function CmsOperacionValentiaEditor() {
  const [valores, setValores] = useState<Record<string, string>>({});
  const [originales, setOriginales] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingKey, setUploadingKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [okMsg, setOkMsg] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const supabase = getSupabase();
      const { data, error } = await supabase
        .from("cms_operacion_valentia")
        .select("clave, valor");
      if (error) throw error;
      const map: Record<string, string> = {};
      CAMPOS.forEach((c) => (map[c.clave] = ""));
      (data || []).forEach((r) => {
        map[r.clave] = r.valor || "";
      });
      setValores(map);
      setOriginales(map);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error cargando datos";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const dirty = CAMPOS.some(
    (c) => (valores[c.clave] || "") !== (originales[c.clave] || "")
  );

  const setVal = (clave: string, valor: string) => {
    setValores((prev) => ({ ...prev, [clave]: valor }));
    setOkMsg(null);
  };

  const handleUpload = async (clave: string, file: File) => {
    if (file.size > MAX_BYTES) {
      setError(`El archivo supera 5MB. Subí uno más liviano.`);
      return;
    }
    setUploadingKey(clave);
    setError(null);
    try {
      const supabase = getSupabase();
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
      const path = `operacion_valentia/${Date.now()}_${safeName}`;
      const { error: uploadError } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(path, file, {
          cacheControl: "3600",
          upsert: false,
          contentType: file.type,
        });
      if (uploadError) throw uploadError;
      const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path);
      setVal(clave, data.publicUrl);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error subiendo archivo";
      setError(msg);
    } finally {
      setUploadingKey(null);
    }
  };

  const guardar = async () => {
    setSaving(true);
    setError(null);
    setOkMsg(null);
    try {
      const supabase = getSupabase();
      const changes = CAMPOS.filter(
        (c) => (valores[c.clave] || "") !== (originales[c.clave] || "")
      );
      for (const c of changes) {
        const valor = valores[c.clave] || "";
        const { error: upErr } = await supabase
          .from("cms_operacion_valentia")
          .upsert({ clave: c.clave, valor }, { onConflict: "clave" });
        if (upErr) throw upErr;
      }
      setOriginales({ ...valores });
      setOkMsg(`✓ Cambios guardados (${changes.length} ${changes.length === 1 ? "campo" : "campos"}).`);
      setTimeout(() => setOkMsg(null), 4000);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error guardando";
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 text-gray-500">Cargando contenido de Operación Valentía...</div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-purple-50 border-l-4 border-[#6F2C91] rounded-r-xl p-5">
        <h3 className="text-lg font-bold text-[#6F2C91]">Operación Valentía</h3>
        <p className="text-sm text-gray-700 mt-1">
          Editás el contenido de la sección destacada de Operación Valentía. Se muestra
          en el home, entre las secciones principales. Para ocultarla del sitio sin
          borrarla, desactivá el toggle de arriba.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-xl p-4">
          {error}
        </div>
      )}
      {okMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl p-4">
          {okMsg}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {CAMPOS.map((c) => {
          const valor = valores[c.clave] || "";
          return (
            <div
              key={c.clave}
              className={`bg-white rounded-2xl border border-gray-200 p-5 ${c.multilinea || c.esImagen ? "md:col-span-2" : ""}`}
            >
              <label className="block text-sm font-bold text-gray-800 mb-1">
                {c.label}
              </label>
              {c.hint && (
                <p className="text-xs text-gray-500 mb-3">{c.hint}</p>
              )}

              {c.esToggle ? (
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      setVal(c.clave, valor.toLowerCase() === "true" ? "false" : "true")
                    }
                    className={`relative inline-flex h-7 w-14 rounded-full transition-colors ${valor.toLowerCase() === "true" ? "bg-[#6F2C91]" : "bg-gray-300"}`}
                    aria-pressed={valor.toLowerCase() === "true"}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform ${valor.toLowerCase() === "true" ? "translate-x-7" : "translate-x-0"}`}
                    />
                  </button>
                  <span className="text-sm font-medium text-gray-700">
                    {valor.toLowerCase() === "true" ? "Visible en el sitio" : "Oculta"}
                  </span>
                </div>
              ) : c.esImagen ? (
                <div className="space-y-3">
                  {valor && (
                    <div className="relative w-40 h-40 rounded-xl overflow-hidden border-2 border-gray-200">
                      <img
                        src={valor}
                        alt="Vista previa"
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="flex flex-col sm:flex-row gap-2">
                    <label className="inline-flex items-center justify-center gap-2 bg-[#6F2C91] hover:bg-[#5a2178] text-white font-bold text-sm px-5 py-3 rounded-xl cursor-pointer transition-colors min-h-[44px]">
                      {uploadingKey === c.clave ? "Subiendo..." : "Subir nueva imagen"}
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) handleUpload(c.clave, f);
                          e.target.value = "";
                        }}
                        disabled={uploadingKey === c.clave}
                      />
                    </label>
                    {valor && (
                      <button
                        type="button"
                        onClick={() => setVal(c.clave, "")}
                        className="text-sm text-gray-500 hover:text-red-600 font-medium px-4 py-3 min-h-[44px]"
                      >
                        Quitar imagen
                      </button>
                    )}
                  </div>
                  <input
                    type="text"
                    value={valor}
                    onChange={(e) => setVal(c.clave, e.target.value)}
                    placeholder="o pegar URL de la imagen (Supabase o /public)"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-600"
                  />
                </div>
              ) : c.multilinea ? (
                <textarea
                  value={valor}
                  onChange={(e) => setVal(c.clave, e.target.value)}
                  rows={4}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#6F2C91]"
                />
              ) : (
                <input
                  type="text"
                  value={valor}
                  onChange={(e) => setVal(c.clave, e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#6F2C91]"
                />
              )}
            </div>
          );
        })}
      </div>

      <div className="sticky bottom-4 z-10 flex justify-end">
        <button
          type="button"
          onClick={guardar}
          disabled={!dirty || saving}
          className={`bg-[#6F2C91] hover:bg-[#5a2178] text-white font-bold px-8 py-4 rounded-2xl shadow-lg transition-all min-h-[48px] ${(!dirty || saving) ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          {saving ? "Guardando..." : dirty ? "Guardar cambios" : "Sin cambios"}
        </button>
      </div>
    </div>
  );
}
