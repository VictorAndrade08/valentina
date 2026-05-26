"use client";

import { useEffect, useState } from "react";
import { getSupabase } from "@/lib/supabaseClient";

type Ley = {
  id: string;
  orden: number;
  title_top: string | null;
  title: string | null;
  img: string | null;
  descripcion: string | null;
  full_text: string | null;
  section_title: string | null;
  section_subtitle: string | null;
  activo: boolean;
};

type EditState = Omit<Ley, "id">;

const STORAGE_BUCKET = "cms-imagenes";

const empty = (orden: number): EditState => ({
  orden,
  title_top: "",
  title: "",
  img: "",
  descripcion: "",
  full_text: "",
  section_title: "",
  section_subtitle: "",
  activo: true,
});

export default function CmsLeyesEditor() {
  const [leyes, setLeyes] = useState<Ley[]>([]);
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
        .from("cms_leyes")
        .select("*")
        .order("orden", { ascending: true });
      if (error) throw error;
      const rows = (data as Ley[]) || [];
      setLeyes(rows);
      const initial: Record<string, EditState> = {};
      rows.forEach((l) => {
        initial[l.id] = {
          orden: l.orden,
          title_top: l.title_top || "",
          title: l.title || "",
          img: l.img || "",
          descripcion: l.descripcion || "",
          full_text: l.full_text || "",
          section_title: l.section_title || "",
          section_subtitle: l.section_subtitle || "",
          activo: l.activo,
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

  const updateEdit = (id: string, patch: Partial<EditState>) => {
    setEdits((prev) => ({ ...prev, [id]: { ...prev[id], ...patch } }));
  };

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
      const path = `leyes/${Date.now()}_${safe}`;
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
      const { error } = await supabase
        .from("cms_leyes")
        .update({ ...edits[id], updated_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
      await fetchData();
    } catch (err) {
      alert("Error: " + (err instanceof Error ? err.message : ""));
    }
    setSavingId(null);
  };

  const eliminar = async (id: string) => {
    if (!confirm("¿Eliminar esta ley?")) return;
    try {
      const supabase = getSupabase();
      const { error } = await supabase.from("cms_leyes").delete().eq("id", id);
      if (error) throw error;
      await fetchData();
    } catch (err) {
      alert("Error: " + (err instanceof Error ? err.message : ""));
    }
  };

  const agregar = async () => {
    if (!nueva.title) {
      alert("Pon al menos un título.");
      return;
    }
    setSavingNueva(true);
    try {
      const supabase = getSupabase();
      const maxOrden = leyes.reduce((a, l) => Math.max(a, l.orden), 0);
      const { error } = await supabase.from("cms_leyes").insert({
        ...nueva,
        orden: nueva.orden || maxOrden + 1,
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
            Leyes / Logros legislativos
          </h2>
          <p className="text-sm text-gray-500 max-w-2xl">
            Carrusel de cards "¡Lo que hemos logrado!". Cada item tiene una
            descripción corta y un texto completo (que aparece al abrir el card).
          </p>
          <div className="mt-3">
            <span className="px-3 py-1 bg-[#EAE84B] text-[#6F2C91] font-bold text-xs rounded-lg">
              {leyes.length} item{leyes.length === 1 ? "" : "s"}
            </span>
          </div>
        </div>
        <button
          onClick={() => setShowAdd((s) => !s)}
          className="px-8 py-3 rounded-2xl bg-[#1D1D1F] text-[#EAE84B] font-black uppercase tracking-widest text-xs hover:bg-[#6F2C91] hover:text-white transition-all shadow-xl active:scale-95"
        >
          {showAdd ? "Cancelar" : "+ Agregar ley"}
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
            Nueva ley
          </h3>
          <LeyForm
            estado={nueva}
            onChange={setNueva}
            uploading={uploadingNueva}
            onUpload={(f, onUrl) =>
              subirImagen(f, onUrl, setUploadingNueva)
            }
          />
          <div className="flex justify-end gap-3 mt-4">
            <button
              onClick={() => {
                setShowAdd(false);
                setNueva(empty(0));
              }}
              className="px-5 py-3 rounded-xl bg-gray-100 text-gray-600 font-black text-xs uppercase tracking-widest hover:bg-gray-200 transition-all"
            >
              Cancelar
            </button>
            <button
              disabled={savingNueva || uploadingNueva}
              onClick={agregar}
              className="px-8 py-3 rounded-xl bg-[#6F2C91] text-white font-black text-xs uppercase tracking-widest hover:bg-[#1D1D1F] hover:text-[#EAE84B] disabled:opacity-40 transition-all shadow-lg active:scale-95"
            >
              {savingNueva ? "Guardando..." : "Guardar ley"}
            </button>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {!loading && leyes.length === 0 && (
          <div className="bg-white rounded-[2rem] p-12 text-center border border-gray-100">
            <p className="text-gray-400 font-bold uppercase tracking-widest text-sm">
              No hay leyes guardadas.
            </p>
          </div>
        )}

        {leyes.map((l) => {
          const ed = edits[l.id] || empty(l.orden);
          return (
            <div
              key={l.id}
              className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100"
            >
              <LeyForm
                estado={ed}
                onChange={(patch) =>
                  updateEdit(
                    l.id,
                    typeof patch === "function" ? patch(ed) : patch
                  )
                }
                uploading={uploadingId === l.id}
                onUpload={(f, onUrl) =>
                  subirImagen(f, onUrl, (b) =>
                    setUploadingId(b ? l.id : null)
                  )
                }
              />
              <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-gray-100">
                <button
                  onClick={() => eliminar(l.id)}
                  className="px-5 py-3 rounded-xl bg-red-50 text-red-600 font-black text-xs uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all"
                >
                  Eliminar
                </button>
                <button
                  disabled={savingId === l.id || uploadingId === l.id}
                  onClick={() => guardar(l.id)}
                  className="px-8 py-3 rounded-xl bg-[#1D1D1F] text-[#EAE84B] font-black text-xs uppercase tracking-widest hover:bg-[#6F2C91] hover:text-white disabled:opacity-40 transition-all shadow-lg active:scale-95"
                >
                  {savingId === l.id ? "Guardando..." : "Guardar"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

type LeyFormProps = {
  estado: EditState;
  onChange: (next: EditState | ((prev: EditState) => EditState)) => void;
  uploading: boolean;
  onUpload: (file: File, onUrl: (url: string) => void) => void;
};

function LeyForm({ estado, onChange, uploading, onUpload }: LeyFormProps) {
  const set = (patch: Partial<EditState>) =>
    onChange((prev) => ({ ...prev, ...patch }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[180px,1fr] gap-6">
      <div className="space-y-3">
        <div className="rounded-xl overflow-hidden bg-gray-100 aspect-[4/5] flex items-center justify-center">
          {estado.img ? (
            <img src={estado.img} alt="" className="w-full h-full object-cover" />
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
              if (f) onUpload(f, (url) => set({ img: url }));
              e.target.value = "";
            }}
          />
        </label>
      </div>

      <div className="space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-[1fr,100px] gap-3">
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-1">
              Antetítulo (ej: "EMPLEO JOVEN")
            </label>
            <input
              type="text"
              value={estado.title_top || ""}
              onChange={(e) => set({ title_top: e.target.value })}
              className="w-full py-2.5 px-3 rounded-lg bg-[#F5F5F7] focus:bg-white border-2 border-transparent focus:border-[#6F2C91] outline-none text-sm text-[#1D1D1F]"
            />
          </div>
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-1">
              Orden
            </label>
            <input
              type="number"
              value={estado.orden}
              onChange={(e) => set({ orden: Number(e.target.value) || 0 })}
              className="w-full py-2.5 px-3 rounded-lg bg-[#F5F5F7] focus:bg-white border-2 border-transparent focus:border-[#6F2C91] outline-none text-sm text-[#1D1D1F]"
            />
          </div>
        </div>

        <div>
          <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-1">
            Título principal (línea grande del card)
          </label>
          <input
            type="text"
            value={estado.title || ""}
            onChange={(e) => set({ title: e.target.value })}
            className="w-full py-2.5 px-3 rounded-lg bg-[#F5F5F7] focus:bg-white border-2 border-transparent focus:border-[#6F2C91] outline-none text-sm text-[#1D1D1F]"
          />
        </div>

        <div>
          <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-1">
            URL de imagen (o sube nueva)
          </label>
          <input
            type="url"
            value={estado.img || ""}
            onChange={(e) => set({ img: e.target.value })}
            className="w-full py-2.5 px-3 rounded-lg bg-[#F5F5F7] focus:bg-white border-2 border-transparent focus:border-[#6F2C91] outline-none text-sm text-[#1D1D1F]"
          />
        </div>

        <div>
          <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-1">
            Descripción corta (vista del card)
          </label>
          <textarea
            value={estado.descripcion || ""}
            onChange={(e) => set({ descripcion: e.target.value })}
            rows={2}
            className="w-full py-2.5 px-3 rounded-lg bg-[#F5F5F7] focus:bg-white border-2 border-transparent focus:border-[#6F2C91] outline-none text-sm text-[#1D1D1F] resize-y"
          />
        </div>

        <div>
          <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-1">
            Texto completo (al abrir el modal)
          </label>
          <textarea
            value={estado.full_text || ""}
            onChange={(e) => set({ full_text: e.target.value })}
            rows={6}
            className="w-full py-2.5 px-3 rounded-lg bg-[#F5F5F7] focus:bg-white border-2 border-transparent focus:border-[#6F2C91] outline-none text-sm text-[#1D1D1F] resize-y"
          />
        </div>

        <label className="flex items-center gap-2 cursor-pointer">
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
