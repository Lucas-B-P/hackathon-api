import express from "express";
import cors from "cors";
import { env } from "./config/env.js";
import authRoutes from "./modules/auth/auth.routes.js";
import { pool } from "./database/pool.js";
import clientesRoutes from "./modules/clientes/clientes.routes.js";
import petsRoutes from "./modules/pets/pets.routes.js";
import produtosRoutes from "./modules/produtos/produtos.routes.js";
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
app.use("/admin/clientes", clientesRoutes);
app.use("/admin/pets", petsRoutes);
app.use("/admin/produtos", produtosRoutes);
app.use(notFoundHandler);
app.use(errorHandler);
