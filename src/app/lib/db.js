// lib/db.js
import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

// --- Create a connection pool ---
const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "hanoi_game",
  port: Number(process.env.DB_PORT) || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// --- Execute a query with parameters (INSERT, UPDATE, DELETE) ---
async function execute(query, params = []) {
  try {
    const [results] = await pool.execute(query, params);
    return results;
  } catch (error) {
    console.error("Database execute error:", error.message);
    throw error;
  }
}

// --- Query rows (SELECT) ---
async function query(sql, params = []) {
  try {
    const [rows] = await pool.query(sql, params);
    return rows;
  } catch (error) {
    console.error("Database query error:", error.message);
    throw error;
  }
}

// --- Test database connection ---
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log(
      `✅ Connected to database: ${process.env.DB_NAME} at ${process.env.DB_HOST}`
    );
    connection.release();
    return true;
  } catch (error) {
    console.error(
      `❌ Failed to connect to database: ${process.env.DB_NAME} at ${process.env.DB_HOST}`,
      error.message
    );
    return false;
  }
}

// --- Export ---
const db = {
  execute,
  query,
  pool,
  testConnection,
};

export default db;
