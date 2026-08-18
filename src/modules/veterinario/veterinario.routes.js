import { Router } from "express"
import { pool } from "../../database/pool.js"
import { requireAuth } from "../../middlewares/auth.js"
const router = Router()
router.use(requireAuth)
const grooming = [
  "Banho",
  "Tosa",
  "Banho + Tosa",
  "Tosa Higienica",
  "Corte de Unhas",
]
router.get("/", async (_request, response, next) => {
  try {
    const result = await pool.query(
      "SELECT a.id, a.status, a.starts_at, a.notes, p.name AS pet, u.name AS tutor, s.name AS type, 'Equipe Veterinária' AS veterinarian FROM appointments a JOIN pets p ON p.id = a.pet_id JOIN users u ON u.id = a.owner_id JOIN services s ON s.id = a.service_id WHERE date(a.starts_at) = date('now') AND s.name NOT IN ('Banho','Tosa','Banho + Tosa','Tosa Higienica','Corte de Unhas') AND a.status <> 'Cancelado' ORDER BY a.starts_at",
    )
    response.json({ data: result.rows })
  } catch (error) {
    next(error)
  }
})
router.post("/", async (request, response, next) => {
  try {
    const { ownerId, petId, serviceId, startsAt, notes } = request.body
    const result = await pool.query(
      "INSERT INTO appointments (owner_id, pet_id, service_id, starts_at, notes) SELECT $1,$2,$3,$4,$5 WHERE EXISTS (SELECT 1 FROM pets WHERE id = $2 AND owner_id = $1) RETURNING id, status, starts_at, notes",
      [ownerId, petId, serviceId, startsAt, notes ?? null],
    )
    if (!result.rows[0])
      return response
        .status(400)
        .json({ error: { message: "Tutor ou pet inválido" } })
    response.status(201).json(result.rows[0])
  } catch (error) {
    next(error)
  }
})
router.patch("/:id/status", async (request, response, next) => {
  try {
    const result = await pool.query(
      "UPDATE appointments SET status = $1 WHERE id = $2 RETURNING id, status, notes",
      [request.body.status, request.params.id],
    )
    response.json(result.rows[0])
  } catch (error) {
    next(error)
  }
})
export default router
