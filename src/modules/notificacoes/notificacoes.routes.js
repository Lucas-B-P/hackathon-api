import { Router } from "express";
import { requireAuth } from "../../middlewares/auth.js";
import * as controller from "./notificacoes.controller.js";
const router = Router();
router.use(requireAuth);
router.get("/", controller.list);
router.patch("/:id/lida", controller.read);
router.patch("/ler-todas", controller.readAll);
export default router;
