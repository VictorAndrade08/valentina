#!/usr/bin/env node
// Importa mensajes_buzon_import.csv → tabla mensajes_buzon de Supabase
// Uso: node scripts/import-mensajes.mjs
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const root = resolve(__dirname, "..");

// 1. Leer .env.local manualmente (sin dotenv)
const envText = readFileSync(resolve(root, ".env.local"), "utf8");
const env = {};
for (const line of envText.split(/\r?\n/)) {
  const m = line.match(/^([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
  if (m) env[m[1]] = m[2];
}
const URL = env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;
if (!URL || !KEY) {
  console.error("ERROR: faltan NEXT_PUBLIC_SUPABASE_URL o NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY en .env.local");
  process.exit(1);
}

// 2. Parser CSV (formato QUOTE_ALL: todos los campos van entre comillas, "" escapa una comilla)
function parseCsv(text) {
  const rows = [];
  let row = [];
  let cur = "";
  let inQuotes = false;
  let i = 0;
  while (i < text.length) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"' && text[i + 1] === '"') {
        cur += '"';
        i += 2;
      } else if (ch === '"') {
        inQuotes = false;
        i++;
      } else {
        cur += ch;
        i++;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
        i++;
      } else if (ch === ",") {
        row.push(cur);
        cur = "";
        i++;
      } else if (ch === "\n" || ch === "\r") {
        if (ch === "\r" && text[i + 1] === "\n") i++;
        row.push(cur);
        rows.push(row);
        row = [];
        cur = "";
        i++;
      } else {
        cur += ch;
        i++;
      }
    }
  }
  if (cur !== "" || row.length > 0) {
    row.push(cur);
    rows.push(row);
  }
  return rows;
}

// 3. Leer y parsear CSV
const csvText = readFileSync(resolve(root, "mensajes_buzon_import.csv"), "utf8");
const rows = parseCsv(csvText).filter((r) => r.length > 1);
const headers = rows[0];
const dataRows = rows.slice(1);

console.log(`Encabezados detectados: ${headers.join(", ")}`);
console.log(`Filas a importar:       ${dataRows.length}`);

const idx = (name) => headers.indexOf(name);
const records = dataRows.map((r) => ({
  created_at: r[idx("created_at")] || null,
  nombre: r[idx("nombre")] || "",
  canton: r[idx("canton")] || "",
  correo: r[idx("correo")] || "",
  whatsapp: r[idx("whatsapp")] || "",
  asunto: r[idx("asunto")] || "",
  mensaje: r[idx("mensaje")] || "",
  archivo_url: r[idx("archivo_url")] || null,
  archivo_nombre: r[idx("archivo_nombre")] || null,
})).filter((r) => r.nombre || r.asunto || r.mensaje);

console.log(`Registros válidos:      ${records.length}`);

// 4. Crear cliente Supabase
const supabase = createClient(URL, KEY, { auth: { persistSession: false } });

// 5. Confirmar contenido actual de la tabla antes de insertar
const { count: countAntes, error: countError } = await supabase
  .from("mensajes_buzon")
  .select("*", { count: "exact", head: true });

if (countError) {
  console.error("ERROR consultando mensajes_buzon:", countError.message);
  process.exit(1);
}

console.log(`\nMensajes existentes en Supabase: ${countAntes ?? 0}`);

if ((countAntes ?? 0) > 0) {
  console.log("\n⚠️  Ya existen mensajes en la tabla. Si continúo, se DUPLICARÁN.");
  console.log("    Para abortar: Ctrl+C ahora mismo.");
  console.log("    Para continuar: el script proseguirá en 5 segundos...");
  await new Promise((r) => setTimeout(r, 5000));
}

// 6. Insertar en lotes de 50
const BATCH = 50;
let insertados = 0;
let errores = 0;

for (let i = 0; i < records.length; i += BATCH) {
  const chunk = records.slice(i, i + BATCH);
  const { error } = await supabase.from("mensajes_buzon").insert(chunk);
  if (error) {
    errores += chunk.length;
    console.error(`  ✗ Lote ${i / BATCH + 1}: ${error.message}`);
  } else {
    insertados += chunk.length;
    console.log(`  ✓ Lote ${i / BATCH + 1}: ${chunk.length} mensajes insertados (acumulado ${insertados})`);
  }
}

// 7. Resumen final
const { count: countDespues } = await supabase
  .from("mensajes_buzon")
  .select("*", { count: "exact", head: true });

console.log("\n=================================================");
console.log(`✓ Insertados: ${insertados}`);
console.log(`✗ Con error:  ${errores}`);
console.log(`Total ahora en Supabase: ${countDespues ?? "?"}`);
console.log("=================================================");
process.exit(errores > 0 ? 2 : 0);
