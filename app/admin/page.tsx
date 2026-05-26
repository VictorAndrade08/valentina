"use client";

import { Fragment, useState, useEffect, useMemo } from "react";
import { getSupabase } from "@/lib/supabaseClient";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import CmsHeroEditor from "@/components/admin/CmsHeroEditor";

const PASSWORD_ACCESO = "admin123";

type Proyecto = {
  id: string;
  created_at: string;
  nombres: string;
  cedula: string;
  edad: string;
  cantonParroquia: string;
  direccion: string;
  telefono: string;
  correo: string;
  redesSociales: string;
  ocupacion: string;
  institucion: string;
  areaInteres: string;
  tituloProyecto: string;
  linkProyecto: string;
};

type Mensaje = {
  id: string;
  created_at: string;
  nombre: string;
  canton: string;
  correo: string;
  whatsapp: string;
  asunto: string;
  mensaje: string;
  archivo_url: string | null;
  archivo_nombre: string | null;
};

type TabKey = "concurso" | "buzon" | "contenido";

const MES_LABELS = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

const monthKey = (iso: string) => {
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
};

const monthLabel = (key: string) => {
  const [y, m] = key.split("-");
  return `${MES_LABELS[parseInt(m, 10) - 1]} ${y}`;
};

const csvCell = (val: unknown) => {
  if (val === null || val === undefined) return '""';
  return `"${String(val).replace(/"/g, '""')}"`;
};

type MensajeStats = {
  totalGeneral: number;
  totalEsteMes: number;
  mesPico: [string, number] | null;
  mesesOrdenados: [string, number][];
  cantonesOrdenados: [string, number][];
  asuntosOrdenados: [string, number][];
  maxMes: number;
};

type ProyectoStats = {
  totalGeneral: number;
  totalEsteMes: number;
  mesPico: [string, number] | null;
  mesesOrdenados: [string, number][];
  cantonesOrdenados: [string, number][];
  areasOrdenadas: [string, number][];
  ocupacionesOrdenadas: [string, number][];
  institucionesOrdenadas: [string, number][];
};

function computeMensajeStats(msgs: Mensaje[]): MensajeStats {
  const totalGeneral = msgs.length;
  const nowKey = monthKey(new Date().toISOString());
  const totalEsteMes = msgs.filter((m) => monthKey(m.created_at) === nowKey).length;
  const porMes = new Map<string, number>();
  const porCanton = new Map<string, number>();
  const porAsunto = new Map<string, number>();
  msgs.forEach((m) => {
    const mk = monthKey(m.created_at);
    porMes.set(mk, (porMes.get(mk) || 0) + 1);
    const canton = (m.canton || "Sin especificar").trim();
    porCanton.set(canton, (porCanton.get(canton) || 0) + 1);
    const asunto = (m.asunto || "Sin asunto").trim();
    porAsunto.set(asunto, (porAsunto.get(asunto) || 0) + 1);
  });
  const mesesOrdenados = Array.from(porMes.entries()).sort((a, b) =>
    a[0] < b[0] ? 1 : -1
  );
  const cantonesOrdenados = Array.from(porCanton.entries()).sort(
    (a, b) => b[1] - a[1]
  );
  const asuntosOrdenados = Array.from(porAsunto.entries()).sort(
    (a, b) => b[1] - a[1]
  );
  const mesPico =
    mesesOrdenados.length > 0
      ? mesesOrdenados.reduce((a, b) => (b[1] > a[1] ? b : a))
      : null;
  const maxMes = mesesOrdenados.reduce((acc, [, n]) => Math.max(acc, n), 0);
  return {
    totalGeneral,
    totalEsteMes,
    mesPico,
    mesesOrdenados,
    cantonesOrdenados,
    asuntosOrdenados,
    maxMes,
  };
}

function computeProyectoStats(prys: Proyecto[]): ProyectoStats {
  const totalGeneral = prys.length;
  const nowKey = monthKey(new Date().toISOString());
  const totalEsteMes = prys.filter((p) => monthKey(p.created_at) === nowKey).length;
  const porMes = new Map<string, number>();
  const porCanton = new Map<string, number>();
  const porArea = new Map<string, number>();
  const porOcupacion = new Map<string, number>();
  const porInstitucion = new Map<string, number>();
  prys.forEach((p) => {
    const mk = monthKey(p.created_at);
    porMes.set(mk, (porMes.get(mk) || 0) + 1);
    porCanton.set(
      (p.cantonParroquia || "Sin especificar").trim(),
      (porCanton.get((p.cantonParroquia || "Sin especificar").trim()) || 0) + 1
    );
    porArea.set(
      (p.areaInteres || "Sin especificar").trim(),
      (porArea.get((p.areaInteres || "Sin especificar").trim()) || 0) + 1
    );
    porOcupacion.set(
      (p.ocupacion || "Sin especificar").trim(),
      (porOcupacion.get((p.ocupacion || "Sin especificar").trim()) || 0) + 1
    );
    porInstitucion.set(
      (p.institucion || "Sin especificar").trim(),
      (porInstitucion.get((p.institucion || "Sin especificar").trim()) || 0) + 1
    );
  });
  const mesesOrdenados = Array.from(porMes.entries()).sort((a, b) =>
    a[0] < b[0] ? 1 : -1
  );
  const sortByCount = (m: Map<string, number>) =>
    Array.from(m.entries()).sort((a, b) => b[1] - a[1]);
  const mesPico =
    mesesOrdenados.length > 0
      ? mesesOrdenados.reduce((a, b) => (b[1] > a[1] ? b : a))
      : null;
  return {
    totalGeneral,
    totalEsteMes,
    mesPico,
    mesesOrdenados,
    cantonesOrdenados: sortByCount(porCanton),
    areasOrdenadas: sortByCount(porArea),
    ocupacionesOrdenadas: sortByCount(porOcupacion),
    institucionesOrdenadas: sortByCount(porInstitucion),
  };
}

