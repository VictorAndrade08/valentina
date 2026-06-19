"use client";

import { useEffect, useState } from "react";
import { getSupabase } from "@/lib/supabaseClient";

type Noticia = {
  id: string;
  orden: number;
  titulo: string | null;
  imagen: string | null;
  link_opcional: string | null;
  fecha: string | null;
  activo: boolean;
};

type EditState = Omit<Noticia, "id">;

const STORAGE_BUCKET = "cms-imagenes";

const empty = (orden: number): EditState => ({
  orden,
  titulo: "",
  imagen: "",
  link_opcional: "",
  fecha: new Date().toISOString().split("T")[0],
  activo: true,
});

export default function CmsNoticiasEditor() {
  const [noticias, setNoticias] = useState<Noticia[]>([]);
  const [edits, setEdits] = useState<Record<string, EditState>>({});
  const [loading, setLoading] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [nueva, setNueva] = useState<EditState>(empty(0));
  const [savingNueva, setSavingNueva] = useState(false);
  const [uploadingNueva, setUploadingNueva] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const supabase = getSupabase();
      const { data, error } = await supabase
        .from("cms_noticias")
        .select("*")
        .order("orden", { ascending: true });
      if (error) throw error;
      const rows = (data as Noticia[]) || [];
      setNoticias(rows);
      const initial: Record<string, EditState> = {};
      rows.forEach((n) => {
        initial[n.id] = {
          orden: n.orden,
          titulo: n.titulo || "",
          imagen: n.imagen || "",
          link_opcional: n.link_opcional || "",
          fecha: n.fecha ? n.fecha.split("T")[0] : "",
          activo: n.activo,
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

  const subirImagen = async (
    file: File,
    onUrl: (url: string) => void,
    setBusy: (b: boolean) => void
  ) => {
    if (file.size > 5 * 1024 * 1024) {
      alert("Imagen supera 5MB.");
      return;
    }
    setBusy(true);
    try {
      const supabase = getSupabase();
      const safe = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
      const path = `noticias/${Date.now()}_${safe}`;
      const { error: upErr } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(path, file, { contentType: file.type, upsert: false });
      if (upErr) throw upErr;
      const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path);
      onUrl(data.publicUrl);
    } catch (err) {
      alert("Error subiendo: " + (err instanceof Error ? err.message : ""));
    }
    setBusy(false);
  };

  const guardar = async (id: string) => {
    setSavingId(id);
    try {
      const supabase = getSupabase();
      const e = edits[id];
      const payload = {
        ...e,
        fecha: e.fecha ? new Date(e.fecha).toISOString() : null,
        updated_at: new Date().toISOString(),
      };
      const { error } = await supabase
        .from("cms_noticias")
        .update(payload)
        .eq("id", id);
      if (error) throw error;
      await fetchData();
    } catch (err) {
      alert("Error: " + (err instanceof Error ? err.message : ""));
    }
    setSavingId(null);
  };

  const eliminar = async (id: string) => {
    if (!confirm("¿Eliminar esta noticia?")) return;
    try {
      const supabase = getSupabase();
      const { error } = await supabase.from("cms_noticias").delete().eq("id", id);
      if (error) throw error;
      await fetchData();
    } catch (err) {
      alert("Error: " + (err instanceof Error ? err.message : ""));
    }
  };

  const agregar = async () => {
    if (!nueva.imagen) {
      alert("Subí una imagen para la noticia.");
      return;
    }
    setSavingNueva(true);
    try {
      const supabase = getSupabase();
      const maxOrden = noticias.reduce((a, n) => Math.max(a, n.orden), 0);
      const { error } = await supabase.from("cms_noticias").insert({
        ...nueva,
        orden: nueva.orden || maxOrden + 1,
        fecha: nueva.fecha ? new Date(nueva.fecha).toISOString() : null,
      });
      if (error) throw error;
      setNueva(empty(0));
      setShowAdd(false);
      await fetchData();
    } catch (err) {
      alert("Error: " + (err instanceof Error ? err.message : ""));
    }
    setSavingNueva(false);
  };

  return (
    <div>
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8">
        <div>
          <h2
            style={{ fontFamily: "'Oswald', sans-serif" }}
            className="text-3xl md:text-5xl text-[#1D1D1F] font-black uppercase leading-none mb-2"
          >
            Noticias / Anuncios
          </h2>
          <p className="text-sm text-gray-500 max-w-2xl">
            Corcho de flyers, campañas y avisos. Cada item es una imagen con
            título opcional y link.
          </p>
          <div className="mt-3">
            <span className="px-3 py-1 bg-[#EAE84B] text-[#6F2C91] font-bold text-xs rounded-lg">
              {noticias.length} item{noticias.length === 1 ? "" : "s"}
            </span>
          </div>
        </div>
        <button
          onClick={() => setShowAdd((s) => !s)}
          className="px-8 py-3 rounded-2xl bg-[#1D1D1F] text-[#EAE84B] font-black uppercase tracking-widest text-xs hover:bg-[#6F2C91] hover:text-white transition-all shadow-xl active:scale-95"
        >
          {showAdd ? "Cancelar" : "+ Agregar noticia"}
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm font-bold">
          {error}
        </div>
      )}

      {showAdd && (
        <div className="mb-8 p-6 rounded-[2rem] bg-white shadow-sm border-2 border-[#6F2C91]/30">
          <h3 className="text-xs font-black uppercase tracking-[0.2em] text-[#6F2C91] mb-4">
            Nueva noticia
          </h3>
          <NoticiaForm
            estado={nueva}
            onChange={setNueva}
            uploading={uploadingNueva}
            onUpload={(f, onUrl) => subirImagen(f, onUrl, setUploadingNueva)}
          />
          <div className="flex justify-end gap-3 mt-4">
            <button
              onClick={() => {
                setShowAdd(false);
                setNueva(empty(0));
              }}
              className="px-5 py-3 rounded-xl bg-gray-100 text-gray-600 font-black text-xs uppercase tracking-widest"
            >
              Cancelar
            </button>
            <button
              disabled={savingNueva || uploadingNueva}
              onClick={agregar}
              className="px-8 py-3 rounded-xl bg-[#6F2C91] text-white font-black text-xs uppercase tracking-widest hover:bg-[#1D1D1F] hover:text-[#EAE84B] disabled:opacity-40 transition-all shadow-lg active:scale-95"
            >
              {savingNueva ? "Guardando..." : "Guardar noticia"}
            </button>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {!loading && noticias.length === 0 && (
          <div className="bg-white rounded-[2rem] p-12 text-center border border-gray-100">
            <p className="text-gray-400 font-bold uppercase tracking-widest text-sm">
              No hay noticias publicadas.
            </p>
          </div>
        )}

        {noticias.map((n) => {
          const ed = edits[n.id] || empty(n.orden);
          return (
            <div
              key={n.id}
              className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100"
            >
              <NoticiaForm
                estado={ed}
                onChange={(p) =>
                  updateEdit(n.id, typeof p === "function" ? p(ed) : p)
                }
                uploading={uploadingId === n.id}
                onUpload={(f, onUrl) =>
                  subirImagen(f, onUrl, (b) => setUploadingId(b ? n.id : null))
                }
              />
              <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-gray-100">
                <button
                  onClick={() => eliminar(n.id)}
                  className="px-5 py-3 rounded-xl bg-red-50 text-red-600 font-black text-xs uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all"
                >
                  Eliminar
                </button>
                <button
                  disabled={savingId === n.id || uploadingId === n.id}
                  onClick={() => guardar(n.id)}
                  className="px-8 py-3 rounded-xl bg-[#1D1D1F] text-[#EAE84B] font-black text-xs uppercase tracking-widest hover:bg-[#6F2C91] hover:text-white disabled:opacity-40 transition-all shadow-lg active:scale-95"
                >
                  {savingId === n.id ? "Guardando..." : "Guardar"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

type FormProps = {
  estado: EditState;
  onChange: (next: EditState | ((prev: EditState) => EditState)) => void;
  uploading: boolean;
  onUpload: (file: File, onUrl: (url: string) => void) => void;
};

function NoticiaForm({ estado, onChange, uploading, onUpload }: FormProps) {
  const set = (patch: Partial<EditState>) =>
    onChange((prev) => ({ ...prev, ...patch }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[200px,1fr] gap-6">
      <div className="space-y-3">
        <div className="rounded-xl overflow-hidden bg-gray-100 aspect-[4/5] flex items-center justify-center">
          {estado.imagen ? (
            <img src={estado.imagen} alt="" className="w-full h-full object-cover" />
          ) : (
            <span className="text-xs text-gray-400 font-bold uppercase px-2 text-center">
              Sin imagen
            </span>
          )}
        </div>
        <label className="block">
          <span className="px-3 py-2 bg-[#6F2C91] text-white rounded-lg font-bold text-[10px] uppercase tracking-widest cursor-pointer hover:bg-[#5a2376] transition-all text-center block">
            {uploading ? "Subiendo..." : "Subir imagen"}
          </span>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            disabled={uploading}
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) onUpload(f, (url) => set({ imagen: url }));
              e.target.value = "";
            }}
          />
        </label>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
        <div className="md:col-span-2">
          <label className="text-[11px] font-bold uppercase tracking-wider text-gray-500 block mb-1.5">
            Título (opcional)
          </label>
          <input
            type="text"
            value={estado.titulo || ""}
            onChange={(e) => set({ titulo: e.target.value })}
            className="w-full py-2.5 px-3 rounded-lg bg-[#F5F5F7] focus:bg-white border-2 border-transparent focus:border-[#6F2C91] outline-none text-sm text-[#1D1D1F]"
          />
        </div>
        <div className="md:col-span-2">
          <label className="text-[11px] font-bold uppercase tracking-wider text-gray-500 block mb-1.5">
            URL de imagen (o subí una arriba)
          </label>
          <input
            type="url"
            value={estado.imagen || ""}
            onChange={(e) => set({ imagen: e.target.value })}
            className="w-full py-2.5 px-3 rounded-lg bg-[#F5F5F7] focus:bg-white border-2 border-transparent focus:border-[#6F2C91] outline-none text-sm text-[#1D1D1F]"
          />
        </div>
        <div>
          <label className="text-[11px] font-bold uppercase tracking-wider text-gray-500 block mb-1.5">
            Fecha
          </label>
          <input
            type="date"
            value={estado.fecha || ""}
            onChange={(e) => set({ fecha: e.target.value })}
            className="w-full py-2.5 px-3 rounded-lg bg-[#F5F5F7] focus:bg-white border-2 border-transparent focus:border-[#6F2C91] outline-none text-sm text-[#1D1D1F]"
          />
        </div>
        <div>
          <label className="text-[11px] font-bold uppercase tracking-wider text-gray-500 block mb-1.5">
            Orden
          </label>
          <input
            type="number"
            value={estado.orden}
            onChange={(e) => set({ orden: Number(e.target.value) || 0 })}
            className="w-full py-2.5 px-3 rounded-lg bg-[#F5F5F7] focus:bg-white border-2 border-transparent focus:border-[#6F2C91] outline-none text-sm text-[#1D1D1F]"
          />
        </div>
        <div className="md:col-span-2">
          <label className="text-[11px] font-bold uppercase tracking-wider text-gray-500 block mb-1.5">
            Link opcional (a un post, página externa, etc.)
          </label>
          <input
            type="url"
            value={estado.link_opcional || ""}
            onChange={(e) => set({ link_opcional: e.target.value })}
            placeholder="https://..."
            className="w-full py-2.5 px-3 rounded-lg bg-[#F5F5F7] focus:bg-white border-2 border-transparent focus:border-[#6F2C91] outline-none text-sm text-[#1D1D1F]"
          />
        </div>
        <label className="flex items-center gap-2 cursor-pointer md:col-span-2">
          <input
            type="checkbox"
            checked={estado.activo}
            onChange={(e) => set({ activo: e.target.checked })}
            className="w-5 h-5 accent-[#6F2C91]"
          />
          <span className="font-bold text-sm text-[#1D1D1F]">
            Visible en la web
          </span>
        </label>
      </div>
    </div>
  );
}
