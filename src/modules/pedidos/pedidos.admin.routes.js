import { Router } from "express"
import { requireAuth } from "../../middlewares/auth.js"
import { pool } from "../../database/pool.js"
import { createNotification } from "../notificacoes/notificacoes.service.js"
const router = Router()
router.use(requireAuth)
router.get("/", async (_request, response, next) => {
  try {
    const result = await pool.query(
      "SELECT o.id, o.status, o.total, o.payment_method, o.created_at, u.name AS customer, COALESCE(string_agg(i.product_name, ', ' ORDER BY i.id), '') AS products FROM orders o JOIN users u ON u.id = o.owner_id LEFT JOIN order_items i ON i.order_id = o.id WHERE o.notes IS DISTINCT FROM 'Venda realizada no PDV' GROUP BY o.id, u.name ORDER BY o.created_at DESC",
    )
    response.json({ data: result.rows })
  } catch (error) {
    next(error)
  }
})
router.patch("/:id/status", async (request, response, next) => {
  try {
    const allowed = [
      "Recebido",
      "Em preparacao",
      "Pronto",
      "Saiu para entrega",
      "Entregue",
      "Cancelado",
    ]
    if (!allowed.includes(request.body.status))
      return response
        .status(400)
        .json({ error: { message: "Status inválido" } })
    const result = await pool.query(
      "UPDATE orders SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING id, owner_id, status, total, created_at",
      [request.body.status, request.params.id],
    )
    if (!result.rows[0])
      return response
        .status(404)
        .json({ error: { message: "Pedido não encontrado" } })
    const order = result.rows[0]
    const label =
      request.body.status === "Entregue"
        ? "Pedido finalizado"
        : `Pedido ${request.body.status}`
    await createNotification(
      order.owner_id,
      "pedido",
      label,
      `O status do pedido #${order.id} foi atualizado.`,
    )
    response.json(order)
  } catch (error) {
    next(error)
  }
})
export default router
