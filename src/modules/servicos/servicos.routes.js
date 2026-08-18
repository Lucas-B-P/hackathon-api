import { Router } from "express"
import { pool } from "../../database/pool.js"
import { requireAuth } from "../../middlewares/auth.js"
const router = Router()
router.use(requireAuth)
router.get("/", async (_request, response, next) => {
  try {
    const result = await pool.query(
      "SELECT id, name, description, duration_minutes, price, active FROM services ORDER BY name",
    )
    response.json({ data: result.rows })
  } catch (error) {
    next(error)
  }
})
router.patch("/:id", async (request, response, next) => {
  try {
    const result = await pool.query(
      "UPDATE services SET name = COALESCE($1,name), description = COALESCE($2,description), duration_minutes = COALESCE($3,duration_minutes), price = COALESCE($4,price), active = COALESCE($5,active), updated_at = NOW() WHERE id = $6 RETURNING *",
      [
        request.body.name,
        request.body.description,
        request.body.durationMinutes,
        request.body.price,
        request.body.active,
        request.params.id,
      ],
    )
    if (!result.rows[0])
      return response
        .status(404)
        .json({ error: { message: "Serviço não encontrado" } })
    response.json(result.rows[0])
  } catch (error) {
    next(error)
  }
})
export default router
