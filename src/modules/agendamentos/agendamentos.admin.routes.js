import { Router } from "express"
import { requireAuth, requireRole } from "../../middlewares/auth.js"
import { listAdmin } from "./agendamentos.admin.controller.js"
const router = Router()
router.use(requireAuth, requireRole("admin", "gerente", "atendente"))
router.get("/", listAdmin)
export default router
