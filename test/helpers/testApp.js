process.env.NODE_ENV = "test";
process.env.DATABASE_URL ??= "postgresql://postgres:postgres@localhost:5432/patinhas_test";
process.env.JWT_SECRET ??= "test-secret";
process.env.WEB_ORIGIN ??= "http://localhost:5173";

export const { app } = await import("../../src/app.js");
export const { pool } = await import("../../src/database/pool.js");
