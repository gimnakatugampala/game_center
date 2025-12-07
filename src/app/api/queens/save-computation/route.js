// src/app/api/queens/save-computation/route.js
import { NextResponse } from 'next/server';
import db from '../../../lib/db';

export async function POST(request) {
  const connection = await db.pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    const data = await request.json();
    const {
      playerName,
      sequentialTime,
      threadedTime,
      solutionsCount
    } = data;

    // Validate required fields
    if (!playerName || !sequentialTime || !threadedTime) {
      await connection.rollback();
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get or create player
    let playerId;
    const [existingPlayer] = await connection.query(
      'SELECT player_id FROM players WHERE player_name = ? LIMIT 1',
      [playerName.trim()]
    );

    if (existingPlayer.length > 0) {
      playerId = existingPlayer[0].player_id;
    } else {
      const [playerResult] = await connection.execute(
        'INSERT INTO players (player_name) VALUES (?)',
        [playerName.trim()]
      );
      playerId = playerResult.insertId;
    }

    // Get Queens game_id
    const [gameResult] = await connection.query(
      'SELECT game_id FROM games WHERE game_code = ?',
      ['queens']
    );
    
    if (gameResult.length === 0) {
      await connection.rollback();
      return NextResponse.json(
        { error: 'Queens game not found in database. Run DDL setup.' },
        { status: 500 }
      );
    }
    
    const gameId = gameResult[0].game_id;

    // Calculate speedup factor
    const speedupFactor = parseFloat(sequentialTime) / parseFloat(threadedTime);

    // Create game session
    const [sessionResult] = await connection.execute(
      `INSERT INTO queens_game_sessions 
       (player_id, game_id, sequential_time_ms, threaded_time_ms, 
        speedup_factor, solutions_count, started_at)
       VALUES (?, ?, ?, ?, ?, ?, NOW())`,
      [
        playerId,
        gameId,
        parseFloat(sequentialTime),
        parseFloat(threadedTime),
        speedupFactor,
        solutionsCount || 92
      ]
    );
    
    const sessionId = sessionResult.insertId;

    // Get algorithm IDs
    const [algorithms] = await connection.query(
      'SELECT algorithm_id, algorithm_type FROM queens_algorithms'
    );

    // Save algorithm performance
    for (const algo of algorithms) {
      const timeTaken = algo.algorithm_type === 'Sequential' 
        ? parseFloat(sequentialTime) 
        : parseFloat(threadedTime);
      
      await connection.execute(
        `INSERT INTO queens_algorithm_performance 
         (session_id, algorithm_id, time_taken_ms, solutions_found)
         VALUES (?, ?, ?, ?)`,
        [sessionId, algo.algorithm_id, timeTaken, solutionsCount || 92]
      );
    }

    await connection.commit();

    return NextResponse.json({
      success: true,
      message: 'Computation results saved successfully',
      sessionId: sessionId,
      playerId: playerId,
      speedupFactor: speedupFactor.toFixed(2)
    });

  } catch (error) {
    await connection.rollback();
    console.error('Error saving computation:', error);
    return NextResponse.json(
      { error: 'Failed to save computation', details: error.message },
      { status: 500 }
    );
  } finally {
    connection.release();
  }
}