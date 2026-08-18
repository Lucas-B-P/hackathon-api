import { pool } from "../../database/pool.js"

export async function createNotification(userId, type, title, description) {
  await pool.query(
    "INSERT INTO notifications (user_id, type, title, description) VALUES ($1, $2, $3, $4)",
    [userId, type, title, description],
  )
}
export async function listNotifications(userId) {
  const result = await pool.query(
    "SELECT id, type, title, description, read_at, created_at FROM notifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT 30",
    [userId],
  )
  return result.rows
}
export async function markRead(userId, id) {
  await pool.query(
    "UPDATE notifications SET read_at = NOW() WHERE id = $1 AND user_id = $2",
    [id, userId],
  )
}
export async function markAllRead(userId) {
  await pool.query(
    "UPDATE notifications SET read_at = NOW() WHERE user_id = $1 AND read_at IS NULL",
    [userId],
  )
}
