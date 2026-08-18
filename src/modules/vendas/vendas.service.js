import { pool } from "../../database/pool.js"

export async function createSale(userId, data) {
  const items = Array.isArray(data?.itens) ? data.itens : []
  if (!items.length) {
    const error = new Error("Adicione itens à venda.")
    error.statusCode = 400
    throw error
  }
  const client = await pool.connect()
  try {
    await client.query("BEGIN")
    const normalized = new Map()
    for (const item of items) {
      const id = Number(item.produtoId)
      const quantity = Number(item.quantidade)
      if (
        !Number.isInteger(id) ||
        !Number.isInteger(quantity) ||
        quantity <= 0
      ) {
        const error = new Error("Itens da venda inválidos.")
        error.statusCode = 400
        throw error
      }
      normalized.set(id, (normalized.get(id) ?? 0) + quantity)
    }
    let total = 0
    const rows = []
    for (const [id, quantity] of normalized) {
      const result = await client.query(
        "SELECT id, name, stock, sale_price FROM products WHERE id = $1 AND active = TRUE FOR UPDATE",
        [id],
      )
      const product = result.rows[0]
      if (!product) {
        const error = new Error("Produto não encontrado.")
        error.statusCode = 404
        throw error
      }
      if (product.stock < quantity) {
        const error = new Error(`Estoque insuficiente para ${product.name}.`)
        error.statusCode = 409
        throw error
      }
      const subtotal = Number(product.sale_price) * quantity
      total += subtotal
      rows.push({ product, quantity, subtotal })
    }
    const sale = (
      await client.query(
        "INSERT INTO orders (owner_id, status, total, payment_method, notes) VALUES ($1, 'Entregue', $2, $3, $4) RETURNING id, status, total, payment_method, created_at",
        [userId, total, data.formaPagamento ?? null, "Venda realizada no PDV"],
      )
    ).rows[0]
    for (const row of rows) {
      await client.query(
        "INSERT INTO order_items (order_id, product_id, product_name, quantity, unit_price, subtotal) VALUES ($1,$2,$3,$4,$5,$6)",
        [
          sale.id,
          row.product.id,
          row.product.name,
          row.quantity,
          row.product.sale_price,
          row.subtotal,
        ],
      )
      await client.query(
        "UPDATE products SET stock = stock - $1, updated_at = NOW() WHERE id = $2",
        [row.quantity, row.product.id],
      )
      await client.query(
        "INSERT INTO stock_movements (product_id, order_id, type, quantity, reason) VALUES ($1,$2,'SAIDA',$3,'Venda no PDV')",
        [row.product.id, sale.id, row.quantity],
      )
    }
    await client.query("COMMIT")
    return sale
  } catch (error) {
    await client.query("ROLLBACK")
    throw error
  } finally {
    client.release()
  }
}
export async function listSales() {
  const result = await pool.query(
    "SELECT o.id, o.status, o.total, o.payment_method, o.created_at, COALESCE(string_agg(i.product_name, ', ' ORDER BY i.id), '') AS products FROM orders o LEFT JOIN order_items i ON i.order_id = o.id WHERE o.notes = 'Venda realizada no PDV' GROUP BY o.id ORDER BY o.created_at DESC LIMIT 100",
  )
  return result.rows
}
