import * as service from "./dashboard.service.js"
export async function adminDashboard(_request, response, next) {
  try {
    response.json({ data: await service.getAdminDashboard() })
  } catch (error) {
    next(error)
  }
}
