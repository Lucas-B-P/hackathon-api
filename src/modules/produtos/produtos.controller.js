import { listProdutos } from "./produtos.service.js";

export async function listProdutosController(_request, response, next) {
  try {
    response.json({ data: await listProdutos(), meta: { page: 1, perPage: 20, total: 0 } });
  } catch (error) {
    next(error);
  }
}
