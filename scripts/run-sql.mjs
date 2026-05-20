/**
 * Utilidad de desarrollo: ejecuta SQL contra la base de datos Supabase.
 *
 *   node scripts/run-sql.mjs <archivo.sql>      → ejecuta un archivo .sql
 *   node scripts/run-sql.mjs "select 1;"        → ejecuta una consulta suelta
 *
 * Usa DIRECT_URL del .env (conexión directa, puerto 5432).
 * Un archivo con varias sentencias se ejecuta como una única transacción:
 * si una falla, se revierte todo.
 */
import "dotenv/config";
import { readFileSync } from "node:fs";
import pg from "pg";

const arg = process.argv[2];
if (!arg) {
  console.error("Uso: node scripts/run-sql.mjs <archivo.sql | consulta SQL>");
  process.exit(1);
}

const sql = arg.toLowerCase().endsWith(".sql")
  ? readFileSync(arg, "utf8")
  : arg;

const client = new pg.Client({ connectionString: process.env.DIRECT_URL });

try {
  await client.connect();
  const result = await client.query(sql);
  const results = Array.isArray(result) ? result : [result];
  for (const r of results) {
    if (r.rows && r.rows.length) {
      console.table(r.rows);
    } else {
      console.log(`${r.command ?? "OK"} — ${r.rowCount ?? 0} fila(s)`);
    }
  }
  console.log("\n✔ SQL ejecutado correctamente");
} catch (err) {
  console.error("\n‼ Error al ejecutar SQL:\n", err.message);
  process.exitCode = 1;
} finally {
  await client.end();
}
