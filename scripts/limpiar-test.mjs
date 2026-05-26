#!/usr/bin/env node
// Borra mensajes de prueba del buzón (los que tienen "asdfasdf" en el contenido)
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const root = resolve(__dirname, "..");

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

// Buscar candidatos a borrar
console.log("Buscando mensajes de prueba...\n");

const { data: candidatos, error: searchError } = await supabase
  .from("mensajes_buzon")
  .select("id, created_at, nombre, asunto, mensaje")
  .or("asunto.ilike.%asdfasdf%,mensaje.ilike.%asdfasdf%,nombre.ilike.%asdfasdf%");

if (searchError) {
  console.error("ERROR buscando:", searchError.message);
  process.exit(1);
}

if (!candidatos || candidatos.length === 0) {
  console.log("No hay mensajes de prueba para borrar.");
  process.exit(0);
}

console.log(`Encontrados ${candidatos.length} mensaje(s) de prueba:\n`);
candidatos.forEach((m, i) => {
  console.log(`  ${i + 1}. [${new Date(m.created_at).toLocaleDateString()}] ${m.nombre} — "${m.asunto}"`);
  console.log(`     Mensaje: ${m.mensaje?.slice(0, 60)}${m.mensaje?.length > 60 ? "..." : ""}\n`);
});

console.log("Borrando en 3 segundos... (Ctrl+C para abortar)\n");
await new Promise((r) => setTimeout(r, 3000));

const ids = candidatos.map((c) => c.id);
const { error: delError } = await supabase
  .from("mensajes_buzon")
  .delete()
  .in("id", ids);

if (delError) {
  console.error("ERROR borrando:", delError.message);
  process.exit(1);
}

const { count: countDespues } = await supabase
  .from("mensajes_buzon")
  .select("*", { count: "exact", head: true });

console.log("=================================================");
console.log(`✓ Borrados:                ${candidatos.length}`);
console.log(`Total ahora en Supabase:   ${countDespues ?? "?"}`);
console.log("=================================================");
