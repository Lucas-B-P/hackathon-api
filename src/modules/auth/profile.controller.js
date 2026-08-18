import * as service from "./profile.service.js";
import {
  decryptIncomingSensitiveFields,
  encryptProfileForClient,
} from "../../utils/sensitiveFields.js";

export async function getProfile(request, response, next) {
  try {
    response.json(encryptProfileForClient(await service.getProfile(request.user.sub)));
  } catch (error) {
    next(error);
  }
}

export async function updateProfile(request, response, next) {
  try {
    const profile = await service.updateProfile(request.user.sub, decryptIncomingSensitiveFields(request.body));
    response.json(encryptProfileForClient(profile));
  } catch (error) {
    next(error);
  }
}

export async function listAddresses(request, response, next) {
  try {
    response.json({ data: await service.listAddresses(request.user.sub) });
  } catch (error) {
    next(error);
  }
}

export async function createAddress(request, response, next) {
  try {
    response.status(201).json(await service.createAddress(request.user.sub, request.body));
  } catch (error) {
    next(error);
  }
}

export async function deleteAddress(request, response, next) {
  try {
    await service.deleteAddress(request.user.sub, request.params.id);
    response.status(204).send();
  } catch (error) {
    next(error);
  }
}

export async function updateAddress(request, response, next) {
  try {
    response.json(await service.updateAddress(request.user.sub, request.params.id, request.body));
  } catch (error) {
    next(error);
  }
}

export async function getPreferences(request, response, next) {
  try {
    response.json(await service.getPreferences(request.user.sub));
  } catch (error) {
    next(error);
  }
}

export async function updatePreferences(request, response, next) {
  try {
    response.json(await service.updatePreferences(request.user.sub, request.body));
  } catch (error) {
    next(error);
  }
}

export async function changePassword(request, response, next) {
  try {
    const { senhaAtual, novaSenha } = request.body;
    if (!senhaAtual || !novaSenha || novaSenha.length < 6) {
      return response.status(400).json({ error: { code: "VALIDATION_ERROR", message: "Senhas inválidas" } });
    }
    await service.changePassword(request.user.sub, senhaAtual, novaSenha);
    response.status(204).send();
  } catch (error) {
    next(error);
  }
}
