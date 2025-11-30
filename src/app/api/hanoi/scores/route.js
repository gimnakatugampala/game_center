import mysql from "mysql2/promise";

// --- Database Configuration ---
const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "game_center",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

let pool;

async function getDbPool() {
  if (pool) return pool;

  try {
    pool = mysql.createPool(dbConfig);
    console.log("Database pool established.");

    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS scores (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        player_name VARCHAR(255) NOT NULL,
        pegs INT NOT NULL,
        disks INT NOT NULL,
        user_moves INT NOT NULL,
        target_moves INT NOT NULL,
        is_optimal BOOLEAN NOT NULL,
        time_taken_ms INT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `;
    await pool.query(createTableQuery);
    console.log("Table 'scores' is ready.");

    return pool;
  } catch (error) {
    console.error("Database connection failed:", error);
    throw new Error("Failed to connect or initialize database.");
  }
}

// --- GET Leaderboard ---
export async function GET(req) {
  try {
    const pool = await getDbPool();
    const query = `
      SELECT id, user_id, player_name, pegs, disks,
             user_moves, target_moves, is_optimal, time_taken_ms, created_at
      FROM scores
      ORDER BY disks DESC, user_moves ASC, time_taken_ms ASC, created_at ASC
      LIMIT 100;
    `;
    const [rows] = await pool.query(query);

    return new Response(JSON.stringify({ success: true, scores: rows }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    return new Response(
      JSON.stringify({ success: false, message: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

// --- POST New Score ---
export async function POST(req) {
  try {
    const pool = await getDbPool();
    const {
      user_id,
      player_name,
      pegs,
      disks,
      user_moves,
      target_moves,
      is_optimal,
      time_taken_ms,
    } = await req.json();

    // Validate required fields
    if (
      !player_name ||
      pegs == null ||
      disks == null ||
      user_moves == null ||
      target_moves == null ||
      is_optimal == null
    ) {
      return new Response(
        JSON.stringify({
          success: false,
          message:
            "Missing required fields: player_name, pegs, disks, user_moves, target_moves, is_optimal",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const query = `
      INSERT INTO scores (user_id, player_name, pegs, disks, user_moves, target_moves, is_optimal, time_taken_ms)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?);
    `;
    const values = [
      user_id || "anonymous", // default to anonymous if not provided
      player_name,
      pegs,
      disks,
      user_moves,
      target_moves,
      is_optimal ? 1 : 0,
      time_taken_ms || null, // allow null if undefined
    ];

    await pool.query(query, values);

    return new Response(
      JSON.stringify({ success: true, message: "Score saved successfully." }),
      { status: 201, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error saving score:", error);
    return new Response(
      JSON.stringify({ success: false, message: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
