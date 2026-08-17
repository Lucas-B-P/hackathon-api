import { Router } from "express";
import { listProdutosController } from "./produtos.controller.js";

const router = Router();
router.get("/", listProdutosController);
export default router;
