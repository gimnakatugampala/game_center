// src/app/api/hanoi/scores/route.js
import { NextResponse } from "next/server";
import db from "../../../lib/db";

// --- GET Leaderboard ---
export async function GET() {
  try {
    const rows = await db.query(`
      SELECT 
        s.id,
        s.user_id,
        u.player_name,
        s.pegs,
        s.disks,
        s.user_moves,
        s.target_moves,
        s.is_optimal,
        s.time_taken_ms,
        s.created_at
      FROM hanoi_scores s
      JOIN hanoi_users u ON s.user_id = u.user_id
      ORDER BY s.disks DESC, s.user_moves ASC, s.time_taken_ms ASC, s.created_at ASC
      LIMIT 100
    `);

    return NextResponse.json({ success: true, scores: rows }, { status: 200 });
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

// --- POST New Score ---
export async function POST(request) {
  try {
    const {
      user_id,
      player_name,
      pegs,
      disks,
      user_moves,
      target_moves,
      is_optimal,
      time_taken_ms,
    } = await request.json();

    // Validation
    if (
      !player_name ||
      pegs == null ||
      disks == null ||
      user_moves == null ||
      target_moves == null ||
      is_optimal == null
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Missing required fields: player_name, pegs, disks, user_moves, target_moves, is_optimal",
        },
        { status: 400 }
      );
    }

    // --- 1. Ensure user exists in hanoi_users ---
    let userResult = await db.query(
      `SELECT user_id FROM hanoi_users WHERE player_name = ? LIMIT 1`,
      [player_name]
    );

    let finalUserId;

    if (userResult.length > 0) {
      // Existing user
      finalUserId = userResult[0].user_id;
    } else {
      // Create new user
      const insertUser = await db.execute(
        `INSERT INTO hanoi_users (player_name) VALUES (?)`,
        [player_name]
      );
      finalUserId = insertUser.insertId;
    }

    // --- 2. Insert score into hanoi_scores ---
    const result = await db.execute(
      `
      INSERT INTO hanoi_scores 
      (user_id, pegs, disks, user_moves, target_moves, is_optimal, time_taken_ms)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      [
        finalUserId,
        pegs,
        disks,
        user_moves,
        target_moves,
        is_optimal ? 1 : 0,
        time_taken_ms || null,
      ]
    );

    return NextResponse.json(
      {
        success: true,
        message: "Score saved successfully",
        id: result.insertId,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error saving score:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
