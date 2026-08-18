import { Router } from "express"
import { listClientesController } from "./clientes.controller.js"

const router = Router()
router.get("/", listClientesController)
export default router
