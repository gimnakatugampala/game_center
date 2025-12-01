// src/app/api/tsg/save-result/route.js
// Legacy endpoint - uses same logic as save-game for backward compatibility
import { NextResponse } from 'next/server';
import db from '../../../lib/db';

export async function POST(request) {
  const connection = await db.pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    const data = await request.json();
    
    const {
      playerName,
      correctAnswer,
      playerAnswer,
      algorithm1Time,
      algorithm2Time,
      capacities,
      roundNumber
    } = data;

    // Validation
    if (!playerName || typeof playerName !== 'string' || playerName.trim().length === 0) {
      await connection.rollback();
      return NextResponse.json(
        { error: 'Player name is required' },
        { status: 400 }
      );
    }

    if (typeof correctAnswer !== 'number' || correctAnswer < 0) {
      await connection.rollback();
      return NextResponse.json(
        { error: 'Invalid correct answer' },
        { status: 400 }
      );
    }

    if (typeof playerAnswer !== 'number' || playerAnswer < 0) {
      await connection.rollback();
      return NextResponse.json(
        { error: 'Invalid player answer' },
        { status: 400 }
      );
    }

    const isCorrect = playerAnswer === correctAnswer;

    // Prepare algorithm results
    const algorithmResults = [
      {
        algorithm: 'Ford-Fulkerson',
        maxFlow: correctAnswer,
        time: algorithm1Time || 0,
        type: 'Recursive'
      },
      {
        algorithm: 'Edmonds-Karp',
        maxFlow: correctAnswer,
        time: algorithm2Time || 0,
        type: 'Iterative'
      }
    ];

    // Use same logic as save-game
    const started = new Date();
    const completed = new Date();
    const durationSeconds = Math.floor((completed - started) / 1000);

    // Get or create player
    let playerId;
    const [existingPlayer] = await connection.query(
      'SELECT player_id FROM players WHERE player_name = ? LIMIT 1',
      [playerName.trim()]
    );

    if (existingPlayer.length > 0) {
      playerId = existingPlayer[0].player_id;
      await connection.execute(
        'UPDATE players SET last_active = CURRENT_TIMESTAMP WHERE player_id = ?',
        [playerId]
      );
    } else {
      const [playerResult] = await connection.execute(
        'INSERT INTO players (player_name) VALUES (?)',
        [playerName.trim()]
      );
      playerId = playerResult.insertId;
    }

    // Get TSG game_id
    const [gameResult] = await connection.query(
      'SELECT game_id FROM games WHERE game_code = ?',
      ['tsg']
    );
    
    if (gameResult.length === 0) {
      await connection.rollback();
      return NextResponse.json(
        { error: 'TSG game not found in database. Run DDL setup.' },
        { status: 500 }
      );
    }
    
    const gameId = gameResult[0].game_id;

    // Create game session
    const [sessionResult] = await connection.execute(
      `INSERT INTO game_sessions 
       (player_id, game_id, started_at, completed_at, session_duration_seconds, is_completed, is_successful)
       VALUES (?, ?, ?, ?, ?, TRUE, ?)`,
      [playerId, gameId, started, completed, durationSeconds, isCorrect]
    );
    const sessionId = sessionResult.insertId;

    await connection.commit();

    return NextResponse.json({
      success: true,
      isCorrect,
      sessionId: sessionId
    });

  } catch (error) {
    await connection.rollback();
    console.error('Error saving game result:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  } finally {
    connection.release();
  }
}

