import { Router } from "express"
import { pool } from "../../database/pool.js"
import { requireAuth } from "../../middlewares/auth.js"
const router = Router()
router.use(requireAuth)
router.get("/", async (_request, response, next) => {
  try {
    const result = await pool.query(
      "SELECT p.id, p.name, p.species, p.breed, p.sex, p.birth_date, p.weight, p.photo_url, u.name AS tutor FROM pets p JOIN users u ON u.id = p.owner_id ORDER BY p.name",
    )
    response.json({ data: result.rows })
  } catch (error) {
    next(error)
  }
})
export default router
