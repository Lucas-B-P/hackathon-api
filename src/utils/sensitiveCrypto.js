import crypto from "node:crypto";
import { env } from "../config/env.js";

const ALGORITHM = "aes-256-gcm";
export const ENCRYPTED_PREFIX = "enc:v1:";

function resolveKeyBuffer() {
  if (env.sensitiveDataKey) {
    const key = Buffer.from(env.sensitiveDataKey, "base64");
    if (key.length !== 32) {
      throw new Error("SENSITIVE_DATA_KEY deve ser uma string base64 de 32 bytes");
    }
    return key;
  }
  if (env.nodeEnv === "development" && env.jwtSecret) {
    return crypto.createHash("sha256").update(env.jwtSecret).digest();
  }
  throw new Error("SENSITIVE_DATA_KEY não foi definida no ambiente");
}

export function isEncryptedValue(value) {
  return typeof value === "string" && value.startsWith(ENCRYPTED_PREFIX);
}

export function encryptSensitive(value) {
  if (value === null || value === undefined || value === "") return value;
  const plain = String(value);
  if (isEncryptedValue(plain)) return plain;

  const key = resolveKeyBuffer();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  const payload = Buffer.concat([iv, encrypted, tag]);
  return `${ENCRYPTED_PREFIX}${payload.toString("base64url")}`;
}

export function decryptSensitive(value) {
  if (value === null || value === undefined || value === "") return value;
  const input = String(value);
  if (!isEncryptedValue(input)) return input;

  const key = resolveKeyBuffer();
  const payload = Buffer.from(input.slice(ENCRYPTED_PREFIX.length), "base64url");
  const iv = payload.subarray(0, 12);
  const tag = payload.subarray(payload.length - 16);
  const ciphertext = payload.subarray(12, payload.length - 16);
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString("utf8");
}
