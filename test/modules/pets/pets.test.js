import assert from "node:assert/strict";
import { after, describe, it } from "node:test";
import request from "supertest";
import jwt from "jsonwebtoken";
import { app, pool } from "../../helpers/testApp.js";

describe("Pets API", () => {
  it("retorna a listagem no formato paginado", async (context) => {
    try { await pool.query("SELECT 1 FROM pets LIMIT 1"); } catch { context.skip("PostgreSQL de teste não está disponível"); return; }
    const token = jwt.sign({ sub: "1", role: "admin" }, process.env.JWT_SECRET);
    const response = await request(app).get("/admin/pets").set("Authorization", `Bearer ${token}`);
    assert.equal(response.status, 200);
    assert.ok(Array.isArray(response.body.data));
    assert.equal(response.body.meta.total, 0);
  });
});

after(() => pool.end());
