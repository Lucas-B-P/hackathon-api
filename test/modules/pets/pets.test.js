import assert from "node:assert/strict";
import { after, describe, it } from "node:test";
import request from "supertest";
import { app, pool } from "../../helpers/testApp.js";

describe("Pets API", () => {
  it("retorna a listagem no formato paginado", async () => {
    const response = await request(app).get("/admin/pets");
    assert.equal(response.status, 200);
    assert.ok(Array.isArray(response.body.data));
    assert.equal(response.body.meta.total, 0);
  });
});

after(() => pool.end());
