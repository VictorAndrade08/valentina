#!/usr/bin/env node
// Limpia los datos cargados por _seed_test_fase1.mjs usando los IDs guardados.
// Restaura cms_concurso_ia a su estado previo al seed.
import { createClient } from "@supabase/supabase-js";
import { readFileSync, existsSync, unlinkSync } from "node:fs";
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

const statePath = resolve(root, "scripts", "_seed_state.json");

if (!existsSync(statePath)) {
  console.log("No hay datos de seed para limpiar (no existe _seed_state.json).");
  console.log("Si tenés datos viejos con [TEST] o @test.com, corré la versión anterior del script.");
  process.exit(0);
}

const state = JSON.parse(readFileSync(statePath, "utf8"));

console.log("=== Limpiando datos de seed ===\n");

// 1. Borrar inscripciones por ID
if (state.inscripciones_ids?.length > 0) {
  const r = await supabase
    .from("inscripciones_concurso_ia")
    .delete()
    .in("id", state.inscripciones_ids)
    .select("id");
  console.log(`✓ inscripciones_concurso_ia: ${r.data?.length ?? 0} borradas`);
}

// 2. Borrar noticias por ID
if (state.noticias_ids?.length > 0) {
  const r = await supabase
    .from("cms_noticias")
    .delete()
    .in("id", state.noticias_ids)
    .select("id");
  console.log(`✓ cms_noticias: ${r.data?.length ?? 0} borradas`);
}

// 3. Restaurar cms_concurso_ia al estado previo
if (state.concurso_previous && state.concurso_id) {
  const prev = state.concurso_previous;
  const restore = {
    nombre: prev.nombre,
    banner_url: prev.banner_url,
    introduccion: prev.introduccion,
    reglas: prev.reglas,
    fecha_inicio: prev.fecha_inicio,
    fecha_fin: prev.fecha_fin,
    link_bases: prev.link_bases,
    activo: prev.activo,
    updated_at: prev.updated_at,
  };
  const r = await supabase
    .from("cms_concurso_ia")
    .update(restore)
    .eq("id", state.concurso_id)
    .select("id");
  console.log(`✓ cms_concurso_ia: ${r.data?.length ?? 0} restaurada al estado previo`);
}

unlinkSync(statePath);
console.log("\n✓ Limpieza completa. Base de datos en su estado previo al seed.");
