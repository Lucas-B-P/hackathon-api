import { listPets } from "./pets.service.js";

export async function listPetsController(_request, response, next) {
  try {
    response.json({ data: await listPets(), meta: { page: 1, perPage: 20, total: 0 } });
  } catch (error) {
    next(error);
  }
}
