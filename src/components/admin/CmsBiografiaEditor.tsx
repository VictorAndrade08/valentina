"use client";

import { useEffect, useState, useMemo } from "react";
import { getSupabase } from "@/lib/supabaseClient";

type Bio = {
  id: string;
  orden: number;
  seccion: string;
  identificador: string | null;
  titulo: string | null;
  descripcion: string | null;
  imagen: string | null;
  extra: string | null;
};

type EditState = Omit<Bio, "id">;

const STORAGE_BUCKET = "cms-imagenes";

export default function CmsBiografiaEditor() {
  const [filas, setFilas] = useState<Bio[]>([]);
  const [edits, setEdits] = useState<Record<string, EditState>>({});
  const [loading, setLoading] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filtroSeccion, setFiltroSeccion] = useState<string>("todas");

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const supabase = getSupabase();
      const { data, error } = await supabase
        .from("cms_biografia")
        .select("*")
        .order("orden", { ascending: true });
      if (error) throw error;
      const rows = (data as Bio[]) || [];
      setFilas(rows);
      const initial: Record<string, EditState> = {};
      rows.forEach((r) => {
        initial[r.id] = {
          orden: r.orden,
          seccion: r.seccion,
          identificador: r.identificador || "",
          titulo: r.titulo || "",
          descripcion: r.descripcion || "",
          imagen: r.imagen || "",
          extra: r.extra || "",
        };
      });
      setEdits(initial);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error cargando");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const updateEdit = (id: string, patch: Partial<EditState>) =>
    setEdits((prev) => ({ ...prev, [id]: { ...prev[id], ...patch } }));

  const subirImagen = async (id: string, file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      alert("Imagen supera 5MB.");
      return;
    }
    setUploadingId(id);
    try {
      const supabase = getSupabase();
      const safe = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
      const path = `biografia/${Date.now()}_${safe}`;
      const { error: upErr } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(path, file, { contentType: file.type, upsert: false });
      if (upErr) throw upErr;
      const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path);
      updateEdit(id, { imagen: data.publicUrl });
    } catch (err) {
      alert("Error: " + (err instanceof Error ? err.message : ""));
    }
    setUploadingId(null);
  };

  const guardar = async (id: string) => {
    setSavingId(id);
    try {
      const supabase = getSupabase();
      const { error } = await supabase
        .from("cms_biografia")
        .update({ ...edits[id], updated_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
      await fetchData();
    } catch (err) {
      alert("Error: " + (err instanceof Error ? err.message : ""));
    }
    setSavingId(null);
  };

  const secciones = useMemo(() => {
    const set = new Set<string>();
    filas.forEach((f) => set.add(f.seccion));
    return Array.from(set);
  }, [filas]);

  const filasFiltradas = filas.filter(
    (f) => filtroSeccion === "todas" || f.seccion === filtroSeccion
  );

  return (
    <div>
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8">
        <div>
          <h2
            style={{ fontFamily: "'Oswald', sans-serif" }}
            className="text-3xl md:text-5xl text-[#1D1D1F] font-black uppercase leading-none mb-2"
          >
            Página Biografía
          </h2>
          <p className="text-sm text-gray-500 max-w-2xl">
            Editor de la página `/biografia`. Cada fila es un bloque (hero,
            timeline, gallery, pillars, final).
          </p>
          <div className="mt-3">
            <span className="px-3 py-1 bg-[#EAE84B] text-[#6F2C91] font-bold text-xs rounded-lg">
              {filas.length} bloque{filas.length === 1 ? "" : "s"}
            </span>
          </div>
        </div>
        <select
          value={filtroSeccion}
          onChange={(e) => setFiltroSeccion(e.target.value)}
          className="py-3 px-4 rounded-xl bg-white border-2 border-gray-200 focus:border-[#6F2C91] outline-none text-sm font-bold text-[#1D1D1F]"
        >
          <option value="todas">Todas las secciones</option>
          {secciones.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <div className="mb-4 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm font-bold">
          {error}
        </div>
      )}

      <div className="space-y-4">
        {!loading && filasFiltradas.length === 0 && (
          <div className="bg-white rounded-[2rem] p-12 text-center border border-gray-100">
            <p className="text-gray-400 font-bold uppercase tracking-widest text-sm">
              Sin bloques en esta sección.
            </p>
          </div>
        )}

        {filasFiltradas.map((b) => {
          const ed = edits[b.id] || {
            orden: b.orden,
            seccion: b.seccion,
            identificador: b.identificador || "",
            titulo: b.titulo || "",
            descripcion: b.descripcion || "",
            imagen: b.imagen || "",
            extra: b.extra || "",
          };
          return (
            <div
              key={b.id}
              className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100"
            >
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <span className="px-3 py-1 bg-[#6F2C91] text-white font-black text-[10px] uppercase tracking-widest rounded-lg">
                  {b.seccion}
                </span>
                {b.identificador && (
                  <span className="px-3 py-1 bg-gray-100 text-gray-600 font-bold text-[10px] uppercase tracking-widest rounded-lg">
                    {b.identificador}
                  </span>
                )}
                <span className="text-xs text-gray-400 font-bold">
                  Orden: {b.orden}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-1">
                    Identificador
                  </label>
                  <input
                    type="text"
                    value={ed.identificador || ""}
                    onChange={(e) =>
                      updateEdit(b.id, { identificador: e.target.value })
                    }
                    className="w-full py-2.5 px-3 rounded-lg bg-[#F5F5F7] focus:bg-white border-2 border-transparent focus:border-[#6F2C91] outline-none text-sm text-[#1D1D1F]"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-1">
                    Título
                  </label>
                  <input
                    type="text"
                    value={ed.titulo || ""}
                    onChange={(e) => updateEdit(b.id, { titulo: e.target.value })}
                    className="w-full py-2.5 px-3 rounded-lg bg-[#F5F5F7] focus:bg-white border-2 border-transparent focus:border-[#6F2C91] outline-none text-sm text-[#1D1D1F]"
                  />
                </div>
              </div>

              <div className="mb-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-1">
                  Descripción
                </label>
                <textarea
                  value={ed.descripcion || ""}
                  onChange={(e) =>
                    updateEdit(b.id, { descripcion: e.target.value })
                  }
                  rows={3}
                  className="w-full py-2.5 px-3 rounded-lg bg-[#F5F5F7] focus:bg-white border-2 border-transparent focus:border-[#6F2C91] outline-none text-sm text-[#1D1D1F] resize-y"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-[1fr,180px] gap-3 mb-3">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-1">
                    Imagen (URL)
                  </label>
                  <input
                    type="url"
                    value={ed.imagen || ""}
                    onChange={(e) => updateEdit(b.id, { imagen: e.target.value })}
                    className="w-full py-2.5 px-3 rounded-lg bg-[#F5F5F7] focus:bg-white border-2 border-transparent focus:border-[#6F2C91] outline-none text-sm text-[#1D1D1F]"
                  />
                </div>
                <label className="block self-end">
                  <span className="px-3 py-2.5 bg-[#6F2C91] text-white rounded-lg font-bold text-[10px] uppercase tracking-widest cursor-pointer hover:bg-[#5a2376] transition-all text-center block">
                    {uploadingId === b.id ? "Subiendo..." : "Subir imagen"}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={uploadingId === b.id}
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) subirImagen(b.id, f);
                      e.target.value = "";
                    }}
                  />
                </label>
              </div>

              {ed.imagen && (
                <div className="mb-3 rounded-xl overflow-hidden bg-gray-100 max-h-40">
                  <img
                    src={ed.imagen}
                    alt=""
                    className="w-full max-h-40 object-contain"
                  />
                </div>
              )}

              <div className="mb-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-1">
                  Extra (icono / nota)
                </label>
                <input
                  type="text"
                  value={ed.extra || ""}
                  onChange={(e) => updateEdit(b.id, { extra: e.target.value })}
                  className="w-full py-2.5 px-3 rounded-lg bg-[#F5F5F7] focus:bg-white border-2 border-transparent focus:border-[#6F2C91] outline-none text-sm text-[#1D1D1F]"
                />
              </div>

              <div className="flex justify-end pt-3 border-t border-gray-100">
                <button
                  disabled={savingId === b.id || uploadingId === b.id}
                  onClick={() => guardar(b.id)}
                  className="px-8 py-3 rounded-xl bg-[#1D1D1F] text-[#EAE84B] font-black text-xs uppercase tracking-widest hover:bg-[#6F2C91] hover:text-white disabled:opacity-40 transition-all shadow-lg active:scale-95"
                >
                  {savingId === b.id ? "Guardando..." : "Guardar"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
