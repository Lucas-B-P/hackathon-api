import * as service from "./produtos.service.js"
export async function list(request, response, next) {
  try {
    response.json({ data: await service.listStoreProducts(request.query) })
  } catch (error) {
    next(error)
  }
}
export const listProdutosController = list
export async function adminList(request, response, next) {
  try {
    response.json({ data: await service.listAdminProducts() })
  } catch (error) {
    next(error)
  }
}
export async function adminUpdate(request, response, next) {
  try {
    const product = await service.updateAdminProduct(
      request.params.id,
      request.body,
    )
    if (!product)
      return response
        .status(404)
        .json({ error: { message: "Produto não encontrado" } })
    response.json(product)
  } catch (error) {
    next(error)
  }
}
export async function adminCreate(request, response, next) {
  try {
    response.status(201).json(await service.createAdminProduct(request.body))
  } catch (error) { next(error) }
}
export async function categories(request, response, next) {
  try {
    response.json({ data: await service.listCategories() })
  } catch (error) {
    next(error)
  }
}
export async function detail(request, response, next) {
  try {
    const product = await service.getStoreProduct(request.params.id)
    if (!product) return response.status(404).json({
        error: { code: "NOT_FOUND", message: "Produto não encontrado" },
      })
    response.json(product)
  } catch (error) {
    next(error)
  }
}
