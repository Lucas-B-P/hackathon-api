import { Router } from "express"
import { pool } from "../../database/pool.js"
import { requireAuth } from "../../middlewares/auth.js"
const router = Router()
router.use(requireAuth)
router.get("/", async (_request, response, next) => {
  try {
    const [entries, revenue] = await Promise.all([
      pool.query(
        "SELECT id, type, description, category, amount, due_date, status, payment_method FROM financial_entries ORDER BY due_date DESC",
      ),
      pool.query(
        "SELECT strftime('%m/%Y', created_at) AS month, COALESCE(SUM(total),0) AS revenue FROM orders WHERE status <> 'Cancelado' AND datetime(created_at) >= datetime('now', '-5 months', 'start of month') GROUP BY strftime('%Y-%m', created_at) ORDER BY strftime('%Y-%m', created_at)",
      ),
    ])
    const receives = entries.rows.filter((item) => item.type === "RECEBER")
    const pays = entries.rows.filter((item) => item.type === "PAGAR")
    const monthRevenue = revenue.rows.at(-1)?.revenue ?? 0
    const expenses = pays
      .filter((item) => item.status === "Pago")
      .reduce((sum, item) => sum + Number(item.amount), 0)
    response.json({
      data: {
        entries: entries.rows,
        revenue: revenue.rows,
        summary: {
          revenue: Number(monthRevenue),
          expenses,
          profit: Number(monthRevenue) - expenses,
          receivable: receives
            .filter((item) => item.status === "Pendente")
            .reduce((sum, item) => sum + Number(item.amount), 0),
          payable: pays
            .filter((item) => item.status === "Pendente")
            .reduce((sum, item) => sum + Number(item.amount), 0),
        },
      },
    })
  } catch (error) {
    next(error)
  }
})
router.post("/", async (request, response, next) => {
  try {
    const {
      type,
      description,
      category,
      amount,
      dueDate,
      status,
      paymentMethod,
    } = request.body
    const result = await pool.query(
      "INSERT INTO financial_entries (type, description, category, amount, due_date, status, payment_method) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *",
      [
        type,
        description,
        category,
        amount,
        dueDate,
        status ?? "Pendente",
        paymentMethod ?? null,
      ],
    )
    response.status(201).json(result.rows[0])
  } catch (error) {
    next(error)
  }
})
export default router
