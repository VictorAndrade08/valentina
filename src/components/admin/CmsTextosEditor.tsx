"use client";

import { useEffect, useState } from "react";
import { getSupabase } from "@/lib/supabaseClient";

type CampoConfig = {
  clave: string;
  label: string;
  multilinea?: boolean;
  esArchivo?: boolean;
  acepta?: string;
};

type Props = {
  seccion: string;
  titulo: string;
  descripcion: string;
  campos: CampoConfig[];
};

const STORAGE_BUCKET = "cms-imagenes";
const MAX_BYTES = 50 * 1024 * 1024; // 50MB (videos)

export default function CmsTextosEditor({ seccion, titulo, descripcion, campos }: Props) {
  const [valores, setValores] = useState<Record<string, string>>({});
  const [originales, setOriginales] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingKey, setUploadingKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [okMsg, setOkMsg] = useState<string | null>(null);

  const fetchValores = async () => {
    setLoading(true);
    setError(null);
    try {
      const supabase = getSupabase();
      const { data, error } = await supabase
        .from("cms_textos")
        .select("clave, valor")
        .eq("seccion", seccion);
      if (error) throw error;
      const map: Record<string, string> = {};
      campos.forEach((c) => (map[c.clave] = ""));
      (data || []).forEach((r) => {
        map[r.clave] = r.valor || "";
      });
      setValores(map);
      setOriginales(map);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error cargando");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchValores();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seccion]);

  const subirArchivo = async (clave: string, file: File) => {
    if (file.size > MAX_BYTES) {
      alert("Archivo demasiado grande (máx 50MB).");
      return;
    }
    setUploadingKey(clave);
    try {
      const supabase = getSupabase();
      const safe = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
      const path = `${seccion}/${Date.now()}_${safe}`;
      const { error: upErr } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(path, file, { contentType: file.type, upsert: false });
      if (upErr) throw upErr;
      const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path);
      setValores((prev) => ({ ...prev, [clave]: data.publicUrl }));
    } catch (err) {
      alert("Error subiendo: " + (err instanceof Error ? err.message : ""));
    }
    setUploadingKey(null);
  };

  const guardar = async () => {
    setSaving(true);
    setError(null);
    setOkMsg(null);
    try {
      const supabase = getSupabase();
      const cambios = campos.filter(
        (c) => (valores[c.clave] || "") !== (originales[c.clave] || "")
      );
      if (cambios.length === 0) {
        setOkMsg("No hay cambios para guardar.");
        setSaving(false);
        return;
      }
      const ahora = new Date().toISOString();
      const filas = cambios.map((c) => ({
        seccion,
        clave: c.clave,
        valor: valores[c.clave] || null,
        updated_at: ahora,
      }));
      const { error } = await supabase
        .from("cms_textos")
        .upsert(filas, { onConflict: "seccion,clave" });
      if (error) throw error;
      setOriginales({ ...valores });
      setOkMsg(`${cambios.length} campo(s) actualizado(s) correctamente.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error guardando");
    }
    setSaving(false);
  };

  const hayCambios = campos.some(
    (c) => (valores[c.clave] || "") !== (originales[c.clave] || "")
  );

  return (
    <div>
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8">
        <div>
          <h2
            style={{ fontFamily: "'Oswald', sans-serif" }}
            className="text-3xl md:text-5xl text-[#1D1D1F] font-black uppercase leading-none mb-2"
          >
            {titulo}
          </h2>
          <p className="text-sm text-gray-500 max-w-2xl">{descripcion}</p>
          {loading && (
            <p className="text-[#6F2C91] text-xs font-bold animate-pulse mt-2">
              Cargando...
            </p>
          )}
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchValores}
            className="p-3 rounded-2xl bg-white text-[#1D1D1F] hover:text-[#6F2C91] shadow-sm transition-all active:scale-95"
            title="Refrescar"
          >
            <svg
              className={`w-5 h-5 ${loading ? "animate-spin" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357-2H15"
              />
            </svg>
          </button>
          <button
            onClick={guardar}
            disabled={saving || loading || !hayCambios}
            className="px-8 py-3 rounded-2xl bg-[#1D1D1F] text-[#EAE84B] font-black uppercase tracking-widest text-xs hover:bg-[#6F2C91] hover:text-white disabled:opacity-40 transition-all shadow-xl active:scale-95"
          >
            {saving ? "Guardando..." : "Guardar cambios"}
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm font-bold">
          {error}
        </div>
      )}
      {okMsg && (
        <div className="mb-4 p-4 rounded-2xl bg-green-50 border border-green-200 text-green-700 text-sm font-bold">
          {okMsg}
        </div>
      )}

      <div className="bg-white rounded-[2rem] p-6 md:p-8 shadow-sm border border-gray-100 space-y-6">
        {campos.map((c) => {
          const val = valores[c.clave] || "";
          return (
            <div key={c.clave}>
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-2">
                {c.label}
              </label>

              {c.multilinea ? (
                <textarea
                  value={val}
                  onChange={(e) =>
                    setValores((prev) => ({ ...prev, [c.clave]: e.target.value }))
                  }
                  rows={Math.max(3, Math.min(10, Math.ceil((val.length || 100) / 80)))}
                  className="w-full py-3 px-4 rounded-xl bg-[#F5F5F7] focus:bg-white border-2 border-transparent focus:border-[#6F2C91] outline-none text-sm text-[#1D1D1F] resize-y leading-relaxed"
                />
              ) : (
                <input
                  type="text"
                  value={val}
                  onChange={(e) =>
                    setValores((prev) => ({ ...prev, [c.clave]: e.target.value }))
                  }
                  className="w-full py-3 px-4 rounded-xl bg-[#F5F5F7] focus:bg-white border-2 border-transparent focus:border-[#6F2C91] outline-none text-sm text-[#1D1D1F]"
                />
              )}

              {c.esArchivo && (
                <div className="mt-2 flex flex-wrap gap-3 items-center">
                  <label className="px-4 py-2 bg-[#6F2C91] text-white rounded-lg font-bold text-[10px] uppercase tracking-widest cursor-pointer hover:bg-[#5a2376] transition-all">
                    {uploadingKey === c.clave ? "Subiendo..." : "Subir archivo"}
                    <input
                      type="file"
                      accept={c.acepta || "*/*"}
                      className="hidden"
                      disabled={uploadingKey === c.clave}
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) subirArchivo(c.clave, f);
                        e.target.value = "";
                      }}
                    />
                  </label>
                  {val && (
                    <a
                      href={val}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-[#6F2C91] underline truncate max-w-md"
                    >
                      Ver archivo actual
                    </a>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
