import { Router } from "express"
import { requireAuth } from "../../middlewares/auth.js"
import * as controller from "./pedidos.controller.js"
const router = Router()
router.use(requireAuth)
router.post("/", controller.create)
router.get("/", controller.list)
router.get("/:id", controller.detail)
router.post("/:id/cancelar", controller.cancel)
export default router
