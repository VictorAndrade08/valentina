"use client";

import { Fragment, useState, useEffect, useMemo } from "react";
import { getSupabase } from "@/lib/supabaseClient";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

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

type TabKey = "concurso" | "buzon";

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

  const stats = useMemo(() => {
    const totalGeneral = mensajes.length;
    const nowKey = monthKey(new Date().toISOString());
    const totalEsteMes = mensajes.filter(
      (m) => monthKey(m.created_at) === nowKey
    ).length;

    const porMes = new Map<string, number>();
    const porCanton = new Map<string, number>();
    const porAsunto = new Map<string, number>();
    mensajes.forEach((m) => {
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
  }, [mensajes]);

  const proyectoStats = useMemo(() => {
    const totalGeneral = proyectos.length;
    const nowKey = monthKey(new Date().toISOString());
    const totalEsteMes = proyectos.filter(
      (p) => monthKey(p.created_at) === nowKey
    ).length;

    const porMes = new Map<string, number>();
    const porCanton = new Map<string, number>();
    const porArea = new Map<string, number>();
    const porOcupacion = new Map<string, number>();
    const porInstitucion = new Map<string, number>();
    proyectos.forEach((p) => {
      const mk = monthKey(p.created_at);
      porMes.set(mk, (porMes.get(mk) || 0) + 1);
      const canton = (p.cantonParroquia || "Sin especificar").trim();
      porCanton.set(canton, (porCanton.get(canton) || 0) + 1);
      const area = (p.areaInteres || "Sin especificar").trim();
      porArea.set(area, (porArea.get(area) || 0) + 1);
      const ocupacion = (p.ocupacion || "Sin especificar").trim();
      porOcupacion.set(ocupacion, (porOcupacion.get(ocupacion) || 0) + 1);
      const institucion = (p.institucion || "Sin especificar").trim();
      porInstitucion.set(
        institucion,
        (porInstitucion.get(institucion) || 0) + 1
      );
    });

    const mesesOrdenados = Array.from(porMes.entries()).sort((a, b) =>
      a[0] < b[0] ? 1 : -1
    );
    const cantonesOrdenados = Array.from(porCanton.entries()).sort(
      (a, b) => b[1] - a[1]
    );
    const areasOrdenadas = Array.from(porArea.entries()).sort(
      (a, b) => b[1] - a[1]
    );
    const ocupacionesOrdenadas = Array.from(porOcupacion.entries()).sort(
      (a, b) => b[1] - a[1]
    );
    const institucionesOrdenadas = Array.from(porInstitucion.entries()).sort(
      (a, b) => b[1] - a[1]
    );

    const mesPico =
      mesesOrdenados.length > 0
        ? mesesOrdenados.reduce((a, b) => (b[1] > a[1] ? b : a))
        : null;

    return {
      totalGeneral,
      totalEsteMes,
      mesPico,
      mesesOrdenados,
      cantonesOrdenados,
      areasOrdenadas,
      ocupacionesOrdenadas,
      institucionesOrdenadas,
    };
  }, [proyectos]);

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

  const exportReporteCompletoPdf = () => {
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
    doc.text(`Generado: ${fechaLarga}`, margin, 162);

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
    drawKpi(margin, kpiTop, kpiW, kpiH, "Mensajes (total)", String(stats.totalGeneral), "Buzón acumulado", LIGHT, DARK);
    drawKpi(margin + kpiW + gap, kpiTop, kpiW, kpiH, "Mensajes este mes", String(stats.totalEsteMes), monthLabel(monthKey(new Date().toISOString())), PURPLE, WHITE);
    drawKpi(margin + (kpiW + gap) * 2, kpiTop, kpiW, kpiH, "Mes pico buzón", stats.mesPico ? String(stats.mesPico[1]) : "0", stats.mesPico ? monthLabel(stats.mesPico[0]) : "sin datos", YELLOW, PURPLE);

    // Fila 2 (concurso)
    const kpiTop2 = kpiTop + kpiH + gap;
    drawKpi(margin, kpiTop2, kpiW, kpiH, "Inscritos (total)", String(proyectoStats.totalGeneral), "Concurso acumulado", LIGHT, DARK);
    drawKpi(margin + kpiW + gap, kpiTop2, kpiW, kpiH, "Inscritos este mes", String(proyectoStats.totalEsteMes), monthLabel(monthKey(new Date().toISOString())), PURPLE, WHITE);
    drawKpi(margin + (kpiW + gap) * 2, kpiTop2, kpiW, kpiH, "Mes pico concurso", proyectoStats.mesPico ? String(proyectoStats.mesPico[1]) : "0", proyectoStats.mesPico ? monthLabel(proyectoStats.mesPico[0]) : "sin datos", YELLOW, PURPLE);

    // Snapshots clave
    const snapY = kpiTop2 + kpiH + 25;
    doc.setTextColor(...DARK);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("Snapshots clave", margin, snapY);

    const topCantonMsg = stats.cantonesOrdenados[0];
    const topAsunto = stats.asuntosOrdenados[0];
    const topCantonProy = proyectoStats.cantonesOrdenados[0];
    const topArea = proyectoStats.areasOrdenadas[0];

    autoTable(doc, {
      startY: snapY + 10,
      head: [["Indicador", "Valor"]],
      body: [
        ["Total mensajes recibidos", String(stats.totalGeneral)],
        ["Mensajes este mes", String(stats.totalEsteMes)],
        ["Ubicación con más mensajes", topCantonMsg ? `${topCantonMsg[0]} (${topCantonMsg[1]})` : "—"],
        ["Tema más recurrente", topAsunto ? `${topAsunto[0]} (${topAsunto[1]})` : "—"],
        ["Total inscritos al concurso", String(proyectoStats.totalGeneral)],
        ["Inscritos este mes", String(proyectoStats.totalEsteMes)],
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
    let y = drawSectionTitle("SECCIÓN 1 — BUZÓN CIUDADANO", `${stats.totalGeneral} mensajes`, margin);

    doc.setTextColor(...DARK);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("1.1 Mensajes por mes (con variación vs mes anterior)", margin, y);
    y += 10;

    const buzonMesAsc = [...stats.mesesOrdenados].reverse();
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

    const totalMsg = Math.max(stats.totalGeneral, 1);
    autoTable(doc, {
      startY: y + 10,
      head: [["#", "Ubicación", "Mensajes", "% del total"]],
      body: stats.cantonesOrdenados.slice(0, 15).map(([k, n], i) => [
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
      body: stats.asuntosOrdenados.slice(0, 15).map(([k, n], i) => [
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
    y = drawSectionTitle("1.4 LISTADO COMPLETO DE MENSAJES", `${mensajes.length} mensajes`, margin);

    if (mensajes.length === 0) {
      doc.setFont("helvetica", "italic");
      doc.setFontSize(10);
      doc.setTextColor(...GRAY);
      doc.text("Aún no se han recibido mensajes en el buzón.", margin, y);
    } else {
      autoTable(doc, {
        startY: y,
        head: [["Fecha", "Nombre", "Cantón", "Contacto", "Asunto", "Mensaje"]],
        body: mensajes.map((m) => [
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
    y = drawSectionTitle("SECCIÓN 2 — CONCURSO (PROYECTOS)", `${proyectoStats.totalGeneral} inscritos`, margin);

    doc.setTextColor(...DARK);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("2.1 Inscripciones por mes (con variación)", margin, y);

    const proyMesAsc = [...proyectoStats.mesesOrdenados].reverse();
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

    const totalProy = Math.max(proyectoStats.totalGeneral, 1);
    autoTable(doc, {
      startY: y + 10,
      head: [["#", "Cantón / Parroquia", "Inscritos", "% del total"]],
      body: proyectoStats.cantonesOrdenados.slice(0, 15).map(([k, n], i) => [
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
      body: proyectoStats.areasOrdenadas.map(([k, n], i) => [
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
      body: proyectoStats.ocupacionesOrdenadas.slice(0, 10).map(([k, n], i) => [
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
      body: proyectoStats.institucionesOrdenadas.slice(0, 10).map(([k, n], i) => [
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
    y = drawSectionTitle("2.6 LISTADO COMPLETO DE INSCRITOS", `${proyectos.length} inscritos`, margin);

    if (proyectos.length === 0) {
      doc.setFont("helvetica", "italic");
      doc.setFontSize(10);
      doc.setTextColor(...GRAY);
      doc.text("Aún no hay inscritos al concurso.", margin, y);
    } else {
      autoTable(doc, {
        startY: y,
        head: [["Fecha", "Nombre", "Cédula", "Cantón", "Edad", "Área", "Ocupación", "Título proyecto"]],
        body: proyectos.map((p) => [
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
    doc.save(`Reporte_Mensual_Completo_${new Date().toISOString().split("T")[0]}.pdf`);
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
          </div>

          <button
            onClick={exportReporteCompletoPdf}
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
    </section>
  );
}
