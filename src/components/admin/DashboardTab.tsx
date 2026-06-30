"use client";

import { useEffect, useMemo, useState } from "react";
import { getSupabase } from "@/lib/supabaseClient";

type Mensaje = {
  id: string;
  created_at: string;
  nombre: string;
  canton: string;
  asunto: string;
  estado?: string;
};

type Inscripcion = {
  id: string;
  created_at: string;
  nombres_estudiante: string;
  colegio: string;
};

type PageView = {
  id: number;
  path: string;
  created_at: string;
};

type Props = {
  mensajes: Mensaje[];
  inscripciones: Inscripcion[];
};

type ChartMode = "visitas" | "mensajes" | "inscripciones";

const MES_LABELS = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];

const startOfDay = (d: Date) => {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
};

const fmtDay = (iso: string) => {
  const d = new Date(iso);
  return `${String(d.getDate()).padStart(2,"0")} ${MES_LABELS[d.getMonth()]}`;
};

const fmtRelative = (iso: string) => {
  const ms = Date.now() - new Date(iso).getTime();
  const min = Math.floor(ms / 60000);
  if (min < 1) return "ahora";
  if (min < 60) return `hace ${min} min`;
  const hrs = Math.floor(min / 60);
  if (hrs < 24) return `hace ${hrs} h`;
  const dias = Math.floor(hrs / 24);
  if (dias < 30) return `hace ${dias} d`;
  return new Date(iso).toLocaleDateString("es-EC", { day: "2-digit", month: "short" });
};

const initials = (name: string) => {
  return (name || "??")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() || "")
    .join("") || "??";
};

