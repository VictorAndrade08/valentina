#!/usr/bin/env node
// Carga datos de demostración realistas para Fase 1.
// Guarda los IDs insertados en scripts/_seed_state.json para limpieza segura.
// Borrar todo después con:   node scripts/_clean_test_fase1.mjs
import { createClient } from "@supabase/supabase-js";
import { readFileSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const envText = readFileSync(resolve(root, ".env.local"), "utf8");
const env = {};
for (const line of envText.split(/\r?\n/)) {
  const m = line.match(/^([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
  if (m) env[m[1]] = m[2];
}
const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY,
  { auth: { persistSession: false } }
);

const state = {
  concurso_previous: null,
  concurso_id: null,
  inscripciones_ids: [],
  noticias_ids: [],
};

// ============================================
// 1. cms_concurso_ia → guardar estado anterior + actualizar
// ============================================
console.log("=== 1. cms_concurso_ia ===");
const { data: existConcurso } = await supabase
  .from("cms_concurso_ia")
  .select("*")
  .limit(1);

if (existConcurso && existConcurso[0]) {
  state.concurso_previous = existConcurso[0];
  state.concurso_id = existConcurso[0].id;
}

const concursoData = {
  nombre: "Concurso de Becas en Inteligencia Artificial 2026",
  banner_url: "https://picsum.photos/seed/concursoia2026/1600/700",
  introduccion:
    "Convocatoria abierta para estudiantes de Bachillerato General Unificado del Ecuador interesados en formarse en Inteligencia Artificial.\n\n" +
    "El programa cubre 6 meses de formación intensiva con clases virtuales y presenciales, mentoría individual y acceso a herramientas de IA de última generación.\n\n" +
    "Buscamos jóvenes con curiosidad, ganas de aprender y proyectos con impacto social.",
  reglas:
    "BASES DEL CONCURSO\n\n" +
    "REQUISITOS DE PARTICIPACIÓN\n" +
    "• Ser estudiante regular de 1ro, 2do o 3ro de BGU en un colegio del Ecuador.\n" +
    "• Tener entre 15 y 19 años cumplidos al momento de la inscripción.\n" +
    "• Contar con autorización del representante legal.\n" +
    "• Disponer de un dispositivo con acceso a internet para las clases virtuales.\n\n" +
    "PROCESO DE SELECCIÓN\n" +
    "1. Inscripción en línea hasta el 22 de julio de 2026.\n" +
    "2. Revisión documental por parte del equipo organizador.\n" +
    "3. Entrevista virtual con los preseleccionados.\n" +
    "4. Resultados publicados el 5 de agosto de 2026.\n\n" +
    "OBLIGACIONES DE LOS BECARIOS\n" +
    "• Asistir al 90% de las clases y entregar todas las actividades.\n" +
    "• Desarrollar un proyecto final aplicando IA a un problema de su comunidad.",
  fecha_inicio: "2026-06-22",
  fecha_fin: "2026-07-22",
  link_bases: "",
  activo: true,
  updated_at: new Date().toISOString(),
};

if (state.concurso_id) {
  const { error } = await supabase
    .from("cms_concurso_ia")
    .update(concursoData)
    .eq("id", state.concurso_id);
  if (error) console.log("✗ ERROR:", error.message);
  else console.log("✓ cms_concurso_ia actualizado (estado anterior guardado)");
} else {
  const { data: ins, error } = await supabase
    .from("cms_concurso_ia")
    .insert(concursoData)
    .select()
    .single();
  if (error) console.log("✗ ERROR:", error.message);
  else {
    state.concurso_id = ins.id;
    console.log("✓ cms_concurso_ia insertado");
  }
}

// ============================================
// 2. inscripciones_concurso_ia → insertar + guardar IDs
// ============================================
console.log("\n=== 2. inscripciones_concurso_ia ===");
const inscripciones = [
  { nombres_estudiante: "María José Pérez Aguilar", cedula_estudiante: "1758432109", edad: "17", fecha_nacimiento: "2008-04-12", genero: "femenino", colegio: "Unidad Educativa Manuela Cañizares", grado: "2do BGU", ciudad: "Quito", provincia: "Pichincha", correo: "mariajose.perez@gmail.com", whatsapp: "0991234567", nombres_representante: "Carmen Aguilar", cedula_representante: "1707654321", correo_representante: "carmen.aguilar@gmail.com", telefono_representante: "0991234568", motivacion: "Quiero entender cómo se construyen modelos de IA y aplicarlos a salud rural en mi comunidad.", proyecto: "Asistente de diagnóstico básico de salud para zonas con poca cobertura médica." },
  { nombres_estudiante: "Daniel Andrés Vera Cevallos", cedula_estudiante: "1356789012", edad: "16", fecha_nacimiento: "2009-09-25", genero: "masculino", colegio: "Colegio Eloy Alfaro", grado: "1ro BGU", ciudad: "Portoviejo", provincia: "Manabí", correo: "daniel.vera@hotmail.com", whatsapp: "0982345678", nombres_representante: "Luis Vera Macías", cedula_representante: "1305432198", correo_representante: "luis.vera@hotmail.com", telefono_representante: "0982345679", motivacion: "Me apasiona la programación y quiero aplicar IA al sector agrícola de Manabí.", proyecto: "" },
  { nombres_estudiante: "Sofía Valentina Mendoza Torres", cedula_estudiante: "0987654321", edad: "18", fecha_nacimiento: "2007-11-03", genero: "femenino", colegio: "Colegio Liceo Naval", grado: "3ro BGU", ciudad: "Guayaquil", provincia: "Guayas", correo: "sofia.mendoza@outlook.es", whatsapp: "0993456789", nombres_representante: "Patricia Torres", cedula_representante: "0976543210", correo_representante: "patricia.torres@outlook.es", telefono_representante: "0993456790", motivacion: "", proyecto: "Modelo para predecir patrones de inundaciones en zonas costeras." },
  { nombres_estudiante: "Carlos Alberto Reyes Rivadeneira", cedula_estudiante: "1722334455", edad: "17", fecha_nacimiento: "2008-06-18", genero: "masculino", colegio: "Colegio Mejía", grado: "2do BGU", ciudad: "Quito", provincia: "Pichincha", correo: "carlos.reyes@gmail.com", whatsapp: "0964567890", nombres_representante: "Ana Rivadeneira", cedula_representante: "1701122334", correo_representante: "", telefono_representante: "0964567891", motivacion: "Me interesa la robótica y quiero aprender a programar agentes autónomos.", proyecto: "" },
  { nombres_estudiante: "Valentina Carolina Espinoza Loor", cedula_estudiante: "1311223344", edad: "15", fecha_nacimiento: "2010-02-09", genero: "femenino", colegio: "Unidad Educativa Particular Espíritu Santo", grado: "1ro BGU", ciudad: "Manta", provincia: "Manabí", correo: "valentina.espinoza@hotmail.com", whatsapp: "0995678901", nombres_representante: "Roberto Espinoza", cedula_representante: "1306789012", correo_representante: "roberto.espinoza@gmail.com", telefono_representante: "0995678902", motivacion: "Quiero ser la primera ingeniera en IA de mi familia y ayudar a mi colegio.", proyecto: "Chatbot para atención a estudiantes de primaria." },
  { nombres_estudiante: "Andrea Lucía Cabrera Pinto", cedula_estudiante: "0114455667", edad: "16", fecha_nacimiento: "2009-07-21", genero: "femenino", colegio: "Unidad Educativa Borja", grado: "2do BGU", ciudad: "Cuenca", provincia: "Azuay", correo: "andrea.cabrera@gmail.com", whatsapp: "0972345678", nombres_representante: "Diego Cabrera", cedula_representante: "0102334456", correo_representante: "diego.cabrera@gmail.com", telefono_representante: "0972345679", motivacion: "Sueño con desarrollar aplicaciones de IA para enseñar matemáticas a niños.", proyecto: "" },
  { nombres_estudiante: "Mateo Sebastián Villacís Romero", cedula_estudiante: "1799887766", edad: "17", fecha_nacimiento: "2008-12-14", genero: "masculino", colegio: "Colegio Americano de Quito", grado: "3ro BGU", ciudad: "Quito", provincia: "Pichincha", correo: "mateo.villacis@hotmail.com", whatsapp: "0987654321", nombres_representante: "Sandra Romero", cedula_representante: "1709988770", correo_representante: "sandra.romero@gmail.com", telefono_representante: "0987654322", motivacion: "Quiero estudiar IA en la universidad y este programa es un primer paso.", proyecto: "Análisis predictivo de tránsito en Quito usando datos abiertos." },
  { nombres_estudiante: "Lucía Fernanda Macías Zambrano", cedula_estudiante: "1322334455", edad: "16", fecha_nacimiento: "2009-05-30", genero: "femenino", colegio: "Colegio 5 de Junio", grado: "2do BGU", ciudad: "Chone", provincia: "Manabí", correo: "lucia.macias@gmail.com", whatsapp: "0996543210", nombres_representante: "Marta Zambrano", cedula_representante: "1305544332", correo_representante: "", telefono_representante: "0996543211", motivacion: "", proyecto: "" },
  { nombres_estudiante: "Joaquín Eduardo Salazar Pineda", cedula_estudiante: "0701234567", edad: "18", fecha_nacimiento: "2007-08-08", genero: "masculino", colegio: "Colegio Nacional Machala", grado: "3ro BGU", ciudad: "Machala", provincia: "El Oro", correo: "joaquin.salazar@outlook.es", whatsapp: "0986543210", nombres_representante: "Ricardo Salazar", cedula_representante: "0712345678", correo_representante: "ricardo.salazar@gmail.com", telefono_representante: "0986543211", motivacion: "Me interesa cómo la IA puede mejorar la producción bananera de mi provincia.", proyecto: "Detección temprana de enfermedades en cultivos de banano por visión computacional." },
  { nombres_estudiante: "Camila Antonella Bravo Castillo", cedula_estudiante: "1804455667", edad: "17", fecha_nacimiento: "2008-10-02", genero: "prefiero_no_decir", colegio: "Unidad Educativa Ambato", grado: "2do BGU", ciudad: "Ambato", provincia: "Tungurahua", correo: "camila.bravo@gmail.com", whatsapp: "0982223334", nombres_representante: "Beatriz Castillo", cedula_representante: "1803344556", correo_representante: "beatriz.castillo@hotmail.com", telefono_representante: "0982223335", motivacion: "Quiero entender cómo se construyen los modelos de lenguaje y crear uno en kichwa.", proyecto: "Modelo de traducción español-kichwa para preservar el idioma." },
];

const withDates = inscripciones.map((i, idx) => ({
  ...i,
  created_at: new Date(Date.now() - idx * 36 * 3600 * 1000).toISOString(),
  archivo_url: null,
  archivo_nombre: null,
}));

const { data: insIns, error: insErr } = await supabase
  .from("inscripciones_concurso_ia")
  .insert(withDates)
  .select("id");
if (insErr) console.log("✗ ERROR:", insErr.message);
else {
  state.inscripciones_ids = (insIns || []).map((r) => r.id);
  console.log(`✓ ${state.inscripciones_ids.length} inscripciones insertadas`);
}

// ============================================
// 3. cms_noticias → insertar + guardar IDs
// ============================================
console.log("\n=== 3. cms_noticias ===");
const noticias = [
  { orden: 1, titulo: "Lanzamiento del programa de becas en IA", imagen: "https://picsum.photos/seed/noticia1/800/1000", link_opcional: "", fecha: "2026-06-15T10:00:00Z", activo: true },
  { orden: 2, titulo: "Visita a la Asamblea con estudiantes de Manabí", imagen: "https://picsum.photos/seed/noticia2/800/1000", link_opcional: "", fecha: "2026-06-10T15:30:00Z", activo: true },
  { orden: 3, titulo: "Foro de juventud y tecnología en Portoviejo", imagen: "https://picsum.photos/seed/noticia3/800/1000", link_opcional: "https://example.com", fecha: "2026-06-05T09:00:00Z", activo: true },
  { orden: 4, titulo: "Encuentro de mujeres líderes 2026", imagen: "https://picsum.photos/seed/noticia4/800/1000", link_opcional: "", fecha: "2026-05-28T18:00:00Z", activo: true },
];

const noticiasWithUpdate = noticias.map((n) => ({
  ...n,
  updated_at: new Date().toISOString(),
}));

const { data: insNot, error: notErr } = await supabase
  .from("cms_noticias")
  .insert(noticiasWithUpdate)
  .select("id");
if (notErr) console.log("✗ ERROR:", notErr.message);
else {
  state.noticias_ids = (insNot || []).map((r) => r.id);
  console.log(`✓ ${state.noticias_ids.length} noticias insertadas`);
}

// ============================================
// Guardar estado para cleanup
// ============================================
const statePath = resolve(root, "scripts", "_seed_state.json");
writeFileSync(statePath, JSON.stringify(state, null, 2));
console.log(`\n✓ Estado guardado en scripts/_seed_state.json (para cleanup)`);

console.log("\n=========================================");
console.log("✓ DATOS REALISTAS CARGADOS");
console.log("=========================================");
console.log("Visitá:");
console.log("  http://localhost:3000/concurso-ia");
console.log("  http://localhost:3000/");
console.log("  http://localhost:3000/admin (admin123)");
console.log("\nPara borrar todo y restaurar el estado anterior:");
console.log("  node scripts/_clean_test_fase1.mjs");
