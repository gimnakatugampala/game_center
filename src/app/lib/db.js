import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

export const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT),
  waitForConnections: true,
  connectionLimit: 10,
});

async function execute(query, params = []) {
  try {
    const [results] = await pool.execute(query, params);
    return results;
  } catch (error) {
    console.error("Database execute error:", error.message);
    throw error;
  }
}

async function query(sql, params = []) {
  try {
    const [rows] = await pool.query(sql, params);
    return rows;
  } catch (error) {
    console.error("Database query error:", error.message);
    throw error;
  }
}

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
