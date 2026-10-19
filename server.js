
const express = require("express");
const pool = require("./db");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Homepage
app.get("/", (req, res) => {
    res.send("Welcome to Cloud Task Manager!");
});

// READ: Get all tasks
app.get("/api/tasks", async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT * FROM tasks ORDER BY id"
        );
        res.json(result.rows);
    } catch (error) {
        console.error("Error fetching tasks:", error.message);
        res.status(500).json({ error: "Failed to fetch tasks" });
    }
});

// CREATE: Add a task
app.post("/api/tasks", async (req, res) => {
    const { title } = req.body;

    if (typeof title !== "string" || !title.trim()) {
        return res.status(400).json({
            error: "Task title is required"
        });
    }

    try {
        const result = await pool.query(
            "INSERT INTO tasks (title) VALUES ($1) RETURNING *",
            [title.trim()]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error("Error creating task:", error.message);
        res.status(500).json({ error: "Failed to create task" });
    }
});

// UPDATE: Change a task
app.put("/api/tasks/:id", async (req, res) => {
    const id = Number(req.params.id);
    const { title, completed } = req.body;

    if (!Number.isInteger(id) || id < 1) {
        return res.status(400).json({ error: "Invalid task ID" });
    }

    if (title === undefined && completed === undefined) {
        return res.status(400).json({
            error: "Provide a title or completed value"
        });
    }

    if (title !== undefined &&
        (typeof title !== "string" || !title.trim())) {
        return res.status(400).json({
            error: "Title must be a non-empty string"
        });
    }

    if (completed !== undefined && typeof completed !== "boolean") {
        return res.status(400).json({
            error: "Completed must be true or false"
        });
    }

    try {
        const existing = await pool.query(
            "SELECT * FROM tasks WHERE id = $1",
            [id]
        );

        if (existing.rows.length === 0) {
            return res.status(404).json({ error: "Task not found" });
        }

        const current = existing.rows[0];
        const newTitle = title === undefined ? current.title : title.trim();
        const newCompleted = completed === undefined
            ? current.completed
            : completed;

        const result = await pool.query(
            `UPDATE tasks
             SET title = $1, completed = $2
             WHERE id = $3
             RETURNING *`,
            [newTitle, newCompleted, id]
        );

        res.json(result.rows[0]);
    } catch (error) {
        console.error("Error updating task:", error.message);
        res.status(500).json({ error: "Failed to update task" });
    }
});

// DELETE: Remove a task
app.delete("/api/tasks/:id", async (req, res) => {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id < 1) {
        return res.status(400).json({ error: "Invalid task ID" });
    }

    try {
        const result = await pool.query(
            "DELETE FROM tasks WHERE id = $1 RETURNING *",
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Task not found" });
        }

        res.json({
            message: "Task deleted successfully",
            task: result.rows[0]
        });
    } catch (error) {
        console.error("Error deleting task:", error.message);
        res.status(500).json({ error: "Failed to delete task" });
    }
});

if (require.main === module) {
    app.listen(PORT, "0.0.0.0", () => {
        console.log(`Server running on port ${PORT}`);
    });
}

module.exports = app;
