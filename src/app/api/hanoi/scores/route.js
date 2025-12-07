// src/app/api/hanoi/scores/route.js
import { NextResponse } from "next/server";
import db from "../../../lib/db";

// --- GET Leaderboard ---
export async function GET() {
  try {
    const rows = await db.query(`
      SELECT id, user_id, player_name, pegs, disks,
             user_moves, target_moves, is_optimal, time_taken_ms, created_at
      FROM scores
      ORDER BY disks DESC, user_moves ASC, time_taken_ms ASC, created_at ASC
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

    // Validate required fields
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

    const result = await db.execute(
      `
      INSERT INTO scores (user_id, player_name, pegs, disks, user_moves, target_moves, is_optimal, time_taken_ms)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        user_id || "anonymous",
        player_name,
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
