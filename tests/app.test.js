
const { test } = require("node:test");
const assert = require("node:assert/strict");
const request = require("supertest");
const app = require("../server");
const pool = require("../db");

test("homepage returns the welcome message", async () => {
    const response = await request(app).get("/");

    assert.equal(response.status, 200);
    assert.equal(response.text, "Welcome to Cloud Task Manager!");
});

test("GET /api/tasks returns a list", async () => {
    const response = await request(app).get("/api/tasks");

    assert.equal(response.status, 200);
    assert.ok(Array.isArray(response.body));
});

test("POST /api/tasks creates a task", async () => {
    const response = await request(app)
        .post("/api/tasks")
        .send({ title: "Test task" });

    assert.equal(response.status, 201);
    assert.equal(response.body.title, "Test task");
    assert.equal(response.body.completed, false);

    // Clean up the task created by this test.
    await pool.query("DELETE FROM tasks WHERE id = $1", [
        response.body.id
    ]);
});

test("POST /api/tasks rejects an empty title", async () => {
    const response = await request(app)
        .post("/api/tasks")
        .send({ title: "   " });

    assert.equal(response.status, 400);
});

test("PUT /api/tasks updates a task", async () => {
    const created = await pool.query(
        "INSERT INTO tasks (title) VALUES ($1) RETURNING id",
        ["Task to update"]
    );

    const id = created.rows[0].id;

    try {
        const response = await request(app)
            .put(`/api/tasks/${id}`)
            .send({ completed: true });

        assert.equal(response.status, 200);
        assert.equal(response.body.completed, true);
    } finally {
        await pool.query("DELETE FROM tasks WHERE id = $1", [id]);
    }
});

test("DELETE /api/tasks deletes a task", async () => {
    const created = await pool.query(
        "INSERT INTO tasks (title) VALUES ($1) RETURNING id",
        ["Task to delete"]
    );

    const id = created.rows[0].id;

    const response = await request(app).delete(`/api/tasks/${id}`);

    assert.equal(response.status, 200);
    assert.equal(response.body.task.id, id);
});

test("updating a nonexistent task returns 404", async () => {
    const response = await request(app)
        .put("/api/tasks/999999999")
        .send({ completed: true });

    assert.equal(response.status, 404);
});

test("close database connections after testing", async () => {
    await pool.end();
});
