const { test } = require("node:test");
const assert = require("node:assert/strict");
const request = require("supertest");
const app = require("../server");

test("homepage returns the welcome message", async () => {
    const response = await request(app).get("/");

    assert.equal(response.status, 200);
    assert.equal(
        response.text,
        "Welcome to Cloud Task Manager!"
    );
});