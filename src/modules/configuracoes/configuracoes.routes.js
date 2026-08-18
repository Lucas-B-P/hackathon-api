import { Router } from "express"
import { pool } from "../../database/pool.js"
import { requireAuth } from "../../middlewares/auth.js"

const router = Router()
router.use(requireAuth)

router.get("/", async (_request, response, next) => {
  try {
    const [shop, notifications, appearance] = await Promise.all([
      pool.query("SELECT * FROM pet_shop_settings WHERE id = 1"),
      pool.query("SELECT * FROM shop_notification_settings WHERE id = 1"),
      pool.query("SELECT * FROM shop_appearance_settings WHERE id = 1"),
    ])
    response.json({
      data: {
        shop: shop.rows[0] ?? null,
        notifications: notifications.rows[0] ?? null,
        appearance: appearance.rows[0] ?? null,
      },
    })
  } catch (error) {
    next(error)
  }
})

router.patch("/shop", async (request, response, next) => {
  try {
    const fields = [
      "name",
      "document",
      "phone",
      "email",
      "logo_url",
      "street",
      "number",
      "complement",
      "neighborhood",
      "city",
      "state",
      "zip_code",
    ]
    const values = fields.map((field) =>
      request.body[field] === "" ? null : (request.body[field] ?? null),
    )
    const result = await pool.query(
      `INSERT INTO pet_shop_settings (id, ${fields.join(", ")}) VALUES (1, ${fields.map((_, index) => `$${index + 1}`).join(", ")}) ON CONFLICT (id) DO UPDATE SET ${fields.map((field, index) => `${field} = $${index + 1}`).join(", ")}, updated_at = NOW() RETURNING *`,
      values,
    )
    response.json({ data: result.rows[0] })
  } catch (error) {
    next(error)
  }
})

router.patch("/notifications", async (request, response, next) => {
  try {
    const fields = [
      "email_enabled",
      "sms_enabled",
      "appointment_reminders",
      "promotions_enabled",
    ]
    const values = fields.map((field) => Boolean(request.body[field]))
    const result = await pool.query(
      `INSERT INTO shop_notification_settings (id, ${fields.join(", ")}) VALUES (1, ${fields.map((_, index) => `$${index + 1}`).join(", ")}) ON CONFLICT (id) DO UPDATE SET ${fields.map((field, index) => `${field} = $${index + 1}`).join(", ")}, updated_at = NOW() RETURNING *`,
      values,
    )
    response.json({ data: result.rows[0] })
  } catch (error) {
    next(error)
  }
})

export default router
