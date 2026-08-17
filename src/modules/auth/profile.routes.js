import { Router } from "express";
import { requireAuth } from "../../middlewares/auth.js";
import * as controller from "./profile.controller.js";

const router = Router();
router.use(requireAuth);
router.get("/", controller.getProfile);
router.patch("/", controller.updateProfile);
router.get("/enderecos", controller.listAddresses);
router.post("/enderecos", controller.createAddress);
router.patch("/enderecos/:id", controller.updateAddress);
router.delete("/enderecos/:id", controller.deleteAddress);
router.get("/preferencias", controller.getPreferences);
router.patch("/preferencias", controller.updatePreferences);
router.patch("/senha", controller.changePassword);
export default router;
