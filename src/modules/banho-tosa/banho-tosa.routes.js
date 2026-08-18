import { Router } from "express"
import { pool } from "../../database/pool.js"
import { requireAuth } from "../../middlewares/auth.js"
const router = Router()
router.use(requireAuth)
router.get("/", async (_request, response, next) => {
  try {
    const result = await pool.query(
      "SELECT a.id, a.status, a.starts_at, a.notes, p.name AS pet, u.name AS tutor, s.name AS service, 'Equipe Patinhas' AS employee FROM appointments a JOIN pets p ON p.id = a.pet_id JOIN users u ON u.id = a.owner_id JOIN services s ON s.id = a.service_id WHERE date(a.starts_at) = date('now') AND s.name IN ('Banho','Tosa','Banho + Tosa','Tosa Higienica','Corte de Unhas') AND a.status <> 'Cancelado' ORDER BY a.starts_at",
    )
    response.json({ data: result.rows })
  } catch (error) {
    next(error)
  }
})
router.patch("/:id/status", async (request, response, next) => {
  try {
    const allowed = [
      "Agendado",
      "Recepcionado",
      "Em atendimento",
      "Finalizado",
      "Entregue",
    ]
    if (!allowed.includes(request.body.status))
      return response.status(400).json({ error: { message: "Etapa inválida" } })
    const result = await pool.query(
      "UPDATE appointments SET status = $1 WHERE id = $2 RETURNING id, status, notes",
      [request.body.status, request.params.id],
    )
    if (!result.rows[0])
      return response
        .status(404)
        .json({ error: { message: "Atendimento não encontrado" } })
    response.json(result.rows[0])
  } catch (error) {
    next(error)
  }
})
router.patch("/:id/observacoes", async (request, response, next) => {
  try {
    const result = await pool.query(
      "UPDATE appointments SET notes = $1 WHERE id = $2 RETURNING id, status, notes",
      [request.body.notes ?? "", request.params.id],
    )
    response.json(result.rows[0])
  } catch (error) {
    next(error)
  }
})
export default router
