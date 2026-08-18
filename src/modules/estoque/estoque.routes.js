import { Router } from "express"
import { pool } from "../../database/pool.js"
import { requireAuth } from "../../middlewares/auth.js"
const router = Router()
router.use(requireAuth)
router.get("/", async (_request, response, next) => {
  try {
    const [products, movements] = await Promise.all([
      pool.query(
        "SELECT id, name, sku, stock, minimum_stock, cost FROM products ORDER BY name",
      ),
      pool.query(
        "SELECT m.id, p.name AS product, m.type, CASE WHEN m.type = 'SAIDA' THEN -m.quantity ELSE m.quantity END AS quantity, m.reason, m.created_at FROM stock_movements m JOIN products p ON p.id = m.product_id ORDER BY m.created_at DESC LIMIT 100",
      ),
    ])
    const rows = products.rows
    response.json({
      data: {
        products: rows,
        movements: movements.rows,
        summary: {
          total: rows.reduce((sum, item) => sum + item.stock, 0),
          low: rows.filter(
            (item) => item.stock > 0 && item.stock <= item.minimum_stock,
          ).length,
          zero: rows.filter((item) => item.stock === 0).length,
          value: rows.reduce(
            (sum, item) => sum + Number(item.stock) * Number(item.cost),
            0,
          ),
        },
      },
    })
  } catch (error) {
    next(error)
  }
})
router.post("/movimentacoes", async (request, response, next) => {
  try {
    const { productId, type, quantity, reason } = request.body
    const amount = Number(quantity)
    if (!productId || !["ENTRADA", "SAIDA", "AJUSTE"].includes(type) || !Number.isInteger(amount) || amount <= 0) {
      return response.status(400).json({ error: { message: "Produto, tipo e quantidade válida são obrigatórios" } })
    }
    const product = await pool.query("SELECT id, stock FROM products WHERE id = $1", [productId])
    if (!product.rows[0]) return response.status(404).json({ error: { message: "Produto não encontrado" } })
    const current = Number(product.rows[0].stock)
    const nextStock = type === "ENTRADA" ? current + amount : type === "SAIDA" ? current - amount : amount
    if (nextStock < 0) return response.status(409).json({ error: { message: "A movimentação deixaria o estoque negativo" } })
    await pool.query("UPDATE products SET stock = $1, updated_at = NOW() WHERE id = $2", [nextStock, productId])
    const result = await pool.query("INSERT INTO stock_movements (product_id, type, quantity, reason) VALUES ($1,$2,$3,$4) RETURNING *", [productId, type, amount, reason?.trim() || null])
    response.status(201).json({ data: result.rows[0] })
  } catch (error) { next(error) }
})
export default router
