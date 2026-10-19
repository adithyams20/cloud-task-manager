
const { Pool } = require("pg");

const pool = new Pool({
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT || 5432),
    user: process.env.DB_USER || "taskuser",
    password: process.env.DB_PASSWORD || "localdev123",
    database: process.env.DB_NAME || "taskmanager"
});

module.exports = pool;
