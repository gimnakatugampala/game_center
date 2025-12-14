import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

/**
 * MySQL connection pool for database operations
 * Uses environment variables for configuration
 */
const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "game_center",
  port: Number(process.env.DB_PORT) || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

/**
 * Executes a parameterized query (INSERT, UPDATE, DELETE)
 * @param {string} query - SQL query string
 * @param {Array} params - Query parameters
 * @returns {Promise<Object>} Query results
 */
async function execute(query, params = []) {
  try {
    const [results] = await pool.execute(query, params);
    return results;
  } catch (error) {
    console.error("Database execute error:", error.message);
    throw error;
  }
}

/**
 * Queries the database and returns rows (SELECT)
 * @param {string} sql - SQL query string
 * @param {Array} params - Query parameters
 * @returns {Promise<Array>} Array of rows
 */
async function query(sql, params = []) {
  try {
    const [rows] = await pool.query(sql, params);
    return rows;
  } catch (error) {
    console.error("Database query error:", error.message);
    throw error;
  }
}

/**
 * Tests the database connection
 * @returns {Promise<boolean>} True if connection successful
 */
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

const db = {
  execute,
  query,
  pool,
  testConnection,
};

export default db;