export default function DashboardTab({ mensajes, inscripciones }: Props) {
  const [visits, setVisits] = useState<PageView[]>([]);
  const [chartMode, setChartMode] = useState<ChartMode>("visitas");
  const [loadingVisits, setLoadingVisits] = useState(true);

  // Cargar visitas (en paralelo con lo que ya tiene el admin)
  useEffect(() => {
    (async () => {
      try {
        const supabase = getSupabase();
        const { data } = await supabase
          .from("page_views")
          .select("id, path, created_at")
          .order("created_at", { ascending: false })
          .limit(5000);
        setVisits(data || []);
      } catch {
        // silencio: si no existe la tabla, dashboard sigue funcionando
      } finally {
        setLoadingVisits(false);
      }
    })();
  }, []);

  // KPIs ===============================================================
  const kpis = useMemo(() => {
    const now = new Date();
    const today0 = startOfDay(now);
    const week0 = new Date(today0); week0.setDate(week0.getDate() - 7);
    const lastWeek0 = new Date(week0); lastWeek0.setDate(lastWeek0.getDate() - 7);

    const inRange = (iso: string, since: Date, until?: Date) => {
      const d = new Date(iso);
      return d >= since && (!until || d < until);
    };

    const visitasHoy = visits.filter((v) => inRange(v.created_at, today0)).length;
    const visitasSemana = visits.filter((v) => inRange(v.created_at, week0)).length;
    const visitasSemanaAnt = visits.filter((v) => inRange(v.created_at, lastWeek0, week0)).length;
    const trendVisitas = visitasSemanaAnt > 0
      ? Math.round(((visitasSemana - visitasSemanaAnt) / visitasSemanaAnt) * 100)
      : visitasSemana > 0 ? 100 : 0;

    const mensajesSemana = mensajes.filter((m) => inRange(m.created_at, week0)).length;
    const mensajesSemanaAnt = mensajes.filter((m) => inRange(m.created_at, lastWeek0, week0)).length;
    const trendMensajes = mensajesSemanaAnt > 0
      ? Math.round(((mensajesSemana - mensajesSemanaAnt) / mensajesSemanaAnt) * 100)
      : mensajesSemana > 0 ? 100 : 0;

    const inscritosSemana = inscripciones.filter((i) => inRange(i.created_at, week0)).length;
    const inscritosSemanaAnt = inscripciones.filter((i) => inRange(i.created_at, lastWeek0, week0)).length;
    const trendInscritos = inscritosSemanaAnt > 0
      ? Math.round(((inscritosSemana - inscritosSemanaAnt) / inscritosSemanaAnt) * 100)
      : inscritosSemana > 0 ? 100 : 0;

    // Distribución estados del buzón
    const estados = { nuevo: 0, en_proceso: 0, resuelto: 0 };
    mensajes.forEach((m) => {
      const e = (m.estado || "nuevo") as keyof typeof estados;
      if (e in estados) estados[e]++; else estados.nuevo++;
    });

    return {
      totalMensajes: mensajes.length,
      totalInscritos: inscripciones.length,
      totalVisitas: visits.length,
      visitasHoy,
      visitasSemana,
      mensajesSemana,
      inscritosSemana,
      trendVisitas,
      trendMensajes,
      trendInscritos,
      estados,
    };
  }, [mensajes, inscripciones, visits]);

  // CHART data ========================================================
  const chartData = useMemo(() => {
    const today0 = startOfDay(new Date());
    const days: { key: string; label: string; value: number }[] = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date(today0);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split("T")[0];
      days.push({
        key,
        label: `${String(d.getDate()).padStart(2,"0")}\n${MES_LABELS[d.getMonth()]}`,
        value: 0,
      });
    }
    const map = new Map(days.map((d) => [d.key, d]));
    const source =
      chartMode === "visitas" ? visits :
      chartMode === "mensajes" ? mensajes :
      inscripciones;
    source.forEach((item) => {
      const key = item.created_at.split("T")[0];
      const target = map.get(key);
      if (target) target.value++;
    });
    return days;
  }, [chartMode, visits, mensajes, inscripciones]);

  const maxBar = chartData.reduce((m, d) => Math.max(m, d.value), 1);
  const peakDay = chartData.reduce((p, d) => d.value > p.value ? d : p, chartData[0]);

  const chartTitle = chartMode === "visitas"
    ? "Visitas totales"
    : chartMode === "mensajes"
    ? "Mensajes recibidos"
    : "Inscripciones del concurso";

  // Recent activity ===================================================
  const ultimosMensajes = mensajes.slice(0, 4);
  const ultimasInscripciones = inscripciones.slice(0, 4);

  const total = mensajes.length || 1;
  const pctNuevo = Math.round((kpis.estados.nuevo / total) * 100);
  const pctProceso = Math.round((kpis.estados.en_proceso / total) * 100);
  const pctResuelto = Math.round((kpis.estados.resuelto / total) * 100);

  return (
    <div className="space-y-6 md:space-y-8">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-5xl font-black text-[#1D1D1F] tracking-tight">
            Panel de Control
          </h1>
          <p className="text-gray-500 text-sm md:text-base mt-1.5 font-medium">
            Vista general · {new Date().toLocaleDateString("es-EC", {
              weekday: "long", day: "numeric", month: "long", year: "numeric"
            })}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 md:gap-6">
        {/* COLUMNA IZQ — chart grande */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-100 shadow-sm p-5 md:p-7">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-[#6F2C91]/10 flex items-center justify-center">
                <svg className="w-5 h-5 text-[#6F2C91]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg md:text-xl font-black text-[#1D1D1F] leading-none">
                  {chartTitle}
                </h2>
                <p className="text-xs text-gray-500 mt-1">Últimos 14 días</p>
              </div>
            </div>

            {/* Tabs del chart */}
            <div className="flex bg-gray-100 rounded-2xl p-1 gap-1">
              {(["visitas","mensajes","inscripciones"] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setChartMode(mode)}
                  className={`px-3 py-2 text-xs font-bold uppercase tracking-wider rounded-xl transition-all ${
                    chartMode === mode
                      ? "bg-white text-[#1D1D1F] shadow-sm"
                      : "text-gray-500 hover:text-[#1D1D1F]"
                  }`}
                >
                  {mode === "visitas" ? "Visitas" : mode === "mensajes" ? "Mensajes" : "Inscritos"}
                </button>
              ))}
            </div>
          </div>

          {/* Chart bars */}
          <div className="relative h-56 md:h-64 flex items-end gap-1.5 md:gap-2.5">
            {chartData.map((d) => {
              const pct = maxBar ? (d.value / maxBar) * 100 : 0;
              const isPeak = d.key === peakDay?.key && d.value > 0;
              return (
                <div key={d.key} className="flex-1 flex flex-col items-center justify-end h-full min-w-0 group">
                  <div className="text-[10px] font-bold text-gray-500 mb-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {d.value}
                  </div>
                  <div className="w-full relative" style={{ height: `${Math.max(pct, 2)}%` }}>
                    {isPeak && (
                      <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-[#6F2C91] text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow-lg whitespace-nowrap z-10">
                        {d.value}
                        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#6F2C91] rotate-45" />
                      </div>
                    )}
                    <div
                      className={`absolute inset-0 rounded-t-xl transition-all ${
                        isPeak
                          ? "bg-linear-to-b from-[#8a3eb0] to-[#6F2C91] shadow-lg"
                          : "bg-[#6F2C91]/10 group-hover:bg-[#6F2C91]/25"
                      }`}
                    />
                  </div>
                  <div className="text-[9px] md:text-[10px] text-gray-400 mt-2 whitespace-pre text-center font-medium leading-tight">
                    {d.label}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* COLUMNA DER — 3 KPI cards apiladas */}
        <div className="space-y-4 md:space-y-5">
          <KpiCard
            icon="💌"
            label="Mensajes totales"
            value={kpis.totalMensajes}
            trend={kpis.trendMensajes}
            sub={`${kpis.mensajesSemana} esta semana`}
          />
          <KpiCard
            icon="🎓"
            label="Inscritos al concurso"
            value={kpis.totalInscritos}
            trend={kpis.trendInscritos}
            sub={`${kpis.inscritosSemana} esta semana`}
          />
          <KpiCard
            icon="📊"
            label="Visitas hoy"
            value={loadingVisits ? 0 : kpis.visitasHoy}
            trend={kpis.trendVisitas}
            sub={`${kpis.totalVisitas.toLocaleString()} acumulado`}
          />
        </div>
      </div>

      {/* SEGUNDA FILA: Estados del Buzón + Recent payments-style lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 md:gap-6">
        {/* ESTADOS DEL BUZÓN — circular distribution */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5 md:p-7">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-11 h-11 rounded-2xl bg-amber-50 flex items-center justify-center">
              <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg md:text-xl font-black text-[#1D1D1F] leading-none">
                Estado de los casos
              </h2>
              <p className="text-xs text-gray-500 mt-1">Distribución del buzón ciudadano</p>
            </div>
          </div>

          {/* Barra horizontal apilada */}
          <div className="h-10 rounded-2xl overflow-hidden flex bg-gray-100 mb-5">
            {pctResuelto > 0 && (
              <div className="bg-emerald-500 flex items-center justify-center text-white text-xs font-bold" style={{ width: `${pctResuelto}%` }}>
                {pctResuelto > 8 && `${pctResuelto}%`}
              </div>
            )}
            {pctProceso > 0 && (
              <div className="bg-amber-500 flex items-center justify-center text-white text-xs font-bold" style={{ width: `${pctProceso}%` }}>
                {pctProceso > 8 && `${pctProceso}%`}
              </div>
            )}
            {pctNuevo > 0 && (
              <div className="bg-gray-400 flex items-center justify-center text-white text-xs font-bold" style={{ width: `${pctNuevo}%` }}>
                {pctNuevo > 8 && `${pctNuevo}%`}
              </div>
            )}
          </div>

          <div className="space-y-3">
            <StateRow color="bg-emerald-500" label="Resueltos" count={kpis.estados.resuelto} pct={pctResuelto} />
            <StateRow color="bg-amber-500" label="En proceso" count={kpis.estados.en_proceso} pct={pctProceso} />
            <StateRow color="bg-gray-400" label="Nuevos / sin abrir" count={kpis.estados.nuevo} pct={pctNuevo} />
          </div>
        </div>

        {/* ÚLTIMOS MENSAJES */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5 md:p-7">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-11 h-11 rounded-2xl bg-[#6F2C91]/10 flex items-center justify-center">
              <svg className="w-5 h-5 text-[#6F2C91]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg md:text-xl font-black text-[#1D1D1F] leading-none">
                Mensajes recientes
              </h2>
              <p className="text-xs text-gray-500 mt-1">Últimos del buzón ciudadano</p>
            </div>
          </div>

          {ultimosMensajes.length === 0 ? (
            <p className="text-center text-gray-400 text-sm py-10">Sin mensajes todavía.</p>
          ) : (
            <ul className="space-y-2">
              {ultimosMensajes.map((m) => (
                <li
                  key={m.id}
                  className="flex items-center gap-3 px-3 py-3 rounded-2xl hover:bg-gray-50 transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-[#6F2C91] text-white flex items-center justify-center font-black text-xs shrink-0">
                    {initials(m.nombre)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm text-[#1D1D1F] truncate">{m.nombre || "Sin nombre"}</p>
                    <p className="text-xs text-gray-500 truncate">
                      {m.canton} · {m.asunto || "Sin asunto"}
                    </p>
                  </div>
                  <p className="text-xs text-gray-400 whitespace-nowrap font-medium">{fmtRelative(m.created_at)}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* TERCERA FILA: Últimas inscripciones */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5 md:p-7">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-11 h-11 rounded-2xl bg-[#EAE84B]/30 flex items-center justify-center">
            <svg className="w-5 h-5 text-[#6F2C91]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path d="M12 14l9-5-9-5-9 5 9 5z" />
              <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
            </svg>
          </div>
          <div>
            <h2 className="text-lg md:text-xl font-black text-[#1D1D1F] leading-none">
              Últimas inscripciones
            </h2>
            <p className="text-xs text-gray-500 mt-1">Concurso de becas IA</p>
          </div>
        </div>

        {ultimasInscripciones.length === 0 ? (
          <p className="text-center text-gray-400 text-sm py-10">Sin inscripciones todavía.</p>
        ) : (
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {ultimasInscripciones.map((i) => (
              <li
                key={i.id}
                className="flex items-center gap-3 px-3 py-3 rounded-2xl hover:bg-gray-50 transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-[#EAE84B] text-[#6F2C91] flex items-center justify-center font-black text-xs shrink-0">
                  {initials(i.nombres_estudiante)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm text-[#1D1D1F] truncate">{i.nombres_estudiante}</p>
                  <p className="text-xs text-gray-500 truncate">{i.colegio || "Sin colegio"}</p>
                </div>
                <p className="text-xs text-gray-400 whitespace-nowrap font-medium">{fmtRelative(i.created_at)}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function KpiCard({
  icon, label, value, trend, sub,
}: {
  icon: string;
  label: string;
  value: number;
  trend: number;
  sub: string;
}) {
  const trendUp = trend >= 0;
  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5 md:p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="w-11 h-11 rounded-2xl bg-gray-50 flex items-center justify-center text-2xl">
          {icon}
        </div>
        <div className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold ${
          trendUp ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
        }`}>
          <span aria-hidden>{trendUp ? "↗" : "↘"}</span>
          {Math.abs(trend)}%
        </div>
      </div>
      <p className="text-3xl md:text-4xl font-black text-[#1D1D1F] leading-none tracking-tight">
        {value.toLocaleString()}
      </p>
      <p className="text-xs text-gray-500 mt-2 font-bold uppercase tracking-wider">{label}</p>
      <p className="text-xs text-gray-400 mt-1.5">{sub}</p>
    </div>
  );
}

function StateRow({ color, label, count, pct }: { color: string; label: string; count: number; pct: number }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className={`w-2.5 h-2.5 rounded-full ${color}`} />
        <span className="text-sm font-bold text-[#1D1D1F]">{label}</span>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-xs text-gray-400 font-medium">{pct}%</span>
        <span className="font-black text-base text-[#1D1D1F] tabular-nums min-w-[2ch] text-right">{count}</span>
      </div>
    </div>
  );
}
