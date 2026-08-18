import { pool } from "../../database/pool.js"
import { createNotification } from "../notificacoes/notificacoes.service.js"

export async function listPets(ownerId) {
  const result = await pool.query(
    "SELECT id, name, species, breed, sex, birth_date, weight, notes, photo_url, created_at FROM pets WHERE owner_id = $1 ORDER BY name",
    [ownerId],
  )
  return result.rows
}

export async function getPet(ownerId, petId) {
  const result = await pool.query(
    "SELECT id, name, species, breed, sex, birth_date, weight, notes, photo_url, created_at FROM pets WHERE id = $1 AND owner_id = $2",
    [petId, ownerId],
  )
  return result.rows[0]
}

export async function createPet(ownerId, data) {
  const optional = (value) =>
    value === "" || value === undefined ? null : value
  const result = await pool.query(
    "INSERT INTO pets (owner_id, name, species, breed, sex, birth_date, weight, notes, photo_url) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *",
    [
      ownerId,
      data.nome.trim(),
      data.especie.trim(),
      optional(data.raca),
      optional(data.sexo),
      optional(data.nascimento),
      optional(data.peso),
      optional(data.observacoes),
      optional(data.fotoUrl),
    ],
  )
  await createNotification(
    ownerId,
    "pet",
    "Novo pet cadastrado",
    `${result.rows[0].name} foi adicionado ao seu perfil.`,
  )
  return result.rows[0]
}

export async function updatePet(ownerId, petId, data) {
  const result = await pool.query(
    "UPDATE pets SET name = COALESCE($1,name), species = COALESCE($2,species), breed = COALESCE($3,breed), sex = COALESCE($4,sex), birth_date = COALESCE($5,birth_date), weight = COALESCE($6,weight), notes = COALESCE($7,notes), photo_url = COALESCE($8,photo_url), updated_at = NOW() WHERE id = $9 AND owner_id = $10 RETURNING *",
    [
      data.nome,
      data.especie,
      data.raca,
      data.sexo,
      data.nascimento,
      data.peso,
      data.observacoes,
      data.fotoUrl,
      petId,
      ownerId,
    ],
  )
  return result.rows[0]
}

export async function deletePet(ownerId, petId) {
  await pool.query("DELETE FROM pets WHERE id = $1 AND owner_id = $2", [
    petId,
    ownerId,
  ])
}

export async function listHistory(ownerId, petId) {
  const result = await pool.query(
    `SELECT h.id, h.type, h.description, h.occurred_at, h.metadata
     FROM pet_history h JOIN pets p ON p.id = h.pet_id
     WHERE h.pet_id = $1 AND p.owner_id = $2 ORDER BY h.occurred_at DESC`,
    [petId, ownerId],
  )
  return result.rows
}
