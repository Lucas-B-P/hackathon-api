import { listClientes } from "./clientes.service.js"

export async function listClientesController(_request, response, next) {
  try {
    response.json({
      data: await listClientes(),
      meta: { page: 1, perPage: 20, total: 0 },
    })
  } catch (error) {
    next(error)
  }
}
