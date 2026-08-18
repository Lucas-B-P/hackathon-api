import { Router } from "express"
import { requireAuth, requireRole } from "../../middlewares/auth.js"
import { adminDashboard } from "./dashboard.controller.js"
const router = Router()
router.use(requireAuth, requireRole("admin", "gerente"))
router.get("/", adminDashboard)
export default router
