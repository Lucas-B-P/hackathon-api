import { app } from "./app.js";
import { env } from "./config/env.js";
import { pool } from "./database/pool.js";

const server = app.listen(env.port, () => {
  console.log(`Patinhas API disponível em http://localhost:${env.port}`);
});

async function shutdown(signal) {
  console.log(`\n${signal}: encerrando API...`);
  server.close(async () => {
    await pool.end();
    process.exit(0);
  });
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
