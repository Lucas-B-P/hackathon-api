import { pool } from "../../database/pool.js";
import { createNotification } from "../notificacoes/notificacoes.service.js";

export async function listServices() {
  const result = await pool.query("SELECT id, name, description, duration_minutes, price FROM services WHERE active = TRUE ORDER BY name");
  return result.rows;
}

export async function availableTimes(date) {
  const result = await pool.query("SELECT starts_at FROM appointments WHERE starts_at::date = $1 AND status <> 'Cancelado'", [date]);
  const occupied = new Set(result.rows.map((row) => new Date(row.starts_at).toISOString().slice(11, 16)));
  return ["08:00", "09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00"].filter((time) => !occupied.has(time));
}

export async function createAppointment(ownerId, data) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const pet = await client.query("SELECT id FROM pets WHERE id = $1 AND owner_id = $2", [data.petId, ownerId]);
    if (!pet.rows[0]) { const error = new Error("Pet não encontrado"); error.statusCode = 404; throw error; }
    const service = await client.query("SELECT id, name FROM services WHERE id = $1 AND active = TRUE", [data.servicoId]);
    if (!service.rows[0]) { const error = new Error("Serviço não encontrado"); error.statusCode = 404; throw error; }
    const conflict = await client.query("SELECT id FROM appointments WHERE starts_at = $1 AND status <> 'Cancelado' AND NOT (owner_id = $2 AND pet_id = $3)", [data.dataHora, ownerId, data.petId]);
    if (conflict.rows[0]) { const error = new Error("Este horário não está mais disponível"); error.statusCode = 409; throw error; }
    const result = await client.query("INSERT INTO appointments (owner_id, pet_id, service_id, starts_at, notes) VALUES ($1,$2,$3,$4,$5) RETURNING *", [ownerId, data.petId, data.servicoId, data.dataHora, data.observacoes]);
    await client.query("INSERT INTO pet_history (pet_id, type, description, occurred_at, metadata) VALUES ($1, 'agendamento', $2, $3, $4)", [data.petId, `Agendamento: ${service.rows[0].name}`, data.dataHora, JSON.stringify({ appointmentId: result.rows[0].id, status: "Agendado" })]);
    await client.query("COMMIT");
    await createNotification(ownerId, "agendamento", "Agendamento confirmado", `Seu agendamento para ${service.rows[0].name} foi confirmado.`);
    return result.rows[0];
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function listAppointments(ownerId) {
  const result = await pool.query("SELECT a.id, a.starts_at, a.status, a.notes, p.name AS pet_name, s.name AS service_name, s.price FROM appointments a JOIN pets p ON p.id = a.pet_id JOIN services s ON s.id = a.service_id WHERE a.owner_id = $1 ORDER BY a.starts_at DESC", [ownerId]);
  return result.rows;
}

export async function cancelAppointment(ownerId, id) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const result = await client.query("UPDATE appointments SET status = 'Cancelado' WHERE id = $1 AND owner_id = $2 AND status IN ('Agendado','Confirmado') RETURNING pet_id, starts_at", [id, ownerId]);
    if (result.rows[0]) {
      await client.query("INSERT INTO pet_history (pet_id, type, description, occurred_at, metadata) VALUES ($1, 'agendamento_cancelado', 'Agendamento cancelado', NOW(), $2)", [result.rows[0].pet_id, JSON.stringify({ appointmentId: id, scheduledAt: result.rows[0].starts_at })]);
    }
    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
