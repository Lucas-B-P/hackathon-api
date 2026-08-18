import { readFile } from "node:fs/promises"
import { fileURLToPath } from "node:url"
import path from "node:path"
import { pool } from "./pool.js"

const migrationsDir = path.dirname(fileURLToPath(import.meta.url))
const migrationFiles = [
  "001_initial.sql",
  "002_auth.sql",
  "003_profile.sql",
  "004_pets.sql",
  "005_pet_history.sql",
  "006_appointments.sql",
  "007_service_catalog.sql",
  "008_orders.sql",
  "009_products.sql",
  "010_product_accents.sql",
  "011_stock_movements.sql",
  "012_notifications.sql",
  "014_grooming_status.sql",
  "015_veterinary_services.sql",
  "016_finance.sql",
  "017_settings.sql",
  "018_catalog_products.sql",
  "019_default_users.sql",
  "020_fix_default_password.sql",
  "021_reset_default_password.sql",
]

try {
  const client = await pool.connect()
  try {
    await client.query("BEGIN")
    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        version TEXT PRIMARY KEY,
        applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `)

    for (const version of migrationFiles) {
      const { rowCount } = await client.query(
        "SELECT 1 FROM schema_migrations WHERE version = $1",
        [version],
      )
      if (rowCount > 0) continue

      const sql = await readFile(
        path.join(migrationsDir, "migrations", version),
        "utf8",
      )
      await client.query(sql)
      await client.query(
        "INSERT INTO schema_migrations (version) VALUES ($1)",
        [version],
      )
      console.log(`Migration aplicada: ${version}`)
    }

    await client.query("COMMIT")
  } catch (error) {
    await client.query("ROLLBACK")
    throw error
  } finally {
    client.release()
  }
} catch (error) {
  console.error("Falha ao executar migrations", error)
  process.exitCode = 1
} finally {
  await pool.end()
}
