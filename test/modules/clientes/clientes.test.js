import assert from "node:assert/strict";
import { after, describe, it } from "node:test";
import request from "supertest";
import { app, pool } from "../../helpers/testApp.js";

describe("Clientes API", () => {
  it("retorna a listagem no formato paginado", async () => {
    const response = await request(app).get("/admin/clientes");
    assert.equal(response.status, 200);
    assert.ok(Array.isArray(response.body.data));
    assert.deepEqual(Object.keys(response.body.meta), ["page", "perPage", "total"]);
  });
});

after(() => pool.end());
