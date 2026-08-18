import { pool } from "../../database/pool.js"

export async function listClientes() {
  const result = await pool.query(
    `SELECT u.id, u.name AS nome, u.email, COALESCE(u.phone, '') AS telefone, CASE WHEN u.status = 'active' THEN 'Ativo' ELSE 'Inativo' END AS status, COUNT(DISTINCT p.id)::int AS pets, MAX(o.created_at) AS ultima_compra, MAX(a.starts_at) AS ultimo_atendimento FROM users u LEFT JOIN pets p ON p.owner_id = u.id LEFT JOIN orders o ON o.owner_id = u.id AND o.status <> 'Cancelado' LEFT JOIN appointments a ON a.owner_id = u.id WHERE u.role = 'cliente' GROUP BY u.id ORDER BY u.name`,
  )
  return result.rows.map((item) => ({
    ...item,
    ultimaCompra: item.ultima_compra
      ? new Date(item.ultima_compra).toLocaleDateString("pt-BR")
      : "Nenhuma",
    ultimoAtendimento: item.ultimo_atendimento
      ? new Date(item.ultimo_atendimento).toLocaleDateString("pt-BR")
      : "Nenhum",
  }))
}
