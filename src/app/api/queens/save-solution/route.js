// src/app/api/queens/save-solution/route.js
import { NextResponse } from 'next/server';
import db from '../../../lib/db';
import crypto from 'crypto';

export async function POST(request) {
  const connection = await db.pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    const data = await request.json();
    const {
      playerName,
      solution,
      solutionNumber,
      isComplete,
      sessionId  // We'll need to pass this from the game
    } = data;

    // Validate required fields
    if (!playerName || !solution || !solutionNumber) {
      await connection.rollback();
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get player_id
    const [playerResult] = await connection.query(
      'SELECT player_id FROM players WHERE player_name = ? LIMIT 1',
      [playerName.trim()]
    );

    if (playerResult.length === 0) {
      await connection.rollback();
      return NextResponse.json(
        { error: 'Player not found' },
        { status: 404 }
      );
    }

    const playerId = playerResult[0].player_id;

    // Get or create active session
    let activeSessionId = sessionId;
    
    if (!activeSessionId) {
      // Get most recent session for this player
      const [sessionResult] = await connection.query(
        `SELECT session_id FROM queens_game_sessions 
         WHERE player_id = ? AND is_completed = FALSE 
         ORDER BY started_at DESC LIMIT 1`,
        [playerId]
      );

      if (sessionResult.length > 0) {
        activeSessionId = sessionResult[0].session_id;
      } else {
        await connection.rollback();
        return NextResponse.json(
          { error: 'No active session found' },
          { status: 404 }
        );
      }
    }

    // Generate solution hash
    const solutionHash = crypto
      .createHash('md5')
      .update(solution)
      .digest('hex');

    // Check if this solution was already found in this session
    const [existingSolution] = await connection.query(
      `SELECT found_solution_id FROM queens_found_solutions 
       WHERE session_id = ? AND solution_number = ?`,
      [activeSessionId, solutionNumber]
    );

    const isDuplicate = existingSolution.length > 0;

    // Get attempt order (how many solutions found so far)
    const [countResult] = await connection.query(
      `SELECT COUNT(*) as count FROM queens_found_solutions 
       WHERE session_id = ?`,
      [activeSessionId]
    );
    const attemptOrder = countResult[0].count + 1;

    // Insert solution
    await connection.execute(
      `INSERT INTO queens_found_solutions 
       (session_id, player_id, solution_number, solution_board, 
        solution_hash, is_duplicate, attempt_order)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        activeSessionId,
        playerId,
        solutionNumber,
        solution,
        solutionHash,
        isDuplicate ? 1 : 0,
        attemptOrder
      ]
    );

    // Update session if complete
    if (isComplete) {
      await connection.execute(
        `UPDATE queens_game_sessions 
         SET is_completed = TRUE, 
             completed_at = NOW(),
             session_duration_seconds = TIMESTAMPDIFF(SECOND, started_at, NOW())
         WHERE session_id = ?`,
        [activeSessionId]
      );
    }

    await connection.commit();

    return NextResponse.json({
      success: true,
      message: isDuplicate ? 'Duplicate solution' : 'New solution saved',
      isDuplicate: isDuplicate,
      sessionId: activeSessionId,
      solutionNumber: solutionNumber,
      isComplete: isComplete
    });

  } catch (error) {
    await connection.rollback();
    console.error('Error saving solution:', error);
    return NextResponse.json(
      { error: 'Failed to save solution', details: error.message },
      { status: 500 }
    );
  } finally {
    connection.release();
  }
}