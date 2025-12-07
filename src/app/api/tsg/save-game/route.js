// src/app/api/tsg/save-game/route.js
// Unified save endpoint for TSG game
import { NextResponse } from 'next/server';
import db from '../../../lib/db';

export async function POST(request) {
  const connection = await db.pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    const data = await request.json();
    
    const {
      playerName,
      playerAnswer,
      correctAnswer,
      isCorrect,
      algorithmResults,
      capacities,
      roundNumber,
      startTime,
      endTime
    } = data;

    // Validate required fields
    if (!playerName || !playerAnswer || correctAnswer === undefined || !algorithmResults || !capacities) {
      await connection.rollback();
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Calculate session duration
    const started = new Date(startTime);
    const completed = new Date(endTime || new Date());
    const durationSeconds = Math.floor((completed - started) / 1000);

    // Step 1: Get or create player
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

    // Step 2: Get TSG game_id
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

    // Step 3: Create game session
    const [sessionResult] = await connection.execute(
      `INSERT INTO game_sessions 
       (player_id, game_id, started_at, completed_at, session_duration_seconds, is_completed, is_successful)
       VALUES (?, ?, ?, ?, ?, TRUE, ?)`,
      [playerId, gameId, started, completed, durationSeconds, isCorrect]
    );
    const sessionId = sessionResult.insertId;

    // Step 4: Insert TSG game details
    // Note: You may need to create a tsg_game_details table similar to tsp_game_details
    // For now, we'll store basic info in a generic way
    const capacitiesJson = JSON.stringify(capacities);
    const algorithmResultsJson = JSON.stringify(algorithmResults);

    // If you have a tsg_game_details table, use it here
    // Otherwise, we can store in a generic game_results table or create the table
    try {
      await connection.execute(
        `INSERT INTO tsg_game_details 
         (session_id, round_number, player_answer, correct_answer, is_correct, 
          capacities, algorithm_results)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          sessionId,
          roundNumber || 1,
          playerAnswer,
          correctAnswer,
          isCorrect,
          capacitiesJson,
          algorithmResultsJson
        ]
      );
    } catch (tableError) {
      // If table doesn't exist, log and continue (you'll need to create the table)
      console.warn('tsg_game_details table may not exist:', tableError.message);
      // You can create a fallback or just skip this step
    }

    // Step 5: Insert algorithm performance data
    for (const algo of algorithmResults) {
      try {
        await connection.execute(
          `INSERT INTO algorithm_performance 
           (session_id, algorithm_name, execution_time_ms, result_value, algorithm_type)
           VALUES (?, ?, ?, ?, ?)`,
          [
            sessionId,
            algo.algorithm,
            parseFloat(algo.time),
            algo.maxFlow || algo.distance || null,
            algo.type || 'Unknown'
          ]
        );
      } catch (algoError) {
        console.warn('algorithm_performance table may not exist:', algoError.message);
      }
    }

    await connection.commit();

    return NextResponse.json({
      success: true,
      message: 'Game data saved successfully',
      sessionId: sessionId,
      playerId: playerId
    });

  } catch (error) {
    await connection.rollback();
    console.error('Error saving TSG game data:', error);
    return NextResponse.json(
      { error: 'Failed to save game data', details: error.message },
      { status: 500 }
    );
  } finally {
    connection.release();
  }
}

