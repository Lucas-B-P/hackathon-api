import * as service from "./pets.service.js"

export async function listPetsController(_request, response, next) {
  try {
    const data = await service.listPets(_request.user.sub)
    response.json({ data, meta: { page: 1, perPage: 20, total: data.length } })
  } catch (error) {
    next(error)
  }
}

export async function getPetController(request, response, next) {
  try {
    const pet = await service.getPet(request.user.sub, request.params.id)
    if (!pet)
      return response
        .status(404)
        .json({ error: { code: "NOT_FOUND", message: "Pet não encontrado" } })
    response.json(pet)
  } catch (error) {
    next(error)
  }
}
export async function createPetController(request, response, next) {
  try {
    if (!request.body.nome || !request.body.especie)
      return response.status(400).json({
        error: {
          code: "VALIDATION_ERROR",
          message: "nome e espécie são obrigatórios",
        },
      })
    response
      .status(201)
      .json(await service.createPet(request.user.sub, request.body))
  } catch (error) {
    next(error)
  }
}
export async function updatePetController(request, response, next) {
  try {
    response.json(
      await service.updatePet(
        request.user.sub,
        request.params.id,
        request.body,
      ),
    )
  } catch (error) {
    next(error)
  }
}
export async function deletePetController(request, response, next) {
  try {
    await service.deletePet(request.user.sub, request.params.id)
    response.status(204).send()
  } catch (error) {
    next(error)
  }
}
export async function historyController(request, response, next) {
  try {
    response.json({
      data: await service.listHistory(request.user.sub, request.params.id),
    })
  } catch (error) {
    next(error)
  }
}
