import { getCurrentUser, login, register, requestPasswordReset } from "./auth.service.js";

export async function loginController(request, response, next) {
  try {
    const { email, senha } = request.body;
    if (!email || !senha) {
      return response.status(400).json({
        error: { code: "VALIDATION_ERROR", message: "email e senha são obrigatórios" },
      });
    }
    return response.json(await login({ email, password: senha }));
  } catch (error) {
    return next(error);
  }
}

export async function meController(request, response, next) {
  try {
    const user = await getCurrentUser(request.user.sub);
    if (!user) {
      return response.status(404).json({ error: { code: "USER_NOT_FOUND", message: "Usuário não encontrado" } });
    }
    return response.json({ id: user.id, nome: user.name, email: user.email, role: user.role });
  } catch (error) {
    return next(error);
  }
}

export async function registerController(request, response, next) {
  try {
    const { nome, email, senha } = request.body;
    if (!nome || !email || !senha || senha.length < 6) {
      return response.status(400).json({
        error: { code: "VALIDATION_ERROR", message: "nome, email e senha com no mínimo 6 caracteres são obrigatórios" },
      });
    }
    return response.status(201).json(await register({ name: nome, email, password: senha }));
  } catch (error) {
    return next(error);
  }
}

export async function forgotPasswordController(request, response, next) {
  try {
    const { email } = request.body;
    if (!email) return response.status(400).json({ error: { code: "VALIDATION_ERROR", message: "email é obrigatório" } });
    await requestPasswordReset(email);
    return response.status(204).send();
  } catch (error) {
    return next(error);
  }
}
