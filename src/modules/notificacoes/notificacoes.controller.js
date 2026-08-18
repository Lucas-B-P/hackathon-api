import * as service from "./notificacoes.service.js"
export async function list(request, response, next) {
  try {
    const data = await service.listNotifications(request.user.sub)
    response.json({
      data,
      unreadCount: data.filter((item) => !item.read_at).length,
    })
  } catch (error) {
    next(error)
  }
}
export async function read(request, response, next) {
  try {
    await service.markRead(request.user.sub, request.params.id)
    response.status(204).send()
  } catch (error) {
    next(error)
  }
}
export async function readAll(request, response, next) {
  try {
    await service.markAllRead(request.user.sub)
    response.status(204).send()
  } catch (error) {
    next(error)
  }
}
