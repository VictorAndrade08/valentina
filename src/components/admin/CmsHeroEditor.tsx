"use client";

import { useEffect, useState } from "react";
import { getSupabase } from "@/lib/supabaseClient";

type Banner = {
  id: string;
  img: string | null;
  link: string;
  orden: number;
  activo: boolean;
  created_at?: string;
  updated_at?: string;
};

type EditState = {
  img: string;
  link: string;
  orden: number;
  activo: boolean;
};

const STORAGE_BUCKET = "cms-imagenes";
const MAX_IMG_BYTES = 2 * 1024 * 1024; // 2MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];

export default function CmsHeroEditor() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [edits, setEdits] = useState<Record<string, EditState>>({});
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [newBanner, setNewBanner] = useState<EditState>({
    img: "",
    link: "",
    orden: 0,
    activo: true,
  });
  const [uploadingNew, setUploadingNew] = useState(false);
  const [savingNew, setSavingNew] = useState(false);

  const fetchBanners = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const supabase = getSupabase();
      const { data, error } = await supabase
        .from("cms_hero")
        .select("*")
        .order("orden", { ascending: true });
      if (error) throw error;
      const rows = (data as Banner[]) || [];
      setBanners(rows);
      const initial: Record<string, EditState> = {};
      rows.forEach((b) => {
        initial[b.id] = {
          img: b.img || "",
          link: b.link || "",
          orden: b.orden ?? 0,
          activo: b.activo ?? true,
        };
      });
      setEdits(initial);
    } catch (err) {
      setErrorMsg(
        err instanceof Error ? err.message : "Error cargando banners"
      );
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const updateEdit = (id: string, patch: Partial<EditState>) => {
    setEdits((prev) => ({ ...prev, [id]: { ...prev[id], ...patch } }));
  };

  const subirImagen = async (
    file: File,
    onUrl: (url: string) => void,
    setBusy: (busy: boolean) => void
  ) => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      alert("Solo se permiten imágenes JPG, PNG, WEBP o AVIF.");
      return;
    }
    if (file.size > MAX_IMG_BYTES) {
      alert("La imagen supera el límite de 2MB.");
      return;
    }
    setBusy(true);
    try {
      const supabase = getSupabase();
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
      const path = `hero/${Date.now()}_${safeName}`;
      const { error: upErr } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(path, file, {
          cacheControl: "3600",
          upsert: false,
          contentType: file.type,
        });
      if (upErr) throw upErr;
      const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path);
      onUrl(data.publicUrl);
    } catch (err) {
      alert(
        "Error subiendo imagen: " +
          (err instanceof Error ? err.message : "desconocido")
      );
    }
    setBusy(false);
  };

  const guardarBanner = async (id: string) => {
    const ed = edits[id];
    if (!ed) return;
    setSavingId(id);
    try {
      const supabase = getSupabase();
      const { error } = await supabase
        .from("cms_hero")
        .update({
          img: ed.img || null,
          link: ed.link || "",
          orden: ed.orden,
          activo: ed.activo,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);
      if (error) throw error;
      await fetchBanners();
    } catch (err) {
      alert(
        "No se pudo guardar: " +
          (err instanceof Error ? err.message : "desconocido")
      );
    }
    setSavingId(null);
  };

  const eliminarBanner = async (id: string) => {
    if (
      !confirm("¿Eliminar este banner? Esta acción no se puede deshacer.")
    )
      return;
    try {
      const supabase = getSupabase();
      const { error } = await supabase.from("cms_hero").delete().eq("id", id);
      if (error) throw error;
      await fetchBanners();
    } catch (err) {
      alert(
        "No se pudo eliminar: " +
          (err instanceof Error ? err.message : "desconocido")
      );
    }
  };

  const agregarBanner = async () => {
    if (!newBanner.img) {
      alert("Sube una imagen o pega una URL antes de guardar.");
      return;
    }
    setSavingNew(true);
    try {
      const supabase = getSupabase();
      const maxOrden = banners.reduce((acc, b) => Math.max(acc, b.orden), 0);
      const ordenFinal = newBanner.orden || maxOrden + 1;
      const { error } = await supabase.from("cms_hero").insert({
        img: newBanner.img,
        link: newBanner.link || "",
        orden: ordenFinal,
        activo: newBanner.activo,
      });
      if (error) throw error;
      setNewBanner({ img: "", link: "", orden: 0, activo: true });
      setShowAdd(false);
      await fetchBanners();
    } catch (err) {
      alert(
        "No se pudo agregar: " +
          (err instanceof Error ? err.message : "desconocido")
      );
    }
    setSavingNew(false);
  };

  return (
    <div>
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10">
        <div>
          <h2
            style={{ fontFamily: "'Oswald', sans-serif" }}
            className="text-4xl md:text-6xl text-[#1D1D1F] font-black uppercase leading-none mb-3"
          >
            BANNERS DEL <span className="text-[#6F2C91]">CARRUSEL</span>
          </h2>
          <div className="flex items-center gap-3 flex-wrap">
            <span className="px-4 py-1.5 bg-[#EAE84B] text-[#6F2C91] font-bold text-sm rounded-lg shadow-sm">
              {banners.length} banner{banners.length === 1 ? "" : "s"}
            </span>
            {loading && (
              <span className="text-[#6F2C91] text-xs font-bold animate-pulse">
                Cargando...
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500 mt-3 max-w-xl">
            Estos banners aparecen en el carrusel principal de la página
            (sección INICIO). Los desactivados se ocultan en la web pero
            quedan guardados aquí.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={fetchBanners}
            className="p-4 rounded-2xl bg-white text-[#1D1D1F] hover:text-[#6F2C91] shadow-sm hover:shadow-md transition-all active:scale-95"
            title="Refrescar"
          >
            <svg
              className={`w-6 h-6 ${loading ? "animate-spin" : ""}`}
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
            onClick={() => setShowAdd((s) => !s)}
            className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-[#1D1D1F] text-[#EAE84B] font-black uppercase tracking-widest text-xs hover:bg-[#6F2C91] hover:text-white transition-all shadow-xl active:scale-95"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 4v16m8-8H4"
              />
            </svg>
            {showAdd ? "Cancelar" : "Agregar banner"}
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm font-bold">
          {errorMsg}
        </div>
      )}

      {/* FORM AGREGAR */}
      {showAdd && (
        <div className="mb-8 p-6 rounded-[2rem] bg-white shadow-sm border-2 border-[#6F2C91]/30">
          <h3 className="text-xs font-black uppercase tracking-[0.2em] text-[#6F2C91] mb-4">
            Nuevo banner
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-1">
                Imagen
              </label>
              {newBanner.img && (
                <div className="mb-3 rounded-xl overflow-hidden bg-gray-100 max-h-48">
                  <img
                    src={newBanner.img}
                    alt="Preview"
                    className="w-full max-h-48 object-contain"
                  />
                </div>
              )}
              <div className="flex gap-3 flex-wrap items-center">
                <label className="px-5 py-3 bg-[#6F2C91] text-white rounded-xl font-bold text-xs uppercase tracking-widest cursor-pointer hover:bg-[#5a2376] transition-all">
                  {uploadingNew ? "Subiendo..." : "Subir imagen"}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={uploadingNew}
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f)
                        subirImagen(
                          f,
                          (url) =>
                            setNewBanner((prev) => ({ ...prev, img: url })),
                          setUploadingNew
                        );
                      e.target.value = "";
                    }}
                  />
                </label>
                <span className="text-gray-400 text-xs">o</span>
                <input
                  type="url"
                  placeholder="Pega aquí una URL de imagen"
                  value={newBanner.img}
                  onChange={(e) =>
                    setNewBanner((prev) => ({ ...prev, img: e.target.value }))
                  }
                  className="flex-1 min-w-[260px] py-3 px-4 rounded-xl bg-[#F5F5F7] focus:bg-white border-2 border-transparent focus:border-[#6F2C91] outline-none text-sm text-[#1D1D1F]"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-1">
                Link al hacer click
              </label>
              <input
                type="text"
                placeholder="#buzon, #ley, /concurso, https://..."
                value={newBanner.link}
                onChange={(e) =>
                  setNewBanner((prev) => ({ ...prev, link: e.target.value }))
                }
                className="w-full py-3 px-4 rounded-xl bg-[#F5F5F7] focus:bg-white border-2 border-transparent focus:border-[#6F2C91] outline-none text-sm text-[#1D1D1F]"
              />
            </div>

            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-1">
                Orden (menor primero)
              </label>
              <input
                type="number"
                value={newBanner.orden || ""}
                placeholder="auto"
                onChange={(e) =>
                  setNewBanner((prev) => ({
                    ...prev,
                    orden: Number(e.target.value) || 0,
                  }))
                }
                className="w-full py-3 px-4 rounded-xl bg-[#F5F5F7] focus:bg-white border-2 border-transparent focus:border-[#6F2C91] outline-none text-sm text-[#1D1D1F]"
              />
            </div>

            <div className="md:col-span-2 flex flex-wrap items-center justify-between gap-3 pt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newBanner.activo}
                  onChange={(e) =>
                    setNewBanner((prev) => ({
                      ...prev,
                      activo: e.target.checked,
                    }))
                  }
                  className="w-5 h-5 accent-[#6F2C91]"
                />
                <span className="font-bold text-sm text-[#1D1D1F]">
                  Visible en la web
                </span>
              </label>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowAdd(false);
                    setNewBanner({ img: "", link: "", orden: 0, activo: true });
                  }}
                  className="px-5 py-3 rounded-xl bg-gray-100 text-gray-600 font-black text-xs uppercase tracking-widest hover:bg-gray-200 transition-all"
                >
                  Cancelar
                </button>
                <button
                  disabled={savingNew || uploadingNew}
                  onClick={agregarBanner}
                  className="px-8 py-3 rounded-xl bg-[#6F2C91] text-white font-black text-xs uppercase tracking-widest hover:bg-[#1D1D1F] hover:text-[#EAE84B] disabled:opacity-40 transition-all shadow-lg active:scale-95"
                >
                  {savingNew ? "Guardando..." : "Guardar banner"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* LISTADO */}
      <div className="space-y-4">
        {banners.length === 0 && !loading && (
          <div className="bg-white rounded-[2rem] p-12 text-center border border-gray-100">
            <p className="text-gray-400 font-bold uppercase tracking-widest text-sm">
              No hay banners guardados en Supabase.
            </p>
            <p className="text-xs text-gray-400 mt-2">
              La web sigue funcionando con los banners de fallback. Agrega uno
              arriba para empezar a controlar el carrusel desde aquí.
            </p>
          </div>
        )}

        {banners.map((b) => {
          const ed = edits[b.id] || {
            img: b.img || "",
            link: b.link || "",
            orden: b.orden,
            activo: b.activo,
          };
          return (
            <div
              key={b.id}
              className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100"
            >
              <div className="grid grid-cols-1 lg:grid-cols-[200px,1fr] gap-6">
                <div className="rounded-xl overflow-hidden bg-gray-100 aspect-[16/10] flex items-center justify-center">
                  {ed.img ? (
                    <img
                      src={ed.img}
                      alt="banner"
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <span className="text-xs text-gray-400 font-bold uppercase">
                      Sin imagen
                    </span>
                  )}
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-1">
                      URL de la imagen
                    </label>
                    <div className="flex gap-2 flex-wrap items-center">
                      <input
                        type="url"
                        value={ed.img}
                        onChange={(e) =>
                          updateEdit(b.id, { img: e.target.value })
                        }
                        className="flex-1 min-w-[260px] py-3 px-4 rounded-xl bg-[#F5F5F7] focus:bg-white border-2 border-transparent focus:border-[#6F2C91] outline-none text-sm text-[#1D1D1F]"
                      />
                      <label className="px-4 py-3 bg-[#6F2C91] text-white rounded-xl font-bold text-xs uppercase tracking-widest cursor-pointer hover:bg-[#5a2376] transition-all whitespace-nowrap">
                        {uploadingId === b.id ? "Subiendo..." : "Subir nueva"}
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          disabled={uploadingId === b.id}
                          onChange={(e) => {
                            const f = e.target.files?.[0];
                            if (f) {
                              setUploadingId(b.id);
                              subirImagen(
                                f,
                                (url) => updateEdit(b.id, { img: url }),
                                (busy) =>
                                  setUploadingId(busy ? b.id : null)
                              );
                            }
                            e.target.value = "";
                          }}
                        />
                      </label>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-1">
                        Link
                      </label>
                      <input
                        type="text"
                        value={ed.link}
                        onChange={(e) =>
                          updateEdit(b.id, { link: e.target.value })
                        }
                        placeholder="#buzon, /concurso, https://..."
                        className="w-full py-3 px-4 rounded-xl bg-[#F5F5F7] focus:bg-white border-2 border-transparent focus:border-[#6F2C91] outline-none text-sm text-[#1D1D1F]"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-1">
                        Orden
                      </label>
                      <input
                        type="number"
                        value={ed.orden}
                        onChange={(e) =>
                          updateEdit(b.id, {
                            orden: Number(e.target.value) || 0,
                          })
                        }
                        className="w-full py-3 px-4 rounded-xl bg-[#F5F5F7] focus:bg-white border-2 border-transparent focus:border-[#6F2C91] outline-none text-sm text-[#1D1D1F]"
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={ed.activo}
                        onChange={(e) =>
                          updateEdit(b.id, { activo: e.target.checked })
                        }
                        className="w-5 h-5 accent-[#6F2C91]"
                      />
                      <span className="font-bold text-sm text-[#1D1D1F]">
                        Visible en la web
                      </span>
                    </label>

                    <div className="flex gap-3">
                      <button
                        onClick={() => eliminarBanner(b.id)}
                        className="px-5 py-3 rounded-xl bg-red-50 text-red-600 font-black text-xs uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all"
                      >
                        Eliminar
                      </button>
                      <button
                        disabled={savingId === b.id || uploadingId === b.id}
                        onClick={() => guardarBanner(b.id)}
                        className="px-8 py-3 rounded-xl bg-[#1D1D1F] text-[#EAE84B] font-black text-xs uppercase tracking-widest hover:bg-[#6F2C91] hover:text-white disabled:opacity-40 transition-all shadow-lg active:scale-95"
                      >
                        {savingId === b.id ? "Guardando..." : "Guardar"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
