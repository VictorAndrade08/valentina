"use client";

import { useEffect, useState } from "react";
import { getSupabase } from "@/lib/supabaseClient";

type ConcursoIA = {
  id?: string;
  nombre: string;
  banner_url: string;
  introduccion: string;
  reglas: string;
  fecha_inicio: string;
  fecha_fin: string;
  link_bases: string;
  activo: boolean;
};

const EMPTY: ConcursoIA = {
  nombre: "",
  banner_url: "",
  introduccion: "",
  reglas: "",
  fecha_inicio: "",
  fecha_fin: "",
  link_bases: "",
  activo: true,
};

const STORAGE_BUCKET = "cms-imagenes";

export default function CmsConcursoIAEditor() {
  const [data, setData] = useState<ConcursoIA>(EMPTY);
  const [original, setOriginal] = useState<ConcursoIA>(EMPTY);
  const [rowId, setRowId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [okMsg, setOkMsg] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const supabase = getSupabase();
      const { data: rows, error } = await supabase
        .from("cms_concurso_ia")
        .select("*")
        .limit(1)
        .order("updated_at", { ascending: false });
      if (error) throw error;
      if (rows && rows.length > 0) {
        const r = rows[0];
        const next: ConcursoIA = {
          nombre: r.nombre || "",
          banner_url: r.banner_url || "",
          introduccion: r.introduccion || "",
          reglas: r.reglas || "",
          fecha_inicio: r.fecha_inicio || "",
          fecha_fin: r.fecha_fin || "",
          link_bases: r.link_bases || "",
          activo: r.activo ?? true,
        };
        setData(next);
        setOriginal(next);
        setRowId(r.id || null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error cargando");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const subirBanner = async (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      alert("Imagen supera 5MB.");
      return;
    }
    setUploading(true);
    try {
      const supabase = getSupabase();
      const safe = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
      const path = `concurso_ia/${Date.now()}_${safe}`;
      const { error: upErr } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(path, file, { contentType: file.type, upsert: false });
      if (upErr) throw upErr;
      const { data: u } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path);
      setData((prev) => ({ ...prev, banner_url: u.publicUrl }));
    } catch (err) {
      alert("Error subiendo: " + (err instanceof Error ? err.message : ""));
    }
    setUploading(false);
  };

  const guardar = async () => {
    setSaving(true);
    setError(null);
    setOkMsg(null);
    try {
      const supabase = getSupabase();
      const payload = {
        nombre: data.nombre || null,
        banner_url: data.banner_url || null,
        introduccion: data.introduccion || null,
        reglas: data.reglas || null,
        fecha_inicio: data.fecha_inicio || null,
        fecha_fin: data.fecha_fin || null,
        link_bases: data.link_bases || null,
        activo: data.activo,
        updated_at: new Date().toISOString(),
      };
      if (rowId) {
        const { error } = await supabase
          .from("cms_concurso_ia")
          .update(payload)
          .eq("id", rowId);
        if (error) throw error;
      } else {
        const { data: ins, error } = await supabase
          .from("cms_concurso_ia")
          .insert(payload)
          .select()
          .single();
        if (error) throw error;
        setRowId(ins.id);
      }
      setOriginal({ ...data });
      setOkMsg("Cambios guardados.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error guardando");
    }
    setSaving(false);
  };

  const hayCambios = JSON.stringify(data) !== JSON.stringify(original);

  return (
    <div>
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8">
        <div>
          <h2
            style={{ fontFamily: "'Oswald', sans-serif" }}
            className="text-3xl md:text-5xl text-[#1D1D1F] font-black uppercase leading-none mb-2"
          >
            Concurso IA
          </h2>
          <p className="text-sm text-gray-500 max-w-2xl">
            Textos del nuevo concurso de Becas de Formación en IA (página{" "}
            <code className="px-1 py-0.5 mx-1 bg-gray-100 rounded">
              /concurso-ia
            </code>
            ).
          </p>
          {loading && (
            <p className="text-[#6F2C91] text-xs font-bold animate-pulse mt-2">
              Cargando...
            </p>
          )}
        </div>
        <button
          onClick={guardar}
          disabled={saving || loading || !hayCambios}
          className="px-8 py-3 rounded-2xl bg-[#1D1D1F] text-[#EAE84B] font-black uppercase tracking-widest text-xs hover:bg-[#6F2C91] hover:text-white disabled:opacity-40 transition-all shadow-xl active:scale-95"
        >
          {saving ? "Guardando..." : "Guardar cambios"}
        </button>
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

      <div className="bg-white rounded-[2rem] p-6 md:p-8 shadow-sm border border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
        <div className="md:col-span-2">
          <label className="text-[11px] font-bold uppercase tracking-wider text-gray-500 block mb-1.5">
            Nombre del concurso
          </label>
          <input
            type="text"
            value={data.nombre}
            onChange={(e) => setData((p) => ({ ...p, nombre: e.target.value }))}
            className="w-full py-3 px-4 rounded-xl bg-[#F5F5F7] focus:bg-white border-2 border-transparent focus:border-[#6F2C91] outline-none text-sm text-[#1D1D1F]"
          />
        </div>

        <div className="md:col-span-2">
          <label className="text-[11px] font-bold uppercase tracking-wider text-gray-500 block mb-1.5">
            Banner principal
          </label>
          {data.banner_url && (
            <div className="mb-3 rounded-xl overflow-hidden bg-gray-100 max-h-64">
              <img
                src={data.banner_url}
                alt=""
                className="w-full max-h-64 object-contain"
              />
            </div>
          )}
          <div className="flex gap-3 flex-wrap items-center">
            <label className="px-4 py-2 bg-[#6F2C91] text-white rounded-lg font-bold text-[10px] uppercase tracking-widest cursor-pointer hover:bg-[#5a2376] transition-all">
              {uploading ? "Subiendo..." : "Subir imagen"}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                disabled={uploading}
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) subirBanner(f);
                  e.target.value = "";
                }}
              />
            </label>
            <input
              type="url"
              placeholder="o pegá la URL del banner"
              value={data.banner_url}
              onChange={(e) =>
                setData((p) => ({ ...p, banner_url: e.target.value }))
              }
              className="flex-1 min-w-[260px] py-3 px-4 rounded-xl bg-[#F5F5F7] focus:bg-white border-2 border-transparent focus:border-[#6F2C91] outline-none text-sm text-[#1D1D1F]"
            />
          </div>
        </div>

        <div className="md:col-span-2">
          <label className="text-[11px] font-bold uppercase tracking-wider text-gray-500 block mb-1.5">
            Introducción
          </label>
          <textarea
            value={data.introduccion}
            onChange={(e) =>
              setData((p) => ({ ...p, introduccion: e.target.value }))
            }
            rows={4}
            className="w-full py-3 px-4 rounded-xl bg-[#F5F5F7] focus:bg-white border-2 border-transparent focus:border-[#6F2C91] outline-none text-sm text-[#1D1D1F] resize-y"
          />
        </div>

        <div className="md:col-span-2">
          <label className="text-[11px] font-bold uppercase tracking-wider text-gray-500 block mb-1.5">
            Reglas / Bases (texto completo)
          </label>
          <textarea
            value={data.reglas}
            onChange={(e) =>
              setData((p) => ({ ...p, reglas: e.target.value }))
            }
            rows={10}
            className="w-full py-3 px-4 rounded-xl bg-[#F5F5F7] focus:bg-white border-2 border-transparent focus:border-[#6F2C91] outline-none text-sm text-[#1D1D1F] resize-y"
          />
        </div>

        <div>
          <label className="text-[11px] font-bold uppercase tracking-wider text-gray-500 block mb-1.5">
            Inscripciones abren
          </label>
          <input
            type="date"
            value={data.fecha_inicio}
            onChange={(e) =>
              setData((p) => ({ ...p, fecha_inicio: e.target.value }))
            }
            className="w-full py-3 px-4 rounded-xl bg-[#F5F5F7] focus:bg-white border-2 border-transparent focus:border-[#6F2C91] outline-none text-sm text-[#1D1D1F]"
          />
        </div>

        <div>
          <label className="text-[11px] font-bold uppercase tracking-wider text-gray-500 block mb-1.5">
            Inscripciones cierran
          </label>
          <input
            type="date"
            value={data.fecha_fin}
            onChange={(e) =>
              setData((p) => ({ ...p, fecha_fin: e.target.value }))
            }
            className="w-full py-3 px-4 rounded-xl bg-[#F5F5F7] focus:bg-white border-2 border-transparent focus:border-[#6F2C91] outline-none text-sm text-[#1D1D1F]"
          />
        </div>

        <div className="md:col-span-2">
          <label className="text-[11px] font-bold uppercase tracking-wider text-gray-500 block mb-1.5">
            Link a PDF de bases (opcional)
          </label>
          <input
            type="url"
            value={data.link_bases}
            onChange={(e) =>
              setData((p) => ({ ...p, link_bases: e.target.value }))
            }
            placeholder="https://..."
            className="w-full py-3 px-4 rounded-xl bg-[#F5F5F7] focus:bg-white border-2 border-transparent focus:border-[#6F2C91] outline-none text-sm text-[#1D1D1F]"
          />
        </div>

        <label className="flex items-center gap-2 cursor-pointer md:col-span-2">
          <input
            type="checkbox"
            checked={data.activo}
            onChange={(e) =>
              setData((p) => ({ ...p, activo: e.target.checked }))
            }
            className="w-5 h-5 accent-[#6F2C91]"
          />
          <span className="font-bold text-sm text-[#1D1D1F]">
            Concurso activo / visible en la web
          </span>
        </label>
      </div>
    </div>
  );
}
