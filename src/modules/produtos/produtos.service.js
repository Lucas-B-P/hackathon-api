import { pool } from "../../database/pool.js"
export async function listStoreProducts(query = {}) {
  const values = []
  const filters = ["active = TRUE"]
  if (query.q) {
    values.push(`%${query.q}%`)
    filters.push(
      `(name ILIKE $${values.length} OR sku ILIKE $${values.length})`,
    )
  }
  if (query.categoria) {
    values.push(query.categoria)
    filters.push(`category = $${values.length}`)
  }
  const result = await pool.query(
    `SELECT id, name, sku, category, stock, sale_price, icon, image_url FROM products WHERE ${filters.join(" AND ")} ORDER BY name`,
    values,
  )
  return result.rows
}
export async function listCategories() {
  const result = await pool.query(
    "SELECT DISTINCT category FROM products WHERE active = TRUE ORDER BY category",
  )
  return result.rows.map((row) => row.category)
}
export async function getStoreProduct(id) {
  const result = await pool.query(
    "SELECT id, name, sku, category, stock, sale_price, icon, image_url FROM products WHERE id = $1 AND active = TRUE",
    [id],
  )
  return result.rows[0]
}
export async function listAdminProducts() {
  const result = await pool.query(
    "SELECT id, name, sku, category, stock, minimum_stock, cost, sale_price, icon, image_url, active, created_at, updated_at FROM products ORDER BY name",
  )
  return result.rows
}
export async function updateAdminProduct(id, data) {
  const result = await pool.query(
    "UPDATE products SET name = COALESCE($1,name), category = COALESCE($2,category), stock = COALESCE($3,stock), minimum_stock = COALESCE($4,minimum_stock), cost = COALESCE($5,cost), sale_price = COALESCE($6,sale_price), active = COALESCE($7,active), updated_at = NOW() WHERE id = $8 RETURNING *",
    [
      data.name,
      data.category,
      data.stock,
      data.minimumStock,
      data.cost,
      data.salePrice,
      data.active,
      id,
    ],
  )
  return result.rows[0]
}

export async function createAdminProduct(data) {
  if (!data.name?.trim() || !data.sku?.trim() || !data.category?.trim()) {
    const error = new Error("Nome, SKU e categoria são obrigatórios")
    error.statusCode = 400
    throw error
  }
  const result = await pool.query(
    `INSERT INTO products (name, sku, category, stock, minimum_stock, cost, sale_price, icon, image_url, active)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
    [data.name.trim(), data.sku.trim(), data.category.trim(), Number(data.stock ?? 0), Number(data.minimumStock ?? 0), Number(data.cost ?? 0), Number(data.salePrice ?? 0), data.icon ?? null, data.imageUrl ?? null, data.active ?? true],
  )
  return result.rows[0]
}
