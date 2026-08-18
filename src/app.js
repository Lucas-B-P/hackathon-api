import express from "express"
import cors from "cors"
import { env } from "./config/env.js"
import authRoutes from "./modules/auth/auth.routes.js"
import { pool } from "./database/pool.js"
import clientesRoutes from "./modules/clientes/clientes.routes.js"
import petsRoutes from "./modules/pets/pets.routes.js"
import produtosRoutes from "./modules/produtos/produtos.routes.js"
import profileRoutes from "./modules/auth/profile.routes.js"
import appointmentsRoutes from "./modules/agendamentos/agendamentos.routes.js"
import ordersRoutes from "./modules/pedidos/pedidos.routes.js"
import storeProductsRoutes from "./modules/produtos/produtos.portal.routes.js"
import notificationsRoutes from "./modules/notificacoes/notificacoes.routes.js"
import dashboardRoutes from "./modules/dashboard/dashboard.routes.js"
import adminAppointmentsRoutes from "./modules/agendamentos/agendamentos.admin.routes.js"
import salesRoutes from "./modules/vendas/vendas.routes.js"
import adminOrdersRoutes from "./modules/pedidos/pedidos.admin.routes.js"
import stockRoutes from "./modules/estoque/estoque.routes.js"
import adminPetsRoutes from "./modules/pets/pets.admin.routes.js"
import adminServicesRoutes from "./modules/servicos/servicos.routes.js"
import groomingRoutes from "./modules/banho-tosa/banho-tosa.routes.js"
import veterinaryRoutes from "./modules/veterinario/veterinario.routes.js"
import financeRoutes from "./modules/financeiro/financeiro.routes.js"
import employeeRoutes from "./modules/funcionarios/funcionarios.routes.js"
import reportsRoutes from "./modules/relatorios/relatorios.routes.js"
import settingsRoutes from "./modules/configuracoes/configuracoes.routes.js"
import { errorHandler, notFoundHandler } from "./middlewares/errorHandler.js"
import { requireAuth, requireRole } from "./middlewares/auth.js"

export const app = express()

app.disable("x-powered-by")
app.use(cors({ origin: env.webOrigins }))
app.use(express.json({ limit: "1mb" }))

app.get("/", (_request, response) => {
  response.json({ name: "Patinhas API", version: "1.0.0" })
})
app.get("/meta", (_request, response) => {
  response.json({ data: { name: "Patinhas API", version: "1.0.0" } })
})
app.get("/health", async (_request, response, next) => {
  try {
    await pool.query("SELECT 1")
    response.json({
      status: "ok",
      database: "ok",
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    next(error)
  }
})
app.use("/auth", authRoutes)
app.use("/portal/perfil", profileRoutes)
// Todas as rotas administrativas exigem sessão válida e um perfil interno.
app.use(
  "/admin",
  requireAuth,
  requireRole("admin", "gerente", "atendente", "caixa", "tosador", "vet"),
)
app.use("/admin/clientes", clientesRoutes)
app.use("/admin/pets", adminPetsRoutes)
app.use("/admin/servicos", adminServicesRoutes)
app.use("/admin/banho-tosa", groomingRoutes)
app.use("/admin/veterinario", veterinaryRoutes)
app.use("/admin/financeiro", financeRoutes)
app.use("/admin/funcionarios", employeeRoutes)
app.use("/admin/relatorios", reportsRoutes)
app.use("/admin/configuracoes", settingsRoutes)
app.use("/portal/pets", petsRoutes)
app.use("/portal", appointmentsRoutes)
app.use("/portal/pedidos", ordersRoutes)
app.use("/portal/loja", storeProductsRoutes)
app.use("/portal/notificacoes", notificationsRoutes)
app.use("/admin/produtos", produtosRoutes)
app.use("/admin/dashboard", dashboardRoutes)
app.use("/admin/agendamentos", adminAppointmentsRoutes)
app.use("/admin/vendas", salesRoutes)
app.use("/admin/pedidos", adminOrdersRoutes)
app.use("/admin/estoque", stockRoutes)
app.use(notFoundHandler)
app.use(errorHandler)
