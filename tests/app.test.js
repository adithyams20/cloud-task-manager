
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

test("GET /api/tasks returns all tasks", async () => {
    const response = await request(app).get("/api/tasks");

    assert.equal(response.status, 200);
    assert.ok(Array.isArray(response.body));
    assert.equal(response.body.length, 2);
});

test("POST /api/tasks creates a task", async () => {
    const response = await request(app)
        .post("/api/tasks")
        .send({ title: "Learn PostgreSQL" });

    assert.equal(response.status, 201);
    assert.equal(response.body.title, "Learn PostgreSQL");
    assert.equal(response.body.completed, false);
});

test("POST /api/tasks rejects an empty title", async () => {
    const response = await request(app)
        .post("/api/tasks")
        .send({ title: "   " });

    assert.equal(response.status, 400);
});

test("PUT /api/tasks/1 updates a task", async () => {
    const response = await request(app)
        .put("/api/tasks/1")
        .send({ completed: true });

    assert.equal(response.status, 200);
    assert.equal(response.body.completed, true);
});

test("DELETE /api/tasks/2 deletes a task", async () => {
    const response = await request(app).delete("/api/tasks/2");

    assert.equal(response.status, 200);
    assert.equal(response.body.task.id, 2);
});

test("updating a nonexistent task returns 404", async () => {
    const response = await request(app)
        .put("/api/tasks/999")
        .send({ completed: true });

    assert.equal(response.status, 404);
});
