"use client";

import { useEffect, useState } from "react";
import { getSupabase } from "@/lib/supabaseClient";

type Agenda = {
  id?: string;
  title: string;
  tag: string;
  subtitle: string;
  description: string;
  bullets: string;
  quote: string;
  image: string;
};

const STORAGE_BUCKET = "cms-imagenes";

const EMPTY: Agenda = {
  title: "",
  tag: "",
  subtitle: "",
  description: "",
  bullets: "",
  quote: "",
  image: "",
};

export default function CmsAgendaEditor() {
  const [data, setData] = useState<Agenda>(EMPTY);
  const [original, setOriginal] = useState<Agenda>(EMPTY);
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
        .from("cms_agenda_internacional")
        .select("*")
        .limit(1)
        .order("updated_at", { ascending: false });
      if (error) throw error;
      if (rows && rows.length > 0) {
        const r = rows[0] as Agenda;
        const next: Agenda = {
          title: r.title || "",
          tag: r.tag || "",
          subtitle: r.subtitle || "",
          description: r.description || "",
          bullets: r.bullets || "",
          quote: r.quote || "",
          image: r.image || "",
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

  const subirImagen = async (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      alert("La imagen supera 5MB.");
      return;
    }
    setUploading(true);
    try {
      const supabase = getSupabase();
      const safe = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
      const path = `agenda/${Date.now()}_${safe}`;
      const { error: upErr } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(path, file, { contentType: file.type, upsert: false });
      if (upErr) throw upErr;
      const { data: u } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path);
      setData((prev) => ({ ...prev, image: u.publicUrl }));
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
        title: data.title || null,
        tag: data.tag || null,
        subtitle: data.subtitle || null,
        description: data.description || null,
        bullets: data.bullets || null,
        quote: data.quote || null,
        image: data.image || null,
        updated_at: new Date().toISOString(),
      };
      if (rowId) {
        const { error } = await supabase
          .from("cms_agenda_internacional")
          .update(payload)
          .eq("id", rowId);
        if (error) throw error;
      } else {
        const { data: ins, error } = await supabase
          .from("cms_agenda_internacional")
          .insert(payload)
          .select()
          .single();
        if (error) throw error;
        setRowId(ins.id);
      }
      setOriginal({ ...data });
      setOkMsg("Cambios guardados correctamente.");
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
            Agenda Internacional
          </h2>
          <p className="text-sm text-gray-500 max-w-2xl">
            Sección "Naciones Unidas / UIP" del home. Los bullets se separan
            con punto y coma (;).
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

      <div className="bg-white rounded-[2rem] p-6 md:p-8 shadow-sm border border-gray-100 space-y-6">
        {[
          { k: "title", l: "Título principal", t: "input" },
          { k: "tag", l: "Etiqueta (tag superior)", t: "input" },
          { k: "subtitle", l: "Subtítulo", t: "input" },
          { k: "description", l: "Descripción", t: "textarea" },
          {
            k: "bullets",
            l: "Acciones estratégicas (separadas por ;)",
            t: "textarea",
          },
          { k: "quote", l: "Frase destacada (quote)", t: "textarea" },
        ].map((f) => (
          <div key={f.k}>
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-2">
              {f.l}
            </label>
            {f.t === "textarea" ? (
              <textarea
                value={(data as unknown as Record<string, string>)[f.k] || ""}
                onChange={(e) =>
                  setData((prev) => ({ ...prev, [f.k]: e.target.value }))
                }
                rows={4}
                className="w-full py-3 px-4 rounded-xl bg-[#F5F5F7] focus:bg-white border-2 border-transparent focus:border-[#6F2C91] outline-none text-sm text-[#1D1D1F] resize-y"
              />
            ) : (
              <input
                type="text"
                value={(data as unknown as Record<string, string>)[f.k] || ""}
                onChange={(e) =>
                  setData((prev) => ({ ...prev, [f.k]: e.target.value }))
                }
                className="w-full py-3 px-4 rounded-xl bg-[#F5F5F7] focus:bg-white border-2 border-transparent focus:border-[#6F2C91] outline-none text-sm text-[#1D1D1F]"
              />
            )}
          </div>
        ))}

        <div>
          <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-2">
            Imagen
          </label>
          {data.image && (
            <div className="mb-3 rounded-xl overflow-hidden bg-gray-100 max-h-64">
              <img src={data.image} alt="" className="w-full max-h-64 object-contain" />
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
                  if (f) subirImagen(f);
                  e.target.value = "";
                }}
              />
            </label>
            <input
              type="url"
              placeholder="o pega URL de imagen"
              value={data.image || ""}
              onChange={(e) => setData((prev) => ({ ...prev, image: e.target.value }))}
              className="flex-1 min-w-[260px] py-3 px-4 rounded-xl bg-[#F5F5F7] focus:bg-white border-2 border-transparent focus:border-[#6F2C91] outline-none text-sm text-[#1D1D1F]"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
