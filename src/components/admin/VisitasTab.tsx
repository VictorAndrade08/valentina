"use client";

import { useEffect, useMemo, useState } from "react";
import { getSupabase } from "@/lib/supabaseClient";

type Visit = {
  id: number;
  path: string;
  created_at: string;
};

const PATH_LABELS: Record<string, string> = {
  "/": "Inicio (Home)",
  "/biografia": "Biografía",
  "/becas": "Becas IA",
  "/concurso": "Concurso",
  "/basesconcurso": "Bases del concurso",
  "/operacion-valentia": "Operación Valentía",
  "/politicasdeprivacidad": "Políticas de privacidad",
};

const labelFor = (path: string) =>
  PATH_LABELS[path] || path;

const startOfDay = (d: Date) => {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
};

const formatDay = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleDateString("es-EC", {
    day: "2-digit",
    month: "short",
  });
};

export default function VisitasTab() {
  const [visits, setVisits] = useState<Visit[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const supabase = getSupabase();
      const { data, error } = await supabase
        .from("page_views")
        .select("id, path, created_at")
        .order("created_at", { ascending: false })
        .limit(10000);
      if (error) throw error;
      setVisits(data || []);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error cargando visitas";
      setError(msg);
      setVisits([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const stats = useMemo(() => {
    if (!visits) return null;
    const now = new Date();
    const today0 = startOfDay(now);
    const week0 = new Date(today0);
    week0.setDate(week0.getDate() - 7);
    const month0 = new Date(today0);
    month0.setDate(month0.getDate() - 30);

    const inRange = (iso: string, since: Date) => new Date(iso) >= since;

    const total = visits.length;
    const hoy = visits.filter((v) => inRange(v.created_at, today0)).length;
    const semana = visits.filter((v) => inRange(v.created_at, week0)).length;
    const mes = visits.filter((v) => inRange(v.created_at, month0)).length;

    const porPath = new Map<string, number>();
    visits.forEach((v) => {
      porPath.set(v.path, (porPath.get(v.path) || 0) + 1);
    });
    const topPaths = Array.from(porPath.entries()).sort((a, b) => b[1] - a[1]);

    // Últimos 14 días
    const porDia = new Map<string, number>();
    for (let i = 13; i >= 0; i--) {
      const d = new Date(today0);
      d.setDate(d.getDate() - i);
      porDia.set(d.toISOString().split("T")[0], 0);
    }
    visits.forEach((v) => {
      const key = v.created_at.split("T")[0];
      if (porDia.has(key)) porDia.set(key, (porDia.get(key) || 0) + 1);
    });
    const dias = Array.from(porDia.entries());
    const maxDia = dias.reduce((max, [, n]) => Math.max(max, n), 0);

    return { total, hoy, semana, mes, topPaths, dias, maxDia };
  }, [visits]);

  if (loading) {
    return (
      <div className="bg-white rounded-3xl p-12 text-center text-gray-500">
        Cargando visitas...
      </div>
    );
  }

  if (error && !visits?.length) {
    return (
      <div className="bg-amber-50 border-2 border-amber-300 rounded-3xl p-8">
        <h3 className="text-lg font-bold text-amber-900 mb-2">
          ⚠️ El contador todavía no está activo
        </h3>
        <p className="text-sm text-amber-800 mb-4">
          Para activar el conteo de visitas, ejecutá este SQL en Supabase
          (sólo una vez, después funciona solo):
        </p>
        <code className="block bg-white border border-amber-200 rounded-xl px-4 py-3 text-xs text-gray-700 overflow-x-auto">
          scripts/visitas_setup.sql
        </code>
        <p className="text-xs text-amber-700 mt-3">
          Una vez que pegues el SQL, el contador empieza a registrar cada visita
          automáticamente. Volvé a esta pestaña y vas a ver los datos.
        </p>
        <p className="text-xs text-red-700 mt-3 font-mono">
          Detalle técnico: {error}
        </p>
      </div>
    );
  }

  if (!stats || stats.total === 0) {
    return (
      <div className="bg-white rounded-3xl border border-gray-200 p-12 text-center">
        <p className="text-2xl mb-2">📊</p>
        <h3 className="text-lg font-bold text-gray-700 mb-2">
          Sin visitas registradas todavía
        </h3>
        <p className="text-sm text-gray-500">
          Apenas alguien entre al sitio, vas a empezar a ver los datos acá.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* KPIs principales */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Total acumulado" value={stats.total} sub="visitas registradas" tone="dark" />
        <KpiCard label="Hoy" value={stats.hoy} sub="desde las 00:00" tone="purple" />
        <KpiCard label="Últimos 7 días" value={stats.semana} sub="semana en curso" tone="yellow" />
        <KpiCard label="Últimos 30 días" value={stats.mes} sub="mes en curso" tone="light" />
      </div>

      {/* Gráfico simple por día (últimos 14) */}
      <section className="bg-white rounded-3xl border border-gray-200 p-6 md:p-8">
        <h3 className="text-xl font-black uppercase tracking-wide text-[#1D1D1F] mb-1">
          Visitas por día
        </h3>
        <p className="text-xs text-gray-500 mb-6">Últimos 14 días</p>
        <div className="flex items-end gap-2 h-44">
          {stats.dias.map(([day, n]) => {
            const pct = stats.maxDia ? (n / stats.maxDia) * 100 : 0;
            return (
              <div key={day} className="flex-1 flex flex-col items-center gap-2 min-w-0">
                <div className="text-[10px] font-bold text-gray-500">{n}</div>
                <div className="w-full bg-gray-100 rounded-t flex-1 relative">
                  <div
                    className="absolute bottom-0 left-0 right-0 bg-[#6F2C91] rounded-t transition-all"
                    style={{ height: `${Math.max(pct, 2)}%` }}
                    title={`${day}: ${n} visitas`}
                  />
                </div>
                <div className="text-[9px] text-gray-500 whitespace-nowrap">
                  {formatDay(day + "T00:00:00")}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Top páginas */}
      <section className="bg-white rounded-3xl border border-gray-200 p-6 md:p-8">
        <h3 className="text-xl font-black uppercase tracking-wide text-[#1D1D1F] mb-1">
          Páginas más visitadas
        </h3>
        <p className="text-xs text-gray-500 mb-6">Ranking acumulado</p>
        <ul className="space-y-3">
          {stats.topPaths.slice(0, 10).map(([path, n], i) => {
            const pct = stats.topPaths[0] ? (n / stats.topPaths[0][1]) * 100 : 0;
            return (
              <li key={path}>
                <div className="flex items-center justify-between text-sm mb-1.5">
                  <span className="font-bold text-gray-800">
                    <span className="text-gray-400 mr-2">#{i + 1}</span>
                    {labelFor(path)}
                  </span>
                  <span className="font-mono text-xs text-gray-500">
                    {n} {n === 1 ? "visita" : "visitas"}
                  </span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#EAE84B] border-r border-[#6F2C91] rounded-full transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <p className="text-[10px] text-gray-400 mt-1">{path}</p>
              </li>
            );
          })}
        </ul>
      </section>

      <div className="text-center">
        <button
          onClick={fetchData}
          className="text-xs font-bold uppercase tracking-widest text-[#6F2C91] hover:text-[#1D1D1F] px-4 py-2"
        >
          ↻ Actualizar datos
        </button>
      </div>
    </div>
  );
}

function KpiCard({
  label,
  value,
  sub,
  tone,
}: {
  label: string;
  value: number;
  sub: string;
  tone: "dark" | "purple" | "yellow" | "light";
}) {
  const cls =
    tone === "dark"
      ? "bg-[#1D1D1F] text-white"
      : tone === "purple"
      ? "bg-[#6F2C91] text-white"
      : tone === "yellow"
      ? "bg-[#EAE84B] text-[#6F2C91]"
      : "bg-[#F5F5F7] text-[#1D1D1F]";
  const subCls = tone === "yellow" || tone === "light" ? "text-current opacity-70" : "text-white/70";
  return (
    <div className={`${cls} rounded-3xl p-6 shadow-sm`}>
      <p className="text-[10px] font-bold uppercase tracking-widest opacity-80 mb-2">
        {label}
      </p>
      <p className="text-4xl font-black tabular-nums leading-none mb-1">{value}</p>
      <p className={`text-[10px] ${subCls}`}>{sub}</p>
    </div>
  );
}
