import { Router } from "express"
import { listPetsController } from "./pets.controller.js"
import { requireAuth } from "../../middlewares/auth.js"
import {
  createPetController,
  deletePetController,
  getPetController,
  historyController,
  updatePetController,
} from "./pets.controller.js"

const router = Router()
router.use(requireAuth)
router.get("/", listPetsController)
router.get("/:id", getPetController)
router.get("/:id/historico", historyController)
router.post("/", createPetController)
router.patch("/:id", updatePetController)
router.delete("/:id", deletePetController)
export default router
