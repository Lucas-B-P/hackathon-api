import { Router } from "express";
import { listPetsController } from "./pets.controller.js";

const router = Router();
router.get("/", listPetsController);
export default router;
