import { decryptSensitive, encryptSensitive } from "./sensitiveCrypto.js";

const INCOMING_KEYS = ["cpf", "telefone", "nascimento"];
const PROFILE_KEYS = ["cpf", "phone", "birth_date"];

export function decryptIncomingSensitiveFields(body = {}) {
  const next = { ...body };
  for (const key of INCOMING_KEYS) {
    if (next[key] !== undefined && next[key] !== null && next[key] !== "") {
      next[key] = decryptSensitive(next[key]);
    }
  }
  return next;
}

export function encryptProfileForStorage(profile = {}) {
  const next = { ...profile };
  if (next.cpf !== undefined && next.cpf !== null && next.cpf !== "") {
    next.cpf = encryptSensitive(next.cpf);
  }
  if (next.phone !== undefined && next.phone !== null && next.phone !== "") {
    next.phone = encryptSensitive(next.phone);
  }
  if (next.birth_date !== undefined && next.birth_date !== null && next.birth_date !== "") {
    next.birth_date = encryptSensitive(String(next.birth_date));
  }
  return next;
}

export function decryptProfileFromStorage(profile = {}) {
  if (!profile) return profile;
  return {
    ...profile,
    cpf: profile.cpf ? decryptSensitive(profile.cpf) : profile.cpf,
    phone: profile.phone ? decryptSensitive(profile.phone) : profile.phone,
    birth_date: profile.birth_date ? decryptSensitive(String(profile.birth_date)) : profile.birth_date,
  };
}

export function encryptProfileForClient(profile = {}) {
  if (!profile) return profile;
  return {
    ...profile,
    cpf: profile.cpf ? encryptSensitive(profile.cpf) : profile.cpf,
    phone: profile.phone ? encryptSensitive(profile.phone) : profile.phone,
    birth_date: profile.birth_date ? encryptSensitive(String(profile.birth_date)) : profile.birth_date,
  };
}

export function decryptProfileFromClient(profile = {}) {
  if (!profile) return profile;
  const next = { ...profile };
  for (const key of PROFILE_KEYS) {
    if (next[key] !== undefined && next[key] !== null && next[key] !== "") {
      next[key] = decryptSensitive(String(next[key]));
    }
  }
  return next;
}
