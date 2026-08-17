import assert from "node:assert/strict";
import { after, describe, it } from "node:test";
import request from "supertest";
import { app, pool } from "../../helpers/testApp.js";

describe("Produtos API", () => {
  it("retorna a listagem no formato paginado", async () => {
    const response = await request(app).get("/admin/produtos");
    assert.equal(response.status, 200);
    assert.ok(Array.isArray(response.body.data));
    assert.equal(response.body.meta.perPage, 20);
  });
});

after(() => pool.end());
