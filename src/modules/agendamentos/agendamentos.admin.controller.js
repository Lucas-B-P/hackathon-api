import { pool } from "../../database/pool.js"
export async function listAdmin(request, response, next) {
  try {
    const date = request.query.data || new Date().toISOString().slice(0, 10)
    const result = await pool.query(
      "SELECT a.id, strftime('%H:%M', a.starts_at) AS horario, a.status, p.name AS pet, s.name AS servico, u.name AS tutor, 'Equipe Patinhas' AS funcionario FROM appointments a JOIN pets p ON p.id = a.pet_id JOIN services s ON s.id = a.service_id JOIN users u ON u.id = a.owner_id WHERE date(a.starts_at) = $1 ORDER BY a.starts_at",
      [date],
    )
    response.json({ data: result.rows })
  } catch (error) {
    next(error)
  }
}
