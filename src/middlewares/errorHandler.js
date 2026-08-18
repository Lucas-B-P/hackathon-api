export function notFoundHandler(request, response) {
  response.status(404).json({
    error: "NOT_FOUND",
    message: `Rota não encontrada: ${request.method} ${request.originalUrl}`,
  })
}

export function errorHandler(error, request, response, _next) {
  console.error(error)
  const status = error.statusCode || 500
  response.status(status).json({
    error: status === 500 ? "INTERNAL_SERVER_ERROR" : "REQUEST_ERROR",
    message: status === 500 ? "Erro interno do servidor" : error.message,
  })
}
