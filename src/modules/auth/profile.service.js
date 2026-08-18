import bcrypt from "bcryptjs";
import { pool } from "../../database/pool.js";
import {
  decryptProfileFromStorage,
  encryptProfileForStorage,
} from "../../utils/sensitiveFields.js";

const PROFILE_FIELD_MAP = {
  nome: "name",
  cpf: "cpf",
  telefone: "phone",
  nascimento: "birth_date",
  fotoUrl: "avatar_url",
};

export async function updateProfile(userId, data) {
  const entries = Object.entries(data).filter(([key, value]) => PROFILE_FIELD_MAP[key] && value !== undefined);
  if (entries.length === 0) return getProfile(userId);

  const mapped = Object.fromEntries(entries.map(([key, value]) => [PROFILE_FIELD_MAP[key], value]));
  const encrypted = encryptProfileForStorage(mapped);
  const values = entries.map(([key]) => encrypted[PROFILE_FIELD_MAP[key]]);
  const set = entries.map(([key], index) => `${PROFILE_FIELD_MAP[key]} = $${index + 1}`).join(", ");
  values.push(userId);
  await pool.query(`UPDATE users SET ${set}, updated_at = NOW() WHERE id = $${values.length}`, values);
  return getProfile(userId);
}

export async function getProfile(userId) {
  const result = await pool.query(
    "SELECT id, name, email, cpf, phone, birth_date, avatar_url, role FROM users WHERE id = $1",
    [userId],
  );
  return decryptProfileFromStorage(result.rows[0]);
}

export async function listAddresses(userId) {
  const result = await pool.query(
    "SELECT id, label, street, number, complement, neighborhood, city, state, zip_code, is_primary FROM user_addresses WHERE user_id = $1 ORDER BY is_primary DESC, id",
    [userId],
  );
  return result.rows;
}

export async function createAddress(userId, data) {
  const result = await pool.query(
    `INSERT INTO user_addresses (user_id, label, street, number, complement, neighborhood, city, state, zip_code, is_primary)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
    [userId, data.rotulo, data.logradouro, data.numero, data.complemento, data.bairro, data.cidade, data.uf, data.cep, data.principal ?? false],
  );
  return result.rows[0];
}

export async function deleteAddress(userId, addressId) {
  await pool.query("DELETE FROM user_addresses WHERE id = $1 AND user_id = $2", [addressId, userId]);
}

export async function updateAddress(userId, addressId, data) {
  const result = await pool.query(
    `UPDATE user_addresses SET label = COALESCE($1, label), street = COALESCE($2, street), number = COALESCE($3, number), complement = COALESCE($4, complement), neighborhood = COALESCE($5, neighborhood), city = COALESCE($6, city), state = COALESCE($7, state), zip_code = COALESCE($8, zip_code), is_primary = COALESCE($9, is_primary), updated_at = NOW() WHERE id = $10 AND user_id = $11 RETURNING *`,
    [data.rotulo, data.logradouro, data.numero, data.complemento, data.bairro, data.cidade, data.uf, data.cep, data.principal, addressId, userId],
  );
  return result.rows[0];
}

export async function getPreferences(userId) {
  const result = await pool.query(
    "SELECT email_notifications, sms_notifications, appointment_reminders, marketing_notifications FROM user_preferences WHERE user_id = $1",
    [userId],
  );
  if (result.rows[0]) return result.rows[0];
  const created = await pool.query(
    "INSERT INTO user_preferences (user_id) VALUES ($1) RETURNING email_notifications, sms_notifications, appointment_reminders, marketing_notifications",
    [userId],
  );
  return created.rows[0];
}

export async function updatePreferences(userId, data) {
  await getPreferences(userId);
  const allowed = {
    emailNotifications: "email_notifications",
    smsNotifications: "sms_notifications",
    appointmentReminders: "appointment_reminders",
    marketingNotifications: "marketing_notifications",
  };
  const entries = Object.entries(data).filter(([key, value]) => allowed[key] && typeof value === "boolean");
  if (entries.length) {
    const values = entries.map(([, value]) => value);
    values.push(userId);
    const set = entries.map(([key], index) => `${allowed[key]} = $${index + 1}`).join(", ");
    await pool.query(`UPDATE user_preferences SET ${set}, updated_at = NOW() WHERE user_id = $${values.length}`, values);
  }
  return getPreferences(userId);
}

export async function changePassword(userId, currentPassword, newPassword) {
  const result = await pool.query("SELECT password_hash FROM users WHERE id = $1", [userId]);
  if (!result.rows[0] || !(await bcrypt.compare(currentPassword, result.rows[0].password_hash))) {
    const error = new Error("Senha atual inválida");
    error.statusCode = 400;
    throw error;
  }
  await pool.query("UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2", [
    await bcrypt.hash(newPassword, 12),
    userId,
  ]);
}
