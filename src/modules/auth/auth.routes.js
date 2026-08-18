import { Router } from "express"
import { requireAuth } from "../../middlewares/auth.js"
import {
  forgotPasswordController,
  loginController,
  meController,
  registerController,
} from "./auth.controller.js"

const router = Router()
router.post("/login", loginController)
router.post("/register", registerController)
router.post("/forgot-password", forgotPasswordController)
router.get("/me", requireAuth, meController)

export default router
