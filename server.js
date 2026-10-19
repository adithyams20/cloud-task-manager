
const express = require("express");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get("/", (req, res) => {
    res.send("Welcome to Cloud Task Manager!");
});

const tasks = [
    { id: 1, title: "Learn Docker", completed: false },
    { id: 2, title: "Deploy to the cloud", completed: true }
];

// READ
app.get("/api/tasks", (req, res) => {
    res.json(tasks);
});

// CREATE
app.post("/api/tasks", (req, res) => {
    const { title } = req.body;

    if (typeof title !== "string" || !title.trim()) {
        return res.status(400).json({
            error: "Task title is required"
        });
    }

    const newTask = {
        id: tasks.length
            ? Math.max(...tasks.map(task => task.id)) + 1
            : 1,
        title: title.trim(),
        completed: false
    };

    tasks.push(newTask);
    res.status(201).json(newTask);
});

// UPDATE
app.put("/api/tasks/:id", (req, res) => {
    const id = Number(req.params.id);
    const task = tasks.find(task => task.id === id);

    if (!task) {
        return res.status(404).json({ error: "Task not found" });
    }

    const { title, completed } = req.body;

    if (title !== undefined) {
        if (typeof title !== "string" || !title.trim()) {
            return res.status(400).json({
                error: "Title must be a non-empty string"
            });
        }

        task.title = title.trim();
    }

    if (completed !== undefined) {
        if (typeof completed !== "boolean") {
            return res.status(400).json({
                error: "Completed must be true or false"
            });
        }

        task.completed = completed;
    }

    res.json(task);
});

// DELETE
app.delete("/api/tasks/:id", (req, res) => {
    const id = Number(req.params.id);
    const index = tasks.findIndex(task => task.id === id);

    if (index === -1) {
        return res.status(404).json({ error: "Task not found" });
    }

    const deletedTask = tasks.splice(index, 1)[0];

    res.json({
        message: "Task deleted successfully",
        task: deletedTask
    });
});

// Start the server only when this file is run directly
if (require.main === module) {
    app.listen(PORT, "0.0.0.0", () => {
        console.log(`Server running on port ${PORT}`);
    });
}

module.exports = app;
