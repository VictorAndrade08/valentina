"use client";

import { useState, useEffect } from "react";

// ⚠️ Se mantienen las variables apuntando a process.env
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY || "";

// Clave de acceso al panel
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

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [errorLogin, setErrorLogin] = useState(false);
  
  const [proyectos, setProyectos] = useState<Proyecto[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Manejo de Autenticación
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

  // Función Maestra de Lectura de Datos (Fetch Nativo)
  const fetchProyectos = async () => {
    if (!isAuthenticated) return;
    
    // Verificación de variables en consola para debug (solo tú las verás)
    if (!SUPABASE_URL || !SUPABASE_KEY) {
      console.error("Error: Variables de entorno no detectadas en el servidor.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/proyectos?select=*&order=created_at.desc`, {
        method: 'GET',
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        cache: 'no-store'
      });

      if (response.ok) {
        const data = await response.json();
        setProyectos(data || []);
      } else {
        const errorText = await response.text();
        console.error("Error de Supabase:", errorText);
      }
    } catch (error) {
      console.error("Error de conexión:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchProyectos();
    }
  }, [isAuthenticated]);

  const proyectosFiltrados = proyectos.filter((p) => {
    const term = searchTerm.toLowerCase();
    return (
      (p.nombres || "").toLowerCase().includes(term) ||
      (p.cedula || "").includes(term) ||
      (p.tituloProyecto || "").toLowerCase().includes(term) ||
      (p.cantonParroquia || "").toLowerCase().includes(term) ||
      (p.correo || "").toLowerCase().includes(term)
    );
  });

  const exportToExcel = () => {
    if (proyectosFiltrados.length === 0) return;

    const headers = [
      "Fecha", "Participante", "Cédula", "Edad", "Cantón", "Dirección", 
      "Teléfono", "Correo", "Redes", "Ocupación", "Institución", 
      "Área", "Proyecto", "Link"
    ];

    const clean = (val: any) => {
      if (val === null || val === undefined) return '""';
      return `"${String(val).replace(/"/g, '""')}"`;
    };

    const rows = proyectosFiltrados.map(p => [
      new Date(p.created_at).toLocaleDateString(),
      p.nombres, p.cedula, p.edad, p.cantonParroquia, p.direccion,
      p.telefono, p.correo, p.redesSociales, p.ocupacion, p.institucion,
      p.areaInteres, p.tituloProyecto, p.linkProyecto
    ].map(clean).join(","));

    const csvContent = headers.join(",") + "\n" + rows.join("\n");
    const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.body.appendChild(document.createElement("a"));
    link.href = url;
    link.download = `Reporte_Concurso_Valentina_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    document.body.removeChild(link);
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
          <h2 style={{ fontFamily: "'Oswald', sans-serif" }} className="text-4xl text-[#1D1D1F] font-black uppercase mb-4">
            PANEL DE <span className="text-[#6F2C91]">ADMINISTRACIÓN</span>
          </h2>
          <div className="inline-block px-6 py-2 bg-[#EAE84B] text-[#6F2C91] font-bold rounded-xl shadow-sm -rotate-1">
            ACCESO RESTRINGIDO
          </div>
        </div>

        <div className="w-full max-w-[450px] bg-white p-10 rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] relative border-t-8 border-[#EAE84B]">
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 block text-center">Contraseña del Panel</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                className="w-full p-4 text-center text-xl tracking-[0.5em] bg-[#F5F5F7] border-2 border-[#F5F5F7] rounded-2xl focus:border-[#6F2C91] focus:bg-white outline-none transition-all text-black"
              />
              {errorLogin && <p className="text-red-500 text-xs font-bold text-center mt-2">Clave incorrecta. Intenta de nuevo.</p>}
            </div>
            <button type="submit" className="w-full py-4 rounded-2xl bg-[#1D1D1F] text-[#EAE84B] font-black uppercase tracking-widest hover:bg-[#6F2C91] hover:text-white transition-all shadow-lg active:scale-95">
              ENTRAR AL PANEL
            </button>
          </form>
        </div>
        <style dangerouslySetInnerHTML={{ __html: `@import url('https://fonts.googleapis.com/css2?family=Oswald:wght@700&display=swap');` }} />
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-[#FBFBFD] py-12 px-4 md:px-10">
      <div className="max-w-[2800px] mx-auto">
        
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12">
          <div>
            <h2 style={{ fontFamily: "'Oswald', sans-serif" }} className="text-4xl md:text-6xl text-[#1D1D1F] font-black uppercase leading-none mb-3">
              LISTADO DE <span className="text-[#6F2C91]">PROYECTOS</span>
            </h2>
            <div className="flex items-center gap-3">
              <span className="px-4 py-1.5 bg-[#EAE84B] text-[#6F2C91] font-bold text-sm rounded-lg shadow-sm">
                {proyectos.length} Participantes Registrados
              </span>
              {loading && <span className="text-[#6F2C91] text-xs font-bold animate-pulse">Sincronizando...</span>}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[280px]">
              <input
                type="text"
                placeholder="Buscar por nombre, CI o proyecto..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full py-4 px-6 pr-12 rounded-2xl border-2 border-transparent bg-white shadow-sm focus:border-[#6F2C91] outline-none transition-all font-medium text-black"
              />
              <svg className="w-5 h-5 absolute right-5 top-1/2 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            </div>
            
            <button onClick={fetchProyectos} className="p-4 rounded-2xl bg-white text-[#1D1D1F] hover:text-[#6F2C91] shadow-sm hover:shadow-md transition-all active:scale-95" title="Actualizar">
              <svg className={`w-6 h-6 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357-2H15"></path></svg>
            </button>

            <button
              onClick={exportToExcel}
              disabled={proyectosFiltrados.length === 0}
              className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-[#1D1D1F] text-[#EAE84B] font-black uppercase tracking-widest hover:bg-[#6F2C91] hover:text-white disabled:opacity-30 disabled:grayscale transition-all shadow-xl active:scale-95"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
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
                        {loading ? "Cargando registros desde Supabase..." : "No se encontraron registros"}
                      </p>
                    </td>
                  </tr>
                ) : (
                  proyectosFiltrados.map((item) => (
                    <tr key={item.id} className="hover:bg-[#FBFBFD] transition-colors group text-sm">
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
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
                        </a>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-8 flex justify-between items-center px-4">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">© 2026 PANEL ADMINISTRATIVO - CONCURSO VALENTINA</p>
          <button onClick={() => setIsAuthenticated(false)} className="text-[10px] font-black text-red-500 hover:text-red-700 uppercase tracking-widest transition-colors">Cerrar Sesión</button>
        </div>

      </div>
      <style dangerouslySetInnerHTML={{ __html: `@import url('https://fonts.googleapis.com/css2?family=Oswald:wght@700&display=swap');` }} />
    </section>
  );
}