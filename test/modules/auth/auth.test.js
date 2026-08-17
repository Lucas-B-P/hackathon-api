import assert from "node:assert/strict";
import { after, describe, it } from "node:test";
import request from "supertest";
import { app, pool } from "../../helpers/testApp.js";

describe("Auth API", () => {
  it("valida os campos obrigatórios do login", async () => {
    const response = await request(app).post("/auth/login").send({});
    assert.equal(response.status, 400);
    assert.equal(response.body.error.code, "VALIDATION_ERROR");
  });

  it("bloqueia /auth/me sem token", async () => {
    const response = await request(app).get("/auth/me");
    assert.equal(response.status, 401);
    assert.equal(response.body.error.code, "UNAUTHORIZED");
  });

  it("bloqueia token inválido", async () => {
    const response = await request(app).get("/auth/me").set("Authorization", "Bearer inválido");
    assert.equal(response.status, 401);
    assert.equal(response.body.error.code, "INVALID_TOKEN");
  });
});

after(() => pool.end());
