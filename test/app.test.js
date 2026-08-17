import assert from "node:assert/strict";
import { after, describe, it } from "node:test";
import request from "supertest";
import { app, pool } from "./helpers/testApp.js";

describe("Application", () => {
  it("retorna informações na raiz", async () => {
    const response = await request(app).get("/");
    assert.equal(response.status, 200);
    assert.deepEqual(response.body, { name: "Patinhas API", version: "1.0.0" });
  });

  it("retorna metadados", async () => {
    const response = await request(app).get("/meta");
    assert.equal(response.status, 200);
    assert.equal(response.body.data.name, "Patinhas API");
  });

  it("retorna 404 para rota inexistente", async () => {
    const response = await request(app).get("/nao-existe");
    assert.equal(response.status, 404);
    assert.equal(response.body.error, "NOT_FOUND");
  });
});

after(() => pool.end());
