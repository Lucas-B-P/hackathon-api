import { Router } from "express"
import { pool } from "../../database/pool.js"
import { requireAuth } from "../../middlewares/auth.js"
const router = Router()
router.use(requireAuth)
router.get("/", async (_request, response, next) => {
  try {
    const result = await pool.query(
      "SELECT id, name, email, phone, role, status, created_at FROM users WHERE role <> 'cliente' ORDER BY name",
    )
    response.json({ data: result.rows })
  } catch (error) {
    next(error)
  }
})
router.patch("/:id/status", async (request, response, next) => {
  try {
    const result = await pool.query(
      "UPDATE users SET status = $1, updated_at = NOW() WHERE id = $2 AND role <> 'cliente' RETURNING id, name, email, phone, role, status",
      [request.body.status, request.params.id],
    )
    response.json(result.rows[0])
  } catch (error) {
    next(error)
  }
})
export default router
