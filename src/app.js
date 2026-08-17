import express from "express";
import cors from "cors";
import { env } from "./config/env.js";
import authRoutes from "./modules/auth/auth.routes.js";
import { pool } from "./database/pool.js";
import clientesRoutes from "./modules/clientes/clientes.routes.js";
import petsRoutes from "./modules/pets/pets.routes.js";
import produtosRoutes from "./modules/produtos/produtos.routes.js";
import profileRoutes from "./modules/auth/profile.routes.js";
import appointmentsRoutes from "./modules/agendamentos/agendamentos.routes.js";
import ordersRoutes from "./modules/pedidos/pedidos.routes.js";
import storeProductsRoutes from "./modules/produtos/produtos.portal.routes.js";
import notificationsRoutes from "./modules/notificacoes/notificacoes.routes.js";
import { errorHandler, notFoundHandler } from "./middlewares/errorHandler.js";

export const app = express();

app.disable("x-powered-by");
app.use(cors({ origin: env.webOrigins }));
app.use(express.json({ limit: "1mb" }));

app.get("/", (_request, response) => {
  response.json({ name: "Patinhas API", version: "1.0.0" });
});
app.get("/meta", (_request, response) => {
  response.json({ data: { name: "Patinhas API", version: "1.0.0" } });
});
app.get("/health", async (_request, response, next) => {
  try {
    await pool.query("SELECT 1");
    response.json({ status: "ok", database: "ok", timestamp: new Date().toISOString() });
  } catch (error) {
    next(error);
  }
});
app.use("/auth", authRoutes);
app.use("/portal/perfil", profileRoutes);
app.use("/admin/clientes", clientesRoutes);
app.use("/admin/pets", petsRoutes);
app.use("/portal/pets", petsRoutes);
app.use("/portal", appointmentsRoutes);
app.use("/portal/pedidos", ordersRoutes);
app.use("/portal/loja", storeProductsRoutes);
app.use("/portal/notificacoes", notificationsRoutes);
app.use("/admin/produtos", produtosRoutes);
app.use(notFoundHandler);
app.use(errorHandler);
