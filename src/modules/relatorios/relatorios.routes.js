import { Router } from "express"
import { pool } from "../../database/pool.js"
import { requireAuth } from "../../middlewares/auth.js"
const router = Router()
router.use(requireAuth)
router.get("/", async (_request, response, next) => {
  try {
    const [revenue, services] = await Promise.all([
      pool.query(
        "SELECT strftime('%m/%Y', created_at) AS month, COALESCE(SUM(total),0) AS revenue FROM orders WHERE status <> 'Cancelado' AND datetime(created_at) >= datetime('now', '-5 months', 'start of month') GROUP BY strftime('%Y-%m', created_at) ORDER BY strftime('%Y-%m', created_at)",
      ),
      pool.query(
        "SELECT s.name, COUNT(a.id) AS value FROM services s LEFT JOIN appointments a ON a.service_id = s.id AND a.status <> 'Cancelado' GROUP BY s.id, s.name ORDER BY value DESC",
      ),
    ])
    response.json({
      data: {
        revenue: revenue.rows.map((item) => ({
          mes: item.month,
          receita: Number(item.revenue),
          despesas: 0,
        })),
        services: services.rows,
      },
    })
  } catch (error) {
    next(error)
  }
})
export default router
