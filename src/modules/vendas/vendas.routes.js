import { Router } from "express"
import { requireAuth, requireRole } from "../../middlewares/auth.js"
import * as service from "./vendas.service.js"
const router = Router()
router.use(requireAuth, requireRole("admin", "gerente", "atendente", "caixa"))
router.get("/", async (request, response, next) => {
  try {
    response.json({ data: await service.listSales() })
  } catch (error) {
    next(error)
  }
})
router.post("/", async (request, response, next) => {
  try {
    response
      .status(201)
      .json(await service.createSale(request.user.sub, request.body))
  } catch (error) {
    next(error)
  }
})
export default router
