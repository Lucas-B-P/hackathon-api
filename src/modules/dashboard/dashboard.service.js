import { pool } from "../../database/pool.js"

export async function getAdminDashboard() {
  const [
    today,
    todaySales,
    month,
    clients,
    lowStock,
    revenue,
    categories,
    agenda,
    receivable,
  ] = await Promise.all([
    pool.query(
      "SELECT COUNT(*) AS total, COALESCE(SUM(CASE WHEN status IN ('Em atendimento','Confirmado') THEN 1 ELSE 0 END), 0) AS active FROM appointments WHERE date(starts_at) = date('now') AND status <> 'Cancelado'",
    ),
    pool.query(
      "SELECT COALESCE(SUM(total), 0) AS total FROM orders WHERE status <> 'Cancelado' AND date(created_at) = date('now')",
    ),
    pool.query(
      "SELECT COALESCE(SUM(total), 0) AS total FROM orders WHERE status <> 'Cancelado' AND datetime(created_at) >= datetime('now', 'start of month')",
    ),
    pool.query(
      "SELECT COUNT(*) AS total, SUM(CASE WHEN datetime(created_at) >= datetime('now', 'start of month') THEN 1 ELSE 0 END) AS new_this_month FROM users WHERE role = 'cliente' AND status = 'active'",
    ),
    pool.query(
      "SELECT id, name, category, sku, stock, minimum_stock FROM products WHERE active = TRUE AND stock <= minimum_stock ORDER BY stock ASC, name",
    ),
    pool.query(
      "SELECT strftime('%m/%Y', created_at) AS month, COALESCE(SUM(total), 0) AS revenue FROM orders WHERE status <> 'Cancelado' AND datetime(created_at) >= datetime('now', '-5 months', 'start of month') GROUP BY strftime('%Y-%m', created_at) ORDER BY strftime('%Y-%m', created_at)",
    ),
    pool.query(
      "SELECT p.category AS name, COALESCE(SUM(oi.subtotal), 0)::numeric(12,2) AS total FROM order_items oi JOIN products p ON p.id = oi.product_id JOIN orders o ON o.id = oi.order_id WHERE o.status <> 'Cancelado' GROUP BY p.category ORDER BY total DESC",
    ),
    pool.query(
      "SELECT a.id, strftime('%H:%M', a.starts_at) AS time, a.status, p.name AS pet, s.name AS service FROM appointments a JOIN pets p ON p.id = a.pet_id JOIN services s ON s.id = a.service_id WHERE date(a.starts_at) = date('now') ORDER BY a.starts_at LIMIT 10",
    ),
    pool.query(
      "SELECT COALESCE(SUM(amount), 0)::numeric(12,2) AS total FROM financial_entries WHERE type = 'RECEBER' AND status = 'Pendente'",
    ),
  ])
  return {
    kpis: {
      salesToday: Number(todaySales.rows[0].total),
      monthlyRevenue: Number(month.rows[0].total),
      appointmentsToday: today.rows[0].total,
      appointmentsActive: today.rows[0].active,
      activeClients: clients.rows[0].total,
      newClientsThisMonth: clients.rows[0].new_this_month,
      lowStock: lowStock.rows.length,
      receivable: Number(receivable.rows[0].total),
    },
    revenue: revenue.rows,
    categories: categories.rows,
    agenda: agenda.rows,
    lowStock: lowStock.rows,
  }
}
