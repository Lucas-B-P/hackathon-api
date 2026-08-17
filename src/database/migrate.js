import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { pool } from "./pool.js";

const migrationsDir = path.dirname(fileURLToPath(import.meta.url));
const migrationFiles = ["001_initial.sql", "002_auth.sql", "003_profile.sql", "004_pets.sql"];

try {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        version TEXT PRIMARY KEY,
        applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    for (const version of migrationFiles) {
      const { rowCount } = await client.query(
        "SELECT 1 FROM schema_migrations WHERE version = $1",
        [version],
      );
      if (rowCount > 0) continue;

      const sql = await readFile(path.join(migrationsDir, "migrations", version), "utf8");
      await client.query(sql);
      await client.query("INSERT INTO schema_migrations (version) VALUES ($1)", [version]);
      console.log(`Migration aplicada: ${version}`);
    }

    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
} catch (error) {
  console.error("Falha ao executar migrations", error);
  process.exitCode = 1;
} finally {
  await pool.end();
}
