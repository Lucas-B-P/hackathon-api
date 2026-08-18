import { Router } from "express"
import { listProdutosController } from "./produtos.controller.js"
import { requireAuth } from "../../middlewares/auth.js"
import * as controller from "./produtos.controller.js"

const router = Router()
router.use(requireAuth)
router.get("/", controller.adminList)
router.post("/", controller.adminCreate)
router.patch("/:id", controller.adminUpdate)
export default router
