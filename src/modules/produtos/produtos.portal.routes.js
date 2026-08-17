import { Router } from "express";
import { requireAuth } from "../../middlewares/auth.js";
import * as controller from "./produtos.controller.js";
const router = Router();
router.use(requireAuth);
router.get("/produtos", controller.list);
router.get("/produtos/:id", controller.detail);
router.get("/categorias", controller.categories);
export default router;
