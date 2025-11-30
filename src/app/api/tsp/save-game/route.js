// src/app/api/tsp/save-game/route.js
// 🆕 NEW FILE - Unified save endpoint (RECOMMENDED)
// This saves everything in one transaction

import { NextResponse } from 'next/server';
import db from '../../../lib/db';

export async function POST(request) {
  const connection = await db.pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    const data = await request.json();
    
    const {
      playerName,
      homeCity,
      selectedCities,    // Array: ["B", "C", "D"]
      distances,         // Distance matrix object
      playerRoute,       // String: "A-B-C-D-A"
      playerDistance,
      algorithmResults,  // Array of algorithm results
      startTime,
      endTime
    } = data;

    // Validate required fields
    if (!playerName || !homeCity || !selectedCities || !playerRoute || !playerDistance || !algorithmResults) {
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

    // Get optimal solution from algorithm results
    const optimalResult = algorithmResults.reduce((min, curr) => 
      curr.distance < min.distance ? curr : min
    );
    const optimalDistance = optimalResult.distance;
    const optimalRoute = optimalResult.routeString;
    const isOptimal = Math.abs(playerDistance - optimalDistance) <= 1;
    const distanceDifference = playerDistance - optimalDistance;

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

    // Step 2: Get TSP game_id
    const [gameResult] = await connection.query(
      'SELECT game_id FROM games WHERE game_code = ?',
      ['tsp']
    );
    
    if (gameResult.length === 0) {
      await connection.rollback();
      return NextResponse.json(
        { error: 'TSP game not found in database. Run DDL setup.' },
        { status: 500 }
      );
    }
    
    const gameId = gameResult[0].game_id;

    // Step 3: Create game session
    const [sessionResult] = await connection.execute(
      `INSERT INTO game_sessions 
       (player_id, game_id, started_at, completed_at, session_duration_seconds, is_completed, is_successful)
       VALUES (?, ?, ?, ?, ?, TRUE, ?)`,
      [playerId, gameId, started, completed, durationSeconds, isOptimal]
    );
    const sessionId = sessionResult.insertId;

    // Step 4: Insert TSP game details
    const numCities = selectedCities.length + 1; // Including home city
    await connection.execute(
      `INSERT INTO tsp_game_details 
       (session_id, home_city, num_cities, player_route, player_distance, 
        optimal_route, optimal_distance, distance_difference, is_optimal)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        sessionId,
        homeCity,
        numCities,
        playerRoute,
        playerDistance,
        optimalRoute,
        optimalDistance,
        distanceDifference,
        isOptimal
      ]
    );

    // Step 5: Insert selected cities
    await connection.execute(
      'INSERT INTO tsp_selected_cities (session_id, city_name, is_home) VALUES (?, ?, TRUE)',
      [sessionId, homeCity]
    );

    for (const city of selectedCities) {
      await connection.execute(
        'INSERT INTO tsp_selected_cities (session_id, city_name, is_home) VALUES (?, ?, FALSE)',
        [sessionId, city]
      );
    }

    // Step 6: Insert city distances
    if (distances) {
      const allCities = [homeCity, ...selectedCities];
      for (let i = 0; i < allCities.length; i++) {
        for (let j = i + 1; j < allCities.length; j++) {
          const fromCity = allCities[i];
          const toCity = allCities[j];
          const distance = distances[fromCity]?.[toCity];
          
          if (distance !== undefined) {
            // Insert both directions
            await connection.execute(
              'INSERT INTO tsp_city_distances (session_id, from_city, to_city, distance) VALUES (?, ?, ?, ?)',
              [sessionId, fromCity, toCity, distance]
            );
            await connection.execute(
              'INSERT INTO tsp_city_distances (session_id, from_city, to_city, distance) VALUES (?, ?, ?, ?)',
              [sessionId, toCity, fromCity, distance]
            );
          }
        }
      }
    }

    // Step 7: Insert algorithm performance data
    for (const algo of algorithmResults) {
      // Get algorithm_id
      const [algoResult] = await connection.query(
        'SELECT algorithm_id FROM tsp_algorithms WHERE algorithm_name = ?',
        [algo.algorithm]
      );
      
      if (algoResult.length > 0) {
        const algorithmId = algoResult[0].algorithm_id;
        const isOptimalSolution = Math.abs(algo.distance - optimalDistance) <= 0.01;
        
        await connection.execute(
          `INSERT INTO tsp_algorithm_performance 
           (session_id, algorithm_id, time_taken_ms, distance_found, route_found, is_optimal_solution)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [
            sessionId,
            algorithmId,
            parseFloat(algo.time),
            algo.distance,
            algo.routeString,
            isOptimalSolution
          ]
        );
      }
    }

    await connection.commit();

    return NextResponse.json({
      success: true,
      message: 'Game data saved successfully',
      sessionId: sessionId,
      playerId: playerId,
      isOptimal: isOptimal,
      distanceDifference: distanceDifference,
      optimalDistance: optimalDistance
    });

  } catch (error) {
    await connection.rollback();
    console.error('Error saving TSP game:', error);
    return NextResponse.json(
      { error: 'Failed to save game data', details: error.message },
      { status: 500 }
    );
  } finally {
    connection.release();
  }
}