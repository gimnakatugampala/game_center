import mysql from "mysql2/promise";

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
});

export async function saveRound(
  playerName,
  disks,
  pegs,
  moves,
  elapsedMs = null
) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    let [rows] = await conn.query("SELECT user_id FROM users WHERE name=?", [
      playerName,
    ]);
    let userId;
    if (rows.length === 0) {
      const [res] = await conn.query("INSERT INTO users (name) VALUES (?)", [
        playerName,
      ]);
      userId = res.insertId;
    } else {
      userId = rows[0].user_id;
    }

    const [roundRes] = await conn.query(
      "INSERT INTO rounds (user_id, disks, pegs) VALUES (?, ?, ?)",
      [userId, disks, pegs]
    );
    const roundId = roundRes.insertId;

    await conn.query(
      `INSERT INTO solutions 
        (round_id, algorithm, moves_count, moves_sequence, elapsed_ms, submitted_by, is_user_solution)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        roundId,
        null,
        moves.length,
        JSON.stringify(moves),
        elapsedMs,
        playerName,
        true,
      ]
    );

    await conn.commit();
    return { success: true, roundId };
  } catch (err) {
    await conn.rollback();
    console.error(err);
    return { success: false, error: err.message };
  } finally {
    conn.release();
  }
}

export async function getTopPlayers(limit = 10) {
  const [rows] = await pool.query(
    `SELECT u.name AS player, SUM(s.moves_count) AS moves, SUM(s.elapsed_ms) AS time
     FROM users u
     JOIN rounds r ON r.user_id = u.user_id
     JOIN solutions s ON s.round_id = r.round_id AND s.is_user_solution = 1
     GROUP BY u.user_id
     ORDER BY moves ASC, time ASC
     LIMIT ?`,
    [limit]
  );
  return rows;
}
