import * as service from "./pedidos.service.js";
export async function create(request, response, next) { try { response.status(201).json(await service.createOrder(request.user.sub, request.body)); } catch (error) { next(error); } }
export async function list(request, response, next) { try { response.json({ data: await service.listOrders(request.user.sub) }); } catch (error) { next(error); } }
export async function detail(request, response, next) { try { const order = await service.getOrder(request.user.sub, request.params.id); if (!order) return response.status(404).json({ error: { code: "NOT_FOUND", message: "Pedido não encontrado" } }); response.json(order); } catch (error) { next(error); } }
export async function cancel(request, response, next) { try { await service.cancelOrder(request.user.sub, request.params.id); response.status(204).send(); } catch (error) { next(error); } }
