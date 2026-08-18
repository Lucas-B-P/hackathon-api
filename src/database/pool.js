import { DatabaseSync } from "node:sqlite"
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const root = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../data",
)
fs.mkdirSync(root, { recursive: true })
const database = new DatabaseSync(path.join(root, "patinhas.db"))
database.exec("PRAGMA foreign_keys = ON; PRAGMA journal_mode = WAL;")

function adaptSql(sql) {
  return sql
    .replace(/ALTER TABLE appointments (DROP|ADD) CONSTRAINT[\s\S]*/i, "")
    .replace(/([a-zA-Z_][a-zA-Z0-9_.]*)::date/g, "date($1)")
    .replace(/\$([0-9]+)(?=\s|[,)]|$)/g, ":p$1")
    .replace(/::[a-zA-Z0-9_]+(?:\([^)]*\))?/g, "")
    .replace(/\bBIGSERIAL\b/g, "INTEGER")
    .replace(/\bTIMESTAMPTZ\b/g, "TEXT")
    .replace(/\bJSONB\b/g, "TEXT")
    .replace(/NOW\(\)/g, "CURRENT_TIMESTAMP")
    .replace(/\bILIKE\b/g, "LIKE")
    .replace(/FOR UPDATE\b/g, "")
    .replace(/ADD COLUMN IF NOT EXISTS/g, "ADD COLUMN")
    .replace(/\bTRUE\b/g, "1")
    .replace(/\bFALSE\b/g, "0")
}
function paramsObject(params = []) {
  return Object.fromEntries(
    params.map((value, index) => [`:p${index + 1}`, value]),
  )
}
function query(sql, params = []) {
  const statements = sql
    .split(";")
    .map((part) => part.trim())
    .filter(Boolean)
  if (statements.length > 1) {
    let rows = []
    let rowCount = 0
    for (const statement of statements) {
      const result = query(statement, params)
      rows = result.rows
      rowCount += result.rowCount
    }
    return { rows, rowCount }
  }
  const adapted = adaptSql(sql).trim()
  if (!adapted) return { rows: [], rowCount: 0 }
  const statement = database.prepare(adapted)
  const values = paramsObject(params)
  if (/^\s*(SELECT|PRAGMA|WITH)\b/i.test(sql) || /\bRETURNING\b/i.test(sql)) {
    const rows = statement.all(values)
    return { rows, rowCount: rows.length }
  }
  const result = statement.run(values)
  return { rows: [], rowCount: Number(result.changes ?? 0) }
}
export const pool = {
  query,
  async connect() {
    return { query, release() {} }
  },
  async end() {
    database.close()
  },
}
