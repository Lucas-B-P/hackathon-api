import jwt from "jsonwebtoken"
import { env } from "../config/env.js"

export function requireAuth(request, response, next) {
  const header = request.headers.authorization
  const [scheme, token] = header?.split(" ") ?? []

  if (scheme !== "Bearer" || !token) {
    return response.status(401).json({
      error: { code: "UNAUTHORIZED", message: "Token Bearer não informado" },
    })
  }

  try {
    request.user = jwt.verify(token, env.jwtSecret)
    return next()
  } catch {
    return response.status(401).json({
      error: { code: "INVALID_TOKEN", message: "Token inválido ou expirado" },
    })
  }
}

export function requireRole(...roles) {
  return (request, response, next) =>
    roles.includes(request.user.role) ? next() : response.status(403).json({
          error: {
            code: "FORBIDDEN",
            message: "Acesso administrativo necessário",
          },
        })
}
