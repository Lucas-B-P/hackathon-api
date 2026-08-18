import * as service from "./agendamentos.service.js"
export async function services(request, response, next) {
  try {
    response.json({ data: await service.listServices() })
  } catch (error) {
    next(error)
  }
}
export async function times(request, response, next) {
  try {
    response.json({ data: await service.availableTimes(request.query.data) })
  } catch (error) {
    next(error)
  }
}
export async function create(request, response, next) {
  try {
    response
      .status(201)
      .json(await service.createAppointment(request.user.sub, request.body))
  } catch (error) {
    next(error)
  }
}
export async function list(request, response, next) {
  try {
    response.json({ data: await service.listAppointments(request.user.sub) })
  } catch (error) {
    next(error)
  }
}
export async function cancel(request, response, next) {
  try {
    await service.cancelAppointment(request.user.sub, request.params.id)
    response.status(204).send()
  } catch (error) {
    next(error)
  }
}