const downloadCsv = (filename: string, headers: string[], rows: string[][]) => {
  const csv =
    headers.join(",") +
    "\n" +
    rows.map((r) => r.map(csvCell).join(",")).join("\n");
  const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.body.appendChild(document.createElement("a"));
  link.href = url;
  link.download = filename;
  link.click();
  document.body.removeChild(link);
};

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [errorLogin, setErrorLogin] = useState(false);

  const [tab, setTab] = useState<TabKey>("concurso");

  const [proyectos, setProyectos] = useState<Proyecto[]>([]);
  const [loadingProyectos, setLoadingProyectos] = useState(false);
  const [searchTermProyectos, setSearchTermProyectos] = useState("");

  const [mensajes, setMensajes] = useState<Mensaje[]>([]);
  const [loadingMensajes, setLoadingMensajes] = useState(false);
  const [searchTermMensajes, setSearchTermMensajes] = useState("");
  const [mesFiltro, setMesFiltro] = useState<string>("todos");
  const [mensajeAbierto, setMensajeAbierto] = useState<string | null>(null);

  const [showReportModal, setShowReportModal] = useState(false);
  const [reportTipo, setReportTipo] = useState<"historico" | "mes" | "rango">(
    "historico"
  );
  const [reportMes, setReportMes] = useState<string>("");
  const [reportDesde, setReportDesde] = useState<string>("");
  const [reportHasta, setReportHasta] = useState<string>("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === PASSWORD_ACCESO) {
      setIsAuthenticated(true);
      setErrorLogin(false);
      setPasswordInput("");
    } else {
      setErrorLogin(true);
      setPasswordInput("");
    }
  };

  const fetchProyectos = async () => {
    setLoadingProyectos(true);
    try {
      const supabase = getSupabase();
      const { data, error } = await supabase
        .from("proyectos")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      setProyectos((data as Proyecto[]) || []);
    } catch (err) {
      console.error("Error cargando proyectos:", err);
    }
    setLoadingProyectos(false);
  };

  const fetchMensajes = async () => {
    setLoadingMensajes(true);
    try {
      const supabase = getSupabase();
      const { data, error } = await supabase
        .from("mensajes_buzon")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      setMensajes((data as Mensaje[]) || []);
    } catch (err) {
      console.error("Error cargando mensajes:", err);
    }
    setLoadingMensajes(false);
  };

  useEffect(() => {
    if (!isAuthenticated) return;
    if (proyectos.length === 0) fetchProyectos();
    if (mensajes.length === 0) fetchMensajes();
  }, [isAuthenticated]); // eslint-disable-line react-hooks/exhaustive-deps

  const proyectosFiltrados = useMemo(() => {
    const term = searchTermProyectos.toLowerCase();
    if (!term) return proyectos;
    return proyectos.filter(
      (p) =>
        (p.nombres || "").toLowerCase().includes(term) ||
        (p.cedula || "").includes(term) ||
        (p.tituloProyecto || "").toLowerCase().includes(term) ||
        (p.cantonParroquia || "").toLowerCase().includes(term) ||
        (p.correo || "").toLowerCase().includes(term)
    );
  }, [proyectos, searchTermProyectos]);

  const mesesDisponibles = useMemo(() => {
    const set = new Set<string>();
    mensajes.forEach((m) => set.add(monthKey(m.created_at)));
    return Array.from(set).sort().reverse();
  }, [mensajes]);

  const mensajesFiltrados = useMemo(() => {
    const term = searchTermMensajes.toLowerCase();
    return mensajes.filter((m) => {
      if (mesFiltro !== "todos" && monthKey(m.created_at) !== mesFiltro)
        return false;
      if (!term) return true;
      return (
        (m.nombre || "").toLowerCase().includes(term) ||
        (m.canton || "").toLowerCase().includes(term) ||
        (m.asunto || "").toLowerCase().includes(term) ||
        (m.mensaje || "").toLowerCase().includes(term) ||
        (m.correo || "").toLowerCase().includes(term)
      );
    });
  }, [mensajes, searchTermMensajes, mesFiltro]);

  const stats = useMemo(() => computeMensajeStats(mensajes), [mensajes]);
  const proyectoStats = useMemo(
    () => computeProyectoStats(proyectos),
    [proyectos]
  );

  const exportProyectosExcel = () => {
    if (proyectosFiltrados.length === 0) return;
    const headers = [
      "Fecha", "Participante", "Cédula", "Edad", "Cantón", "Dirección",
      "Teléfono", "Correo", "Redes", "Ocupación", "Institución",
      "Área", "Proyecto", "Link",
    ];
    const rows = proyectosFiltrados.map((p) => [
      new Date(p.created_at).toLocaleDateString(),
      p.nombres, p.cedula, p.edad, p.cantonParroquia, p.direccion,
      p.telefono, p.correo, p.redesSociales, p.ocupacion, p.institucion,
      p.areaInteres, p.tituloProyecto, p.linkProyecto,
    ]);
    downloadCsv(
      `Reporte_Concurso_Valentina_${new Date().toISOString().split("T")[0]}.csv`,
      headers,
      rows
    );
  };

  const exportMensajesExcel = () => {
    if (mensajesFiltrados.length === 0) return;
    const headers = [
      "Fecha", "Nombre", "Cantón / Provincia", "Correo", "WhatsApp",
      "Asunto", "Mensaje", "Archivo",
    ];
    const rows = mensajesFiltrados.map((m) => [
      new Date(m.created_at).toLocaleString(),
      m.nombre, m.canton, m.correo, m.whatsapp,
      m.asunto, m.mensaje, m.archivo_url || "",
    ]);
    const suffix =
      mesFiltro !== "todos" ? `_${mesFiltro}` : `_${new Date().toISOString().split("T")[0]}`;
    downloadCsv(`Reporte_Buzon_Valentina${suffix}.csv`, headers, rows);
  };

  const exportBuzonPdf = () => {
    const doc = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 40;
    const PURPLE: [number, number, number] = [111, 44, 145];
    const YELLOW: [number, number, number] = [234, 232, 75];
    const DARK: [number, number, number] = [29, 29, 31];
    const GRAY: [number, number, number] = [134, 134, 139];

    // Header band
    doc.setFillColor(...PURPLE);
    doc.rect(0, 0, pageWidth, 90, "F");
    doc.setFillColor(...YELLOW);
    doc.rect(0, 86, pageWidth, 4, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.text("REPORTE BUZÓN CIUDADANO", margin, 42);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text("Valentina Centeno Arteaga", margin, 60);
    const fecha = new Date().toLocaleString("es-EC", {
      dateStyle: "long",
      timeStyle: "short",
    });
    doc.text(`Generado: ${fecha}`, margin, 74);

    let cursorY = 120;

    // Summary cards (3 KPIs)
    doc.setTextColor(...DARK);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("Resumen general", margin, cursorY);
    cursorY += 10;

    const kpiBoxWidth = (pageWidth - margin * 2 - 20) / 3;
    const kpiBoxHeight = 70;
    const kpiY = cursorY + 8;

    const drawKpi = (
      x: number,
      label: string,
      value: string,
      sub: string,
      bg: [number, number, number],
      fg: [number, number, number]
    ) => {
      doc.setFillColor(...bg);
      doc.roundedRect(x, kpiY, kpiBoxWidth, kpiBoxHeight, 8, 8, "F");
      doc.setTextColor(...fg);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.text(label.toUpperCase(), x + 12, kpiY + 18);
      doc.setFontSize(26);
      doc.text(value, x + 12, kpiY + 46);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.text(sub, x + 12, kpiY + 60);
    };

    drawKpi(
      margin,
      "Total acumulado",
      String(stats.totalGeneral),
      "mensajes recibidos",
      [245, 245, 247],
      DARK
    );
    drawKpi(
      margin + kpiBoxWidth + 10,
      "Este mes",
      String(stats.totalEsteMes),
      monthLabel(monthKey(new Date().toISOString())),
      PURPLE,
      [255, 255, 255]
    );
    drawKpi(
      margin + (kpiBoxWidth + 10) * 2,
      "Mes con más mensajes",
      stats.mesPico ? String(stats.mesPico[1]) : "0",
      stats.mesPico ? monthLabel(stats.mesPico[0]) : "sin datos",
      YELLOW,
      PURPLE
    );

    cursorY = kpiY + kpiBoxHeight + 30;

    // Mensajes por mes
    autoTable(doc, {
      startY: cursorY,
      head: [["Mes", "Mensajes recibidos"]],
      body: stats.mesesOrdenados.map(([k, n]) => [monthLabel(k), String(n)]),
      headStyles: {
        fillColor: DARK,
        textColor: YELLOW,
        fontStyle: "bold",
        fontSize: 9,
      },
      bodyStyles: { fontSize: 10, textColor: DARK },
      alternateRowStyles: { fillColor: [251, 251, 253] },
      margin: { left: margin, right: margin },
      didDrawPage: () => {
        doc.setFontSize(8);
        doc.setTextColor(...GRAY);
        doc.text(
          `Página ${doc.getNumberOfPages()}`,
          pageWidth - margin,
          doc.internal.pageSize.getHeight() - 20,
          { align: "right" }
        );
      },
    });

    // Top cantones
    const afterMes =
      (doc as unknown as { lastAutoTable?: { finalY: number } }).lastAutoTable
        ?.finalY ?? cursorY;
    doc.setTextColor(...DARK);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("Por ubicación (cantón / provincia)", margin, afterMes + 30);

    autoTable(doc, {
      startY: afterMes + 40,
      head: [["Ubicación", "Mensajes"]],
      body: stats.cantonesOrdenados.map(([k, n]) => [k, String(n)]),
      headStyles: {
        fillColor: PURPLE,
        textColor: [255, 255, 255],
        fontStyle: "bold",
        fontSize: 9,
      },
      bodyStyles: { fontSize: 10, textColor: DARK },
      alternateRowStyles: { fillColor: [251, 251, 253] },
      margin: { left: margin, right: margin },
    });

    // Top asuntos
    const afterCanton =
      (doc as unknown as { lastAutoTable?: { finalY: number } }).lastAutoTable
        ?.finalY ?? afterMes;
    doc.setTextColor(...DARK);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("Por tema (asunto)", margin, afterCanton + 30);

    autoTable(doc, {
      startY: afterCanton + 40,
      head: [["Tema", "Mensajes"]],
      body: stats.asuntosOrdenados.map(([k, n]) => [k, String(n)]),
      headStyles: {
        fillColor: PURPLE,
        textColor: [255, 255, 255],
        fontStyle: "bold",
        fontSize: 9,
      },
      bodyStyles: { fontSize: 10, textColor: DARK },
      alternateRowStyles: { fillColor: [251, 251, 253] },
      margin: { left: margin, right: margin },
    });

    // Listado detallado de mensajes (filtrados si hay filtro activo)
    const detailRows = mensajesFiltrados.map((m) => [
      new Date(m.created_at).toLocaleDateString("es-EC"),
      m.nombre,
      m.canton,
      m.asunto,
      (m.mensaje || "").length > 120
        ? (m.mensaje || "").slice(0, 117) + "..."
        : m.mensaje,
    ]);

    if (detailRows.length > 0) {
      doc.addPage();
      doc.setTextColor(...DARK);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      const tituloDetalle =
        mesFiltro !== "todos"
          ? `Detalle de mensajes — ${monthLabel(mesFiltro)}`
          : "Detalle de mensajes";
      doc.text(tituloDetalle, margin, 50);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(...GRAY);
      doc.text(`${detailRows.length} mensaje(s)`, margin, 66);

      autoTable(doc, {
        startY: 80,
        head: [["Fecha", "Nombre", "Cantón", "Asunto", "Mensaje"]],
        body: detailRows,
        headStyles: {
          fillColor: DARK,
          textColor: YELLOW,
          fontStyle: "bold",
          fontSize: 9,
        },
        bodyStyles: { fontSize: 8, textColor: DARK, valign: "top" },
        alternateRowStyles: { fillColor: [251, 251, 253] },
        columnStyles: {
          0: { cellWidth: 60 },
          1: { cellWidth: 90 },
          2: { cellWidth: 70 },
          3: { cellWidth: 90 },
          4: { cellWidth: "auto" },
        },
        margin: { left: margin, right: margin },
      });
    }

    const suffix =
      mesFiltro !== "todos"
        ? mesFiltro
        : new Date().toISOString().split("T")[0];
    doc.save(`Reporte_Buzon_Valentina_${suffix}.pdf`);
  };

  const getReportFilter = (): {
    desde: Date;
    hasta: Date;
    label: string;
    fileSuffix: string;
  } | null => {
    if (reportTipo === "mes" && reportMes) {
      const [y, m] = reportMes.split("-").map(Number);
      const desde = new Date(y, m - 1, 1, 0, 0, 0, 0);
      const hasta = new Date(y, m, 0, 23, 59, 59, 999);
      return {
        desde,
        hasta,
        label: monthLabel(reportMes),
        fileSuffix: reportMes,
      };
    }
    if (reportTipo === "rango" && reportDesde && reportHasta) {
      const desde = new Date(reportDesde + "T00:00:00");
      const hasta = new Date(reportHasta + "T23:59:59.999");
      const fmt = (s: string) =>
        new Date(s + "T00:00:00").toLocaleDateString("es-EC");
      return {
        desde,
        hasta,
        label: `${fmt(reportDesde)} — ${fmt(reportHasta)}`,
        fileSuffix: `${reportDesde}_a_${reportHasta}`,
      };
    }
    return null;
  };

  const previewCounts = useMemo(() => {
    const f = getReportFilter();
    if (!f) return { mensajes: mensajes.length, proyectos: proyectos.length };
    const inRange = (iso: string) => {
      const d = new Date(iso);
      return d >= f.desde && d <= f.hasta;
    };
    return {
      mensajes: mensajes.filter((m) => inRange(m.created_at)).length,
      proyectos: proyectos.filter((p) => inRange(p.created_at)).length,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reportTipo, reportMes, reportDesde, reportHasta, mensajes, proyectos]);

  const exportReporteCompletoPdf = () => {
    const filter = getReportFilter();
    const msgsUsed = filter
      ? mensajes.filter((m) => {
          const d = new Date(m.created_at);
          return d >= filter.desde && d <= filter.hasta;
        })
      : mensajes;
    const prysUsed = filter
      ? proyectos.filter((p) => {
          const d = new Date(p.created_at);
          return d >= filter.desde && d <= filter.hasta;
        })
      : proyectos;
    const statsLocal = filter ? computeMensajeStats(msgsUsed) : stats;
    const proyectoStatsLocal = filter
      ? computeProyectoStats(prysUsed)
      : proyectoStats;
    const periodoLabel = filter ? filter.label : "Histórico completo";
    const fileSuffix = filter
      ? filter.fileSuffix
      : new Date().toISOString().split("T")[0];

    const doc = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 40;
    const PURPLE: [number, number, number] = [111, 44, 145];
    const YELLOW: [number, number, number] = [234, 232, 75];
    const DARK: [number, number, number] = [29, 29, 31];
    const GRAY: [number, number, number] = [134, 134, 139];
    const WHITE: [number, number, number] = [255, 255, 255];
    const LIGHT: [number, number, number] = [245, 245, 247];

    const addFooter = () => {
      const total = doc.getNumberOfPages();
      for (let i = 1; i <= total; i++) {
        doc.setPage(i);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(...GRAY);
        const fechaCorta = new Date().toLocaleDateString("es-EC");
        doc.text(`Reporte Mensual · Valentina Centeno · ${fechaCorta}`, margin, pageHeight - 20);
        doc.text(`Página ${i} de ${total}`, pageWidth - margin, pageHeight - 20, {
          align: "right",
        });
      }
    };

    const drawSectionTitle = (
      title: string,
      subtitle: string,
      y: number
    ) => {
      doc.setFillColor(...PURPLE);
      doc.rect(margin, y, pageWidth - margin * 2, 32, "F");
      doc.setFillColor(...YELLOW);
      doc.rect(margin, y + 30, pageWidth - margin * 2, 2, "F");
      doc.setTextColor(...WHITE);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.text(title, margin + 12, y + 22);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.text(subtitle, pageWidth - margin - 12, y + 22, { align: "right" });
      return y + 50;
    };

    const drawKpi = (
      x: number,
      y: number,
      w: number,
      h: number,
      label: string,
      value: string,
      sub: string,
      bg: [number, number, number],
      fg: [number, number, number]
    ) => {
      doc.setFillColor(...bg);
      doc.roundedRect(x, y, w, h, 8, 8, "F");
      doc.setTextColor(...fg);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7);
      doc.text(label.toUpperCase(), x + 10, y + 16);
      doc.setFontSize(22);
      doc.text(value, x + 10, y + 42);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7);
      doc.text(sub, x + 10, y + 58);
    };

    const lastY = () =>
      (doc as unknown as { lastAutoTable?: { finalY: number } }).lastAutoTable
        ?.finalY ?? margin;

    // ============================================
    // PORTADA — Página 1
    // ============================================
    doc.setFillColor(...PURPLE);
    doc.rect(0, 0, pageWidth, 180, "F");
    doc.setFillColor(...YELLOW);
    doc.rect(0, 176, pageWidth, 4, "F");

    doc.setTextColor(...WHITE);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text("REPORTE MENSUAL COMPLETO", margin, 50);
    doc.setFontSize(28);
    doc.text("VALENTINA", margin, 90);
    doc.setTextColor(...YELLOW);
    doc.text("CENTENO ARTEAGA", margin, 120);
    doc.setTextColor(...WHITE);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text("Buzón Ciudadano + Concurso", margin, 145);

    const fechaLarga = new Date().toLocaleString("es-EC", {
      dateStyle: "long",
      timeStyle: "short",
    });
    doc.setFontSize(8);
    doc.text(`Periodo: ${periodoLabel}`, margin, 158);
    doc.text(`Generado: ${fechaLarga}`, margin, 170);

    // KPIs principales (6 tarjetas en grid 3x2)
    const kpiTop = 210;
    const kpiW = (pageWidth - margin * 2 - 20) / 3;
    const kpiH = 75;
    const gap = 10;

    doc.setTextColor(...DARK);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.text("Resumen ejecutivo", margin, kpiTop - 12);

    // Fila 1 (buzón)
    drawKpi(margin, kpiTop, kpiW, kpiH, "Mensajes (total)", String(statsLocal.totalGeneral), "Buzón en el periodo", LIGHT, DARK);
    drawKpi(margin + kpiW + gap, kpiTop, kpiW, kpiH, "Mensajes este mes", String(statsLocal.totalEsteMes), monthLabel(monthKey(new Date().toISOString())), PURPLE, WHITE);
    drawKpi(margin + (kpiW + gap) * 2, kpiTop, kpiW, kpiH, "Mes pico buzón", statsLocal.mesPico ? String(statsLocal.mesPico[1]) : "0", statsLocal.mesPico ? monthLabel(statsLocal.mesPico[0]) : "sin datos", YELLOW, PURPLE);

    // Fila 2 (concurso)
    const kpiTop2 = kpiTop + kpiH + gap;
    drawKpi(margin, kpiTop2, kpiW, kpiH, "Inscritos (total)", String(proyectoStatsLocal.totalGeneral), "Concurso en el periodo", LIGHT, DARK);
    drawKpi(margin + kpiW + gap, kpiTop2, kpiW, kpiH, "Inscritos este mes", String(proyectoStatsLocal.totalEsteMes), monthLabel(monthKey(new Date().toISOString())), PURPLE, WHITE);
    drawKpi(margin + (kpiW + gap) * 2, kpiTop2, kpiW, kpiH, "Mes pico concurso", proyectoStatsLocal.mesPico ? String(proyectoStatsLocal.mesPico[1]) : "0", proyectoStatsLocal.mesPico ? monthLabel(proyectoStatsLocal.mesPico[0]) : "sin datos", YELLOW, PURPLE);

    // Snapshots clave
    const snapY = kpiTop2 + kpiH + 25;
    doc.setTextColor(...DARK);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("Snapshots clave", margin, snapY);

    const topCantonMsg = statsLocal.cantonesOrdenados[0];
    const topAsunto = statsLocal.asuntosOrdenados[0];
    const topCantonProy = proyectoStatsLocal.cantonesOrdenados[0];
    const topArea = proyectoStatsLocal.areasOrdenadas[0];

    autoTable(doc, {
      startY: snapY + 10,
      head: [["Indicador", "Valor"]],
      body: [
        ["Periodo cubierto", periodoLabel],
        ["Total mensajes en el periodo", String(statsLocal.totalGeneral)],
        ["Mensajes este mes", String(statsLocal.totalEsteMes)],
        ["Ubicación con más mensajes", topCantonMsg ? `${topCantonMsg[0]} (${topCantonMsg[1]})` : "—"],
        ["Tema más recurrente", topAsunto ? `${topAsunto[0]} (${topAsunto[1]})` : "—"],
        ["Total inscritos en el periodo", String(proyectoStatsLocal.totalGeneral)],
        ["Inscritos este mes", String(proyectoStatsLocal.totalEsteMes)],
        ["Cantón con más inscritos", topCantonProy ? `${topCantonProy[0]} (${topCantonProy[1]})` : "—"],
        ["Área de interés más solicitada", topArea ? `${topArea[0]} (${topArea[1]})` : "—"],
      ],
      headStyles: { fillColor: DARK, textColor: YELLOW, fontStyle: "bold", fontSize: 9 },
      bodyStyles: { fontSize: 10, textColor: DARK },
      alternateRowStyles: { fillColor: LIGHT },
      margin: { left: margin, right: margin },
      columnStyles: { 0: { cellWidth: 280, fontStyle: "bold" }, 1: { cellWidth: "auto" } },
    });

    // ============================================
    // SECCIÓN 1 — BUZÓN CIUDADANO
    // ============================================
    doc.addPage();
    let y = drawSectionTitle("SECCIÓN 1 — BUZÓN CIUDADANO", `${statsLocal.totalGeneral} mensajes`, margin);

    doc.setTextColor(...DARK);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("1.1 Mensajes por mes (con variación vs mes anterior)", margin, y);
    y += 10;

    const buzonMesAsc = [...statsLocal.mesesOrdenados].reverse();
    const buzonMesRows = buzonMesAsc.map(([k, n], i) => {
      const prev = i > 0 ? buzonMesAsc[i - 1][1] : null;
      const variacion =
        prev === null ? "—" : prev === 0 ? "+∞" : `${(((n - prev) / prev) * 100).toFixed(0)}%`;
      return [monthLabel(k), String(n), variacion];
    }).reverse();

    autoTable(doc, {
      startY: y,
      head: [["Mes", "Mensajes", "Variación"]],
      body: buzonMesRows.length > 0 ? buzonMesRows : [["—", "0", "—"]],
      headStyles: { fillColor: DARK, textColor: YELLOW, fontStyle: "bold", fontSize: 9 },
      bodyStyles: { fontSize: 10, textColor: DARK },
      alternateRowStyles: { fillColor: LIGHT },
      margin: { left: margin, right: margin },
    });

    y = lastY() + 25;
    if (y > pageHeight - 150) { doc.addPage(); y = margin; }
    doc.setTextColor(...DARK);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("1.2 Top 15 ubicaciones (cantón / provincia)", margin, y);

    const totalMsg = Math.max(statsLocal.totalGeneral, 1);
    autoTable(doc, {
      startY: y + 10,
      head: [["#", "Ubicación", "Mensajes", "% del total"]],
      body: statsLocal.cantonesOrdenados.slice(0, 15).map(([k, n], i) => [
        String(i + 1), k, String(n), `${((n / totalMsg) * 100).toFixed(1)}%`,
      ]),
      headStyles: { fillColor: PURPLE, textColor: WHITE, fontStyle: "bold", fontSize: 9 },
      bodyStyles: { fontSize: 10, textColor: DARK },
      alternateRowStyles: { fillColor: LIGHT },
      margin: { left: margin, right: margin },
      columnStyles: { 0: { cellWidth: 30 }, 2: { cellWidth: 70 }, 3: { cellWidth: 80 } },
    });

    y = lastY() + 25;
    if (y > pageHeight - 150) { doc.addPage(); y = margin; }
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("1.3 Top 15 temas (asunto del mensaje)", margin, y);

    autoTable(doc, {
      startY: y + 10,
      head: [["#", "Tema", "Mensajes", "% del total"]],
      body: statsLocal.asuntosOrdenados.slice(0, 15).map(([k, n], i) => [
        String(i + 1), k, String(n), `${((n / totalMsg) * 100).toFixed(1)}%`,
      ]),
      headStyles: { fillColor: PURPLE, textColor: WHITE, fontStyle: "bold", fontSize: 9 },
      bodyStyles: { fontSize: 10, textColor: DARK },
      alternateRowStyles: { fillColor: LIGHT },
      margin: { left: margin, right: margin },
      columnStyles: { 0: { cellWidth: 30 }, 2: { cellWidth: 70 }, 3: { cellWidth: 80 } },
    });

    // 1.4 Listado COMPLETO de mensajes
    doc.addPage();
    y = drawSectionTitle("1.4 LISTADO COMPLETO DE MENSAJES", `${msgsUsed.length} mensajes`, margin);

    if (msgsUsed.length === 0) {
      doc.setFont("helvetica", "italic");
      doc.setFontSize(10);
      doc.setTextColor(...GRAY);
      doc.text("No hay mensajes en el periodo seleccionado.", margin, y);
    } else {
      autoTable(doc, {
        startY: y,
        head: [["Fecha", "Nombre", "Cantón", "Contacto", "Asunto", "Mensaje"]],
        body: msgsUsed.map((m) => [
          new Date(m.created_at).toLocaleDateString("es-EC"),
          m.nombre,
          m.canton,
          `${m.correo}\n${m.whatsapp}`,
          m.asunto,
          m.mensaje + (m.archivo_nombre ? `\n\n[Adjunto: ${m.archivo_nombre}]` : ""),
        ]),
        headStyles: { fillColor: DARK, textColor: YELLOW, fontStyle: "bold", fontSize: 9 },
        bodyStyles: { fontSize: 8, textColor: DARK, valign: "top", cellPadding: 4 },
        alternateRowStyles: { fillColor: LIGHT },
        margin: { left: margin, right: margin },
        columnStyles: {
          0: { cellWidth: 55 },
          1: { cellWidth: 75 },
          2: { cellWidth: 60 },
          3: { cellWidth: 90 },
          4: { cellWidth: 70 },
          5: { cellWidth: "auto" },
        },
      });
    }

    // ============================================
    // SECCIÓN 2 — CONCURSO
    // ============================================
    doc.addPage();
    y = drawSectionTitle("SECCIÓN 2 — CONCURSO (PROYECTOS)", `${proyectoStatsLocal.totalGeneral} inscritos`, margin);

    doc.setTextColor(...DARK);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("2.1 Inscripciones por mes (con variación)", margin, y);

    const proyMesAsc = [...proyectoStatsLocal.mesesOrdenados].reverse();
    const proyMesRows = proyMesAsc.map(([k, n], i) => {
      const prev = i > 0 ? proyMesAsc[i - 1][1] : null;
      const variacion =
        prev === null ? "—" : prev === 0 ? "+∞" : `${(((n - prev) / prev) * 100).toFixed(0)}%`;
      return [monthLabel(k), String(n), variacion];
    }).reverse();

    autoTable(doc, {
      startY: y + 10,
      head: [["Mes", "Inscritos", "Variación"]],
      body: proyMesRows.length > 0 ? proyMesRows : [["—", "0", "—"]],
      headStyles: { fillColor: DARK, textColor: YELLOW, fontStyle: "bold", fontSize: 9 },
      bodyStyles: { fontSize: 10, textColor: DARK },
      alternateRowStyles: { fillColor: LIGHT },
      margin: { left: margin, right: margin },
    });

    y = lastY() + 25;
    if (y > pageHeight - 150) { doc.addPage(); y = margin; }
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("2.2 Top 15 cantones / parroquias", margin, y);

    const totalProy = Math.max(proyectoStatsLocal.totalGeneral, 1);
    autoTable(doc, {
      startY: y + 10,
      head: [["#", "Cantón / Parroquia", "Inscritos", "% del total"]],
      body: proyectoStatsLocal.cantonesOrdenados.slice(0, 15).map(([k, n], i) => [
        String(i + 1), k, String(n), `${((n / totalProy) * 100).toFixed(1)}%`,
      ]),
      headStyles: { fillColor: PURPLE, textColor: WHITE, fontStyle: "bold", fontSize: 9 },
      bodyStyles: { fontSize: 10, textColor: DARK },
      alternateRowStyles: { fillColor: LIGHT },
      margin: { left: margin, right: margin },
      columnStyles: { 0: { cellWidth: 30 }, 2: { cellWidth: 70 }, 3: { cellWidth: 80 } },
    });

    y = lastY() + 25;
    if (y > pageHeight - 150) { doc.addPage(); y = margin; }
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("2.3 Áreas de interés", margin, y);

    autoTable(doc, {
      startY: y + 10,
      head: [["#", "Área", "Inscritos", "% del total"]],
      body: proyectoStatsLocal.areasOrdenadas.map(([k, n], i) => [
        String(i + 1), k, String(n), `${((n / totalProy) * 100).toFixed(1)}%`,
      ]),
      headStyles: { fillColor: PURPLE, textColor: WHITE, fontStyle: "bold", fontSize: 9 },
      bodyStyles: { fontSize: 10, textColor: DARK },
      alternateRowStyles: { fillColor: LIGHT },
      margin: { left: margin, right: margin },
      columnStyles: { 0: { cellWidth: 30 }, 2: { cellWidth: 70 }, 3: { cellWidth: 80 } },
    });

    y = lastY() + 25;
    if (y > pageHeight - 150) { doc.addPage(); y = margin; }
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("2.4 Top 10 ocupaciones", margin, y);

    autoTable(doc, {
      startY: y + 10,
      head: [["#", "Ocupación", "Inscritos", "% del total"]],
      body: proyectoStatsLocal.ocupacionesOrdenadas.slice(0, 10).map(([k, n], i) => [
        String(i + 1), k, String(n), `${((n / totalProy) * 100).toFixed(1)}%`,
      ]),
      headStyles: { fillColor: PURPLE, textColor: WHITE, fontStyle: "bold", fontSize: 9 },
      bodyStyles: { fontSize: 10, textColor: DARK },
      alternateRowStyles: { fillColor: LIGHT },
      margin: { left: margin, right: margin },
      columnStyles: { 0: { cellWidth: 30 }, 2: { cellWidth: 70 }, 3: { cellWidth: 80 } },
    });

    y = lastY() + 25;
    if (y > pageHeight - 150) { doc.addPage(); y = margin; }
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("2.5 Top 10 instituciones", margin, y);

    autoTable(doc, {
      startY: y + 10,
      head: [["#", "Institución", "Inscritos", "% del total"]],
      body: proyectoStatsLocal.institucionesOrdenadas.slice(0, 10).map(([k, n], i) => [
        String(i + 1), k, String(n), `${((n / totalProy) * 100).toFixed(1)}%`,
      ]),
      headStyles: { fillColor: PURPLE, textColor: WHITE, fontStyle: "bold", fontSize: 9 },
      bodyStyles: { fontSize: 10, textColor: DARK },
      alternateRowStyles: { fillColor: LIGHT },
      margin: { left: margin, right: margin },
      columnStyles: { 0: { cellWidth: 30 }, 2: { cellWidth: 70 }, 3: { cellWidth: 80 } },
    });

    // 2.6 Listado COMPLETO de inscritos
    doc.addPage();
    y = drawSectionTitle("2.6 LISTADO COMPLETO DE INSCRITOS", `${prysUsed.length} inscritos`, margin);

    if (prysUsed.length === 0) {
      doc.setFont("helvetica", "italic");
      doc.setFontSize(10);
      doc.setTextColor(...GRAY);
      doc.text("No hay inscritos en el periodo seleccionado.", margin, y);
    } else {
      autoTable(doc, {
        startY: y,
        head: [["Fecha", "Nombre", "Cédula", "Cantón", "Edad", "Área", "Ocupación", "Título proyecto"]],
        body: prysUsed.map((p) => [
          new Date(p.created_at).toLocaleDateString("es-EC"),
          p.nombres,
          p.cedula,
          p.cantonParroquia,
          p.edad,
          p.areaInteres,
          p.ocupacion,
          p.tituloProyecto,
        ]),
        headStyles: { fillColor: DARK, textColor: YELLOW, fontStyle: "bold", fontSize: 8 },
        bodyStyles: { fontSize: 7, textColor: DARK, valign: "top", cellPadding: 3 },
        alternateRowStyles: { fillColor: LIGHT },
        margin: { left: margin, right: margin },
        columnStyles: {
          0: { cellWidth: 50 },
          1: { cellWidth: 75 },
          2: { cellWidth: 55 },
          3: { cellWidth: 55 },
          4: { cellWidth: 50 },
          5: { cellWidth: 60 },
          6: { cellWidth: 55 },
          7: { cellWidth: "auto" },
        },
      });
    }

    addFooter();
    doc.save(`Reporte_Mensual_Completo_${fileSuffix}.pdf`);
  };

  const exportResumenMensualExcel = () => {
    if (stats.mesesOrdenados.length === 0) return;
    const headers = ["Mes", "Total mensajes"];
    const rows = stats.mesesOrdenados.map(([k, n]) => [
      monthLabel(k),
      String(n),
    ]);
    downloadCsv(
      `Resumen_Mensual_Buzon_${new Date().toISOString().split("T")[0]}.csv`,
      headers,
      rows
    );
  };

  const getExternalLink = (url: string) => {
    if (!url) return "#";
    const cleanUrl = url.trim();
    if (cleanUrl.startsWith("http://") || cleanUrl.startsWith("https://")) {
      return cleanUrl;
    }
    return `https://${cleanUrl}`;
  };

  if (!isAuthenticated) {
    return (
      <section className="min-h-screen bg-[#FBFBFD] flex flex-col justify-center items-center py-12 px-6 relative">
        <div className="text-center mb-8">
          <h2
            style={{ fontFamily: "'Oswald', sans-serif" }}
            className="text-4xl text-[#1D1D1F] font-black uppercase mb-4"
          >
            PANEL DE <span className="text-[#6F2C91]">ADMINISTRACIÓN</span>
          </h2>
          <div className="inline-block px-6 py-2 bg-[#EAE84B] text-[#6F2C91] font-bold rounded-xl shadow-sm -rotate-1">
            ACCESO RESTRINGIDO
          </div>
        </div>

        <div className="w-full max-w-[450px] bg-white p-10 rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] relative border-t-8 border-[#EAE84B]">
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 block text-center">
                Contraseña del Panel
              </label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                className="w-full p-4 text-center text-xl tracking-[0.5em] bg-[#F5F5F7] border-2 border-[#F5F5F7] rounded-2xl focus:border-[#6F2C91] focus:bg-white outline-none transition-all text-black"
              />
              {errorLogin && (
                <p className="text-red-500 text-xs font-bold text-center mt-2">
                  Clave incorrecta. Intenta de nuevo.
                </p>
              )}
            </div>
            <button
              type="submit"
              className="w-full py-4 rounded-2xl bg-[#1D1D1F] text-[#EAE84B] font-black uppercase tracking-widest hover:bg-[#6F2C91] hover:text-white transition-all shadow-lg active:scale-95"
            >
              ENTRAR AL PANEL
            </button>
          </form>
        </div>
        <style
          dangerouslySetInnerHTML={{
            __html: `@import url('https://fonts.googleapis.com/css2?family=Oswald:wght@700&display=swap');`,
          }}
        />
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-[#FBFBFD] py-12 px-4 md:px-10">
      <div className="max-w-[2800px] mx-auto">
        {/* TABS + REPORTE COMPLETO */}
        <div className="flex gap-3 mb-10 flex-wrap items-center justify-between">
          <div className="flex gap-3 flex-wrap">
            <button
              onClick={() => setTab("concurso")}
              className={`px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-sm ${
                tab === "concurso"
                  ? "bg-[#1D1D1F] text-[#EAE84B]"
                  : "bg-white text-gray-500 hover:text-[#6F2C91]"
              }`}
            >
              Concurso
            </button>
            <button
              onClick={() => setTab("buzon")}
              className={`px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-sm ${
                tab === "buzon"
                  ? "bg-[#1D1D1F] text-[#EAE84B]"
                  : "bg-white text-gray-500 hover:text-[#6F2C91]"
              }`}
            >
              Buzón Ciudadano
            </button>
            <button
              onClick={() => setTab("contenido")}
              className={`px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-sm ${
                tab === "contenido"
                  ? "bg-[#1D1D1F] text-[#EAE84B]"
                  : "bg-white text-gray-500 hover:text-[#6F2C91]"
              }`}
            >
              Contenido
            </button>
          </div>

          <button
            onClick={() => {
              setReportTipo("historico");
              const m = monthKey(new Date().toISOString());
              setReportMes((prev) => prev || m);
              setShowReportModal(true);
            }}
            className="flex items-center gap-3 px-8 py-3 rounded-2xl bg-[#6F2C91] text-white font-black text-xs uppercase tracking-widest hover:bg-[#1D1D1F] hover:text-[#EAE84B] transition-all shadow-lg active:scale-95"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Reporte Mensual Completo (PDF)
          </button>
        </div>

        {tab === "concurso" && (
          <>
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12">
              <div>
                <h2
                  style={{ fontFamily: "'Oswald', sans-serif" }}
                  className="text-4xl md:text-6xl text-[#1D1D1F] font-black uppercase leading-none mb-3"
                >
                  LISTADO DE <span className="text-[#6F2C91]">PROYECTOS</span>
                </h2>
                <div className="flex items-center gap-3">
                  <span className="px-4 py-1.5 bg-[#EAE84B] text-[#6F2C91] font-bold text-sm rounded-lg shadow-sm">
                    {proyectos.length} Participantes Registrados
                  </span>
                  {loadingProyectos && (
                    <span className="text-[#6F2C91] text-xs font-bold animate-pulse">
                      Sincronizando...
                    </span>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="relative flex-1 min-w-[280px]">
                  <input
                    type="text"
                    placeholder="Buscar por nombre, CI o proyecto..."
                    value={searchTermProyectos}
                    onChange={(e) => setSearchTermProyectos(e.target.value)}
                    className="w-full py-4 px-6 pr-12 rounded-2xl border-2 border-transparent bg-white shadow-sm focus:border-[#6F2C91] outline-none transition-all font-medium text-black"
                  />
                </div>

                <button
                  onClick={fetchProyectos}
                  className="p-4 rounded-2xl bg-white text-[#1D1D1F] hover:text-[#6F2C91] shadow-sm hover:shadow-md transition-all active:scale-95"
                  title="Actualizar"
                >
                  <svg
                    className={`w-6 h-6 ${loadingProyectos ? "animate-spin" : ""}`}
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
                  onClick={exportProyectosExcel}
                  disabled={proyectosFiltrados.length === 0}
                  className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-[#1D1D1F] text-[#EAE84B] font-black uppercase tracking-widest hover:bg-[#6F2C91] hover:text-white disabled:opacity-30 disabled:grayscale transition-all shadow-xl active:scale-95"
                >
                  EXPORTAR EXCEL
                </button>
              </div>
            </div>

            <div className="bg-white rounded-[2.5rem] shadow-[0_30px_100px_-20px_rgba(0,0,0,0.05)] overflow-hidden border border-gray-100">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[2800px]">
                  <thead>
                    <tr className="bg-[#1D1D1F] text-[#EAE84B] text-[10px] font-black uppercase tracking-[0.2em]">
                      <th className="py-6 px-8 whitespace-nowrap border-r border-white/10">Fecha Reg.</th>
                      <th className="py-6 px-8 whitespace-nowrap border-r border-white/10">Nombres y Apellidos</th>
                      <th className="py-6 px-8 whitespace-nowrap border-r border-white/10">Cédula</th>
                      <th className="py-6 px-8 whitespace-nowrap border-r border-white/10">F. Nacimiento</th>
                      <th className="py-6 px-8 whitespace-nowrap border-r border-white/10">Cantón/Parroquia</th>
                      <th className="py-6 px-8 whitespace-nowrap border-r border-white/10">Dirección</th>
                      <th className="py-6 px-8 whitespace-nowrap border-r border-white/10">Teléfono</th>
                      <th className="py-6 px-8 whitespace-nowrap border-r border-white/10">Correo</th>
                      <th className="py-6 px-8 whitespace-nowrap border-r border-white/10">Redes Sociales</th>
                      <th className="py-6 px-8 whitespace-nowrap border-r border-white/10">Ocupación</th>
                      <th className="py-6 px-8 whitespace-nowrap border-r border-white/10">Institución</th>
                      <th className="py-6 px-8 whitespace-nowrap border-r border-white/10">Área Interés</th>
                      <th className="py-6 px-8 whitespace-nowrap border-r border-white/10">Título Proyecto</th>
                      <th className="py-6 px-8 text-center whitespace-nowrap">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {proyectosFiltrados.length === 0 ? (
                      <tr>
                        <td colSpan={14} className="py-32 text-center">
                          <p className="text-gray-400 font-bold uppercase tracking-widest text-sm">
                            {loadingProyectos
                              ? "Cargando registros desde Supabase..."
                              : "No se encontraron registros"}
                          </p>
                        </td>
                      </tr>
                    ) : (
                      proyectosFiltrados.map((item) => (
                        <tr
                          key={item.id}
                          className="hover:bg-[#FBFBFD] transition-colors group text-sm"
                        >
                          <td className="py-6 px-8 text-gray-400 font-medium whitespace-nowrap border-r border-gray-50">
                            {new Date(item.created_at).toLocaleDateString()}
                          </td>
                          <td className="py-6 px-8 font-black text-[#1D1D1F] whitespace-normal min-w-[250px] border-r border-gray-50 capitalize">
                            {item.nombres}
                          </td>
                          <td className="py-6 px-8 font-bold text-gray-500 whitespace-nowrap border-r border-gray-50">
                            {item.cedula}
                          </td>
                          <td className="py-6 px-8 font-bold text-gray-500 whitespace-nowrap border-r border-gray-50">
                            {item.edad}
                          </td>
                          <td className="py-6 px-8 font-bold text-gray-700 whitespace-normal min-w-[180px] border-r border-gray-50">
                            {item.cantonParroquia}
                          </td>
                          <td className="py-6 px-8 font-medium text-gray-400 whitespace-normal min-w-[350px] border-r border-gray-50 break-words">
                            {item.direccion}
                          </td>
                          <td className="py-6 px-8 font-black text-[#6F2C91] whitespace-nowrap border-r border-gray-50">
                            {item.telefono}
                          </td>
                          <td className="py-6 px-8 font-medium text-gray-500 whitespace-normal min-w-[250px] break-all border-r border-gray-50">
                            {item.correo}
                          </td>
                          <td className="py-6 px-8 font-bold text-gray-400 whitespace-normal min-w-[150px] border-r border-gray-50">
                            {item.redesSociales}
                          </td>
                          <td className="py-6 px-8 border-r border-gray-50">
                            <span className="px-3 py-1 bg-gray-100 rounded-lg text-[10px] font-black text-gray-500 uppercase tracking-wider whitespace-nowrap">
                              {item.ocupacion}
                            </span>
                          </td>
                          <td className="py-6 px-8 font-medium text-gray-500 whitespace-normal min-w-[220px] border-r border-gray-50">
                            {item.institucion}
                          </td>
                          <td className="py-6 px-8 border-r border-gray-50">
                            <span className="px-3 py-1 bg-purple-50 text-[#6F2C91] rounded-lg text-[10px] font-black uppercase tracking-wider whitespace-nowrap">
                              {item.areaInteres}
                            </span>
                          </td>
                          <td className="py-6 px-8 font-bold text-gray-800 whitespace-normal min-w-[400px] border-r border-gray-50 break-words">
                            {item.tituloProyecto}
                          </td>
                          <td className="py-6 px-8 text-center">
                            <a
                              href={getExternalLink(item.linkProyecto)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 px-5 py-3 bg-[#F5F5F7] text-[#1D1D1F] rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-[#6F2C91] hover:text-white transition-all group-hover:shadow-lg whitespace-nowrap"
                            >
                              VER PROYECTO
                            </a>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {tab === "buzon" && (
          <>
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10">
              <div>
                <h2
                  style={{ fontFamily: "'Oswald', sans-serif" }}
                  className="text-4xl md:text-6xl text-[#1D1D1F] font-black uppercase leading-none mb-3"
                >
                  BUZÓN <span className="text-[#6F2C91]">CIUDADANO</span>
                </h2>
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="px-4 py-1.5 bg-[#EAE84B] text-[#6F2C91] font-bold text-sm rounded-lg shadow-sm">
                    {mensajes.length} mensajes totales
                  </span>
                  {loadingMensajes && (
                    <span className="text-[#6F2C91] text-xs font-bold animate-pulse">
                      Sincronizando...
                    </span>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={fetchMensajes}
                  className="p-4 rounded-2xl bg-white text-[#1D1D1F] hover:text-[#6F2C91] shadow-sm hover:shadow-md transition-all active:scale-95"
                  title="Actualizar"
                >
                  <svg
                    className={`w-6 h-6 ${loadingMensajes ? "animate-spin" : ""}`}
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
                  onClick={exportResumenMensualExcel}
                  disabled={stats.mesesOrdenados.length === 0}
                  className="flex items-center gap-3 px-6 py-4 rounded-2xl bg-white text-[#1D1D1F] font-black uppercase tracking-widest text-xs hover:bg-[#6F2C91] hover:text-white disabled:opacity-30 transition-all shadow-md active:scale-95"
                >
                  Resumen mensual (CSV)
                </button>

                <button
                  onClick={exportMensajesExcel}
                  disabled={mensajesFiltrados.length === 0}
                  className="flex items-center gap-3 px-6 py-4 rounded-2xl bg-white text-[#1D1D1F] font-black uppercase tracking-widest text-xs hover:bg-[#6F2C91] hover:text-white disabled:opacity-30 transition-all shadow-md active:scale-95"
                >
                  Mensajes (CSV)
                </button>

                <button
                  onClick={exportBuzonPdf}
                  className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-[#1D1D1F] text-[#EAE84B] font-black uppercase tracking-widest hover:bg-[#6F2C91] hover:text-white transition-all shadow-xl active:scale-95"
                >
                  PDF solo buzón
                </button>
              </div>
            </div>

            {/* STATS CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
              <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2">
                  Total acumulado
                </p>
                <p className="text-5xl font-black text-[#1D1D1F]">
                  {stats.totalGeneral}
                </p>
                <p className="text-xs text-gray-400 mt-2">mensajes recibidos</p>
              </div>

              <div className="bg-[#6F2C91] rounded-[2rem] p-8 shadow-sm">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#EAE84B] mb-2">
                  Este mes
                </p>
                <p className="text-5xl font-black text-white">
                  {stats.totalEsteMes}
                </p>
                <p className="text-xs text-[#EAE84B]/80 mt-2">
                  {monthLabel(monthKey(new Date().toISOString()))}
                </p>
              </div>

              <div className="bg-[#EAE84B] rounded-[2rem] p-8 shadow-sm">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#6F2C91] mb-2">
                  Mes con más mensajes
                </p>
                <p className="text-3xl font-black text-[#1D1D1F] leading-tight">
                  {stats.mesPico ? monthLabel(stats.mesPico[0]) : "—"}
                </p>
                <p className="text-xs text-[#6F2C91] font-bold mt-2">
                  {stats.mesPico ? `${stats.mesPico[1]} mensajes` : "sin datos aún"}
                </p>
              </div>
            </div>

            {/* MONTHLY BREAKDOWN */}
            <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100 mb-8">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400 mb-6">
                Mensajes por mes
              </h3>
              {stats.mesesOrdenados.length === 0 ? (
                <p className="text-gray-400 text-sm">
                  {loadingMensajes ? "Cargando..." : "Aún no hay mensajes."}
                </p>
              ) : (
                <div className="space-y-3">
                  {stats.mesesOrdenados.map(([k, n]) => {
                    const pct = stats.maxMes ? (n / stats.maxMes) * 100 : 0;
                    return (
                      <div key={k} className="flex items-center gap-4">
                        <div className="w-40 text-xs font-bold text-[#1D1D1F]">
                          {monthLabel(k)}
                        </div>
                        <div className="flex-1 h-6 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#6F2C91] rounded-full transition-all"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <div className="w-12 text-right text-sm font-black text-[#6F2C91]">
                          {n}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* TOP CANTONES + TOP ASUNTOS */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
              <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400 mb-6">
                  Por ubicación (cantón / provincia)
                </h3>
                {stats.cantonesOrdenados.length === 0 ? (
                  <p className="text-gray-400 text-sm">Sin datos.</p>
                ) : (
                  <div className="space-y-2">
                    {stats.cantonesOrdenados.slice(0, 10).map(([k, n]) => (
                      <div
                        key={k}
                        className="flex items-center justify-between py-2 border-b border-gray-50 last:border-b-0"
                      >
                        <span className="font-bold text-[#1D1D1F] capitalize">
                          {k}
                        </span>
                        <span className="px-3 py-1 bg-purple-50 text-[#6F2C91] rounded-lg text-xs font-black">
                          {n}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400 mb-6">
                  Por tema (asunto)
                </h3>
                {stats.asuntosOrdenados.length === 0 ? (
                  <p className="text-gray-400 text-sm">Sin datos.</p>
                ) : (
                  <div className="space-y-2">
                    {stats.asuntosOrdenados.slice(0, 10).map(([k, n]) => (
                      <div
                        key={k}
                        className="flex items-center justify-between py-2 border-b border-gray-50 last:border-b-0"
                      >
                        <span className="font-bold text-[#1D1D1F] truncate pr-3">
                          {k}
                        </span>
                        <span className="px-3 py-1 bg-yellow-50 text-[#6F2C91] rounded-lg text-xs font-black flex-none">
                          {n}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* FILTERS */}
            <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100 mb-6 flex flex-wrap gap-4 items-center">
              <div className="flex-1 min-w-[260px]">
                <input
                  type="text"
                  placeholder="Buscar nombre, cantón, asunto o mensaje..."
                  value={searchTermMensajes}
                  onChange={(e) => setSearchTermMensajes(e.target.value)}
                  className="w-full py-3 px-5 rounded-xl border-2 border-transparent bg-[#F5F5F7] focus:bg-white focus:border-[#6F2C91] outline-none transition-all font-medium text-black"
                />
              </div>
              <select
                value={mesFiltro}
                onChange={(e) => setMesFiltro(e.target.value)}
                className="py-3 px-5 rounded-xl border-2 border-transparent bg-[#F5F5F7] focus:bg-white focus:border-[#6F2C91] outline-none transition-all font-bold text-[#1D1D1F]"
              >
                <option value="todos">Todos los meses</option>
                {mesesDisponibles.map((k) => (
                  <option key={k} value={k}>
                    {monthLabel(k)}
                  </option>
                ))}
              </select>
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                {mensajesFiltrados.length} resultados
              </span>
            </div>

            {/* MESSAGE LIST */}
            <div className="bg-white rounded-[2.5rem] shadow-[0_30px_100px_-20px_rgba(0,0,0,0.05)] overflow-hidden border border-gray-100">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[1200px]">
                  <thead>
                    <tr className="bg-[#1D1D1F] text-[#EAE84B] text-[10px] font-black uppercase tracking-[0.2em]">
                      <th className="py-5 px-6">Fecha</th>
                      <th className="py-5 px-6">Nombre</th>
                      <th className="py-5 px-6">Cantón</th>
                      <th className="py-5 px-6">Asunto</th>
                      <th className="py-5 px-6">Contacto</th>
                      <th className="py-5 px-6 text-center">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {mensajesFiltrados.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-24 text-center">
                          <p className="text-gray-400 font-bold uppercase tracking-widest text-sm">
                            {loadingMensajes
                              ? "Cargando mensajes desde Supabase..."
                              : "No se encontraron mensajes"}
                          </p>
                        </td>
                      </tr>
                    ) : (
                      mensajesFiltrados.map((m) => {
                        const open = mensajeAbierto === m.id;
                        return (
                          <Fragment key={m.id}>
                            <tr
                              className="hover:bg-[#FBFBFD] transition-colors group text-sm"
                            >
                              <td className="py-5 px-6 text-gray-400 font-medium whitespace-nowrap">
                                {new Date(m.created_at).toLocaleString()}
                              </td>
                              <td className="py-5 px-6 font-black text-[#1D1D1F] capitalize">
                                {m.nombre}
                              </td>
                              <td className="py-5 px-6 font-bold text-gray-700">
                                {m.canton}
                              </td>
                              <td className="py-5 px-6 font-bold text-[#6F2C91]">
                                {m.asunto}
                              </td>
                              <td className="py-5 px-6 text-xs text-gray-500">
                                <div className="font-bold">{m.correo}</div>
                                <div>{m.whatsapp}</div>
                              </td>
                              <td className="py-5 px-6 text-center">
                                <button
                                  onClick={() =>
                                    setMensajeAbierto(open ? null : m.id)
                                  }
                                  className="px-4 py-2 bg-[#F5F5F7] text-[#1D1D1F] rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-[#6F2C91] hover:text-white transition-all"
                                >
                                  {open ? "Ocultar" : "Ver mensaje"}
                                </button>
                              </td>
                            </tr>
                            {open && (
                              <tr key={m.id + "-detail"} className="bg-[#FBFBFD]">
                                <td colSpan={6} className="py-6 px-6">
                                  <div className="max-w-3xl">
                                    <p className="whitespace-pre-wrap text-[#1D1D1F] leading-relaxed">
                                      {m.mensaje}
                                    </p>
                                    {m.archivo_url && (
                                      <a
                                        href={m.archivo_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-[#6F2C91] text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-[#5a2376] transition-all"
                                      >
                                        Ver archivo
                                        {m.archivo_nombre
                                          ? `: ${m.archivo_nombre}`
                                          : ""}
                                      </a>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            )}
                          </Fragment>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {tab === "contenido" && <CmsHeroEditor />}

        <div className="mt-8 flex justify-between items-center px-4">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">
            © 2026 PANEL ADMINISTRATIVO
          </p>
          <button
            onClick={() => setIsAuthenticated(false)}
            className="text-[10px] font-black text-red-500 hover:text-red-700 uppercase tracking-widest transition-colors"
          >
            Cerrar Sesión
          </button>
        </div>
      </div>
      <style
        dangerouslySetInnerHTML={{
          __html: `@import url('https://fonts.googleapis.com/css2?family=Oswald:wght@700&display=swap');`,
        }}
      />

      {/* MODAL: Configuración del Reporte PDF */}
      {showReportModal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => setShowReportModal(false)}
        >
          <div
            className="bg-white rounded-[2rem] w-full max-w-[640px] max-h-[90vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-[#6F2C91] text-white p-6 rounded-t-[2rem]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#EAE84B] mb-1">
                    Generar reporte
                  </p>
                  <h3 className="text-2xl font-black uppercase">¿Qué período incluir?</h3>
                </div>
                <button
                  onClick={() => setShowReportModal(false)}
                  className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
                  aria-label="Cerrar"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {/* Opción: Histórico */}
              <label
                className={`block p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                  reportTipo === "historico"
                    ? "border-[#6F2C91] bg-purple-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="flex items-start gap-3">
                  <input
                    type="radio"
                    name="reportTipo"
                    checked={reportTipo === "historico"}
                    onChange={() => setReportTipo("historico")}
                    className="mt-1 w-5 h-5 accent-[#6F2C91]"
                  />
                  <div className="flex-1">
                    <p className="font-black text-[#1D1D1F] uppercase text-sm tracking-wide">
                      Histórico completo
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Incluye todos los datos desde el inicio. Útil para reportes acumulados.
                    </p>
                  </div>
                </div>
              </label>

              {/* Opción: Por mes */}
              <label
                className={`block p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                  reportTipo === "mes"
                    ? "border-[#6F2C91] bg-purple-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="flex items-start gap-3">
                  <input
                    type="radio"
                    name="reportTipo"
                    checked={reportTipo === "mes"}
                    onChange={() => setReportTipo("mes")}
                    className="mt-1 w-5 h-5 accent-[#6F2C91]"
                  />
                  <div className="flex-1">
                    <p className="font-black text-[#1D1D1F] uppercase text-sm tracking-wide">
                      Por mes específico
                    </p>
                    <p className="text-xs text-gray-500 mt-1 mb-3">
                      Solo datos del mes que selecciones.
                    </p>
                    <input
                      type="month"
                      value={reportMes}
                      onChange={(e) => {
                        setReportMes(e.target.value);
                        setReportTipo("mes");
                      }}
                      className="w-full py-3 px-4 rounded-xl bg-white border-2 border-gray-200 focus:border-[#6F2C91] outline-none transition-all font-bold text-[#1D1D1F]"
                    />
                  </div>
                </div>
              </label>

              {/* Opción: Rango personalizado */}
              <label
                className={`block p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                  reportTipo === "rango"
                    ? "border-[#6F2C91] bg-purple-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="flex items-start gap-3">
                  <input
                    type="radio"
                    name="reportTipo"
                    checked={reportTipo === "rango"}
                    onChange={() => setReportTipo("rango")}
                    className="mt-1 w-5 h-5 accent-[#6F2C91]"
                  />
                  <div className="flex-1">
                    <p className="font-black text-[#1D1D1F] uppercase text-sm tracking-wide">
                      Rango personalizado de fechas
                    </p>
                    <p className="text-xs text-gray-500 mt-1 mb-3">
                      Define un rango exacto desde / hasta.
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-1">
                          Desde
                        </label>
                        <input
                          type="date"
                          value={reportDesde}
                          onChange={(e) => {
                            setReportDesde(e.target.value);
                            setReportTipo("rango");
                          }}
                          className="w-full py-3 px-4 rounded-xl bg-white border-2 border-gray-200 focus:border-[#6F2C91] outline-none transition-all font-bold text-[#1D1D1F]"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-1">
                          Hasta
                        </label>
                        <input
                          type="date"
                          value={reportHasta}
                          onChange={(e) => {
                            setReportHasta(e.target.value);
                            setReportTipo("rango");
                          }}
                          className="w-full py-3 px-4 rounded-xl bg-white border-2 border-gray-200 focus:border-[#6F2C91] outline-none transition-all font-bold text-[#1D1D1F]"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </label>

              {/* Preview */}
              <div className="bg-[#FBFBFD] rounded-2xl p-5 border border-gray-100">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3">
                  Vista previa del reporte
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-3xl font-black text-[#6F2C91]">{previewCounts.mensajes}</p>
                    <p className="text-xs text-gray-500">mensajes del buzón</p>
                  </div>
                  <div>
                    <p className="text-3xl font-black text-[#1D1D1F]">{previewCounts.proyectos}</p>
                    <p className="text-xs text-gray-500">inscritos al concurso</p>
                  </div>
                </div>
                {reportTipo === "rango" && (!reportDesde || !reportHasta) && (
                  <p className="text-xs text-orange-600 font-bold mt-3">
                    Selecciona desde y hasta para activar el rango.
                  </p>
                )}
                {reportTipo === "rango" && reportDesde && reportHasta && reportDesde > reportHasta && (
                  <p className="text-xs text-red-600 font-bold mt-3">
                    La fecha "desde" debe ser anterior a la fecha "hasta".
                  </p>
                )}
              </div>
            </div>

            <div className="p-6 pt-0 flex flex-wrap gap-3 justify-end">
              <button
                onClick={() => setShowReportModal(false)}
                className="px-6 py-3 rounded-2xl bg-gray-100 text-gray-600 font-black text-xs uppercase tracking-widest hover:bg-gray-200 transition-all"
              >
                Cancelar
              </button>
              <button
                disabled={
                  (reportTipo === "mes" && !reportMes) ||
                  (reportTipo === "rango" &&
                    (!reportDesde || !reportHasta || reportDesde > reportHasta))
                }
                onClick={() => {
                  exportReporteCompletoPdf();
                  setShowReportModal(false);
                }}
                className="flex items-center gap-2 px-8 py-3 rounded-2xl bg-[#6F2C91] text-white font-black text-xs uppercase tracking-widest hover:bg-[#1D1D1F] hover:text-[#EAE84B] disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg active:scale-95"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Generar PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
