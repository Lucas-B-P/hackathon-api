import assert from "node:assert/strict";
import { after, describe, it } from "node:test";
import request from "supertest";
import { app, pool } from "../helpers/testApp.js";

describe("Healthcheck", () => {
  it("responde quando o PostgreSQL está disponível", async (context) => {
    try {
      await pool.query("SELECT 1");
    } catch {
      context.skip("PostgreSQL de teste não está disponível");
      return;
    }

    const response = await request(app).get("/health");
    assert.equal(response.status, 200);
    assert.equal(response.body.database, "ok");
  });
});

after(() => pool.end());
