import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "node:crypto";
import nodemailer from "nodemailer";
import { env } from "../../config/env.js";
import { pool } from "../../database/pool.js";
import { encryptProfileForStorage } from "../../utils/sensitiveFields.js";

function createToken(user) {
  return jwt.sign(
    { sub: String(user.id), email: user.email, role: user.role, name: user.name },
    env.jwtSecret,
    { expiresIn: "1h" },
  );
}

export async function login({ email, password }) {
  const result = await pool.query(
    "SELECT id, name, email, password_hash, role FROM users WHERE LOWER(email) = LOWER($1) AND status = 'active'",
    [email],
  );
  const user = result.rows[0];

  if (!user || !(await bcrypt.compare(password, user.password_hash))) {
    const error = new Error("E-mail ou senha inválidos");
    error.statusCode = 401;
    throw error;
  }

  return {
    token: createToken(user),
    user: { id: user.id, nome: user.name, email: user.email, role: user.role },
  };
}

export async function register({ name, email, password, cpf, phone, birthDate }) {
  const passwordHash = await bcrypt.hash(password, 12);
  const sensitive = encryptProfileForStorage({ cpf, phone, birth_date: birthDate });
  try {
    const result = await pool.query(
      `INSERT INTO users (name, email, password_hash, role, cpf, phone, birth_date)
       VALUES ($1, LOWER($2), $3, 'cliente', $4, $5, $6)
       RETURNING id, name, email, role`,
      [name, email, passwordHash, sensitive.cpf, sensitive.phone, sensitive.birth_date],
    );
    const user = result.rows[0];
    return {
      token: createToken(user),
      user: { id: user.id, nome: user.name, email: user.email, role: user.role },
    };
  } catch (error) {
    if (error.code === "23505") {
      const conflict = new Error("Este e-mail já está cadastrado");
      conflict.statusCode = 409;
      throw conflict;
    }
    throw error;
  }
}

export async function getCurrentUser(userId) {
  const result = await pool.query(
    "SELECT id, name, email, role FROM users WHERE id = $1 AND status = 'active'",
    [userId],
  );
  return result.rows[0] ?? null;
}

export async function requestPasswordReset(email) {
  const result = await pool.query("SELECT id, name, email FROM users WHERE LOWER(email) = LOWER($1) AND status = 'active'", [email]);
  const user = result.rows[0];
  if (!user) return;

  const rawToken = crypto.randomBytes(32).toString("hex");
  const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
  await pool.query("DELETE FROM password_reset_tokens WHERE user_id = $1 OR expires_at < NOW()", [user.id]);
  await pool.query("INSERT INTO password_reset_tokens (user_id, token_hash, expires_at) VALUES ($1, $2, NOW() + INTERVAL '30 minutes')", [user.id, tokenHash]);

  if (!env.smtp.host || !env.smtp.user || !env.smtp.password) {
    console.warn(`SMTP não configurado. Token de recuperação para ${user.email}: ${rawToken}`);
    return;
  }

  const transporter = nodemailer.createTransport({ host: env.smtp.host, port: env.smtp.port, secure: env.smtp.port === 465, auth: { user: env.smtp.user, pass: env.smtp.password } });
  const resetUrl = `${process.env.WEB_ORIGIN?.split(",")[0] ?? "http://localhost:8443"}/redefinir-senha?token=${rawToken}`;
  await transporter.sendMail({ from: env.smtp.from, to: user.email, subject: "Redefina sua senha — Patinhas Pet Shop", text: `Olá, ${user.name}! Acesse ${resetUrl} para criar uma nova senha. O link expira em 30 minutos.` });
}
