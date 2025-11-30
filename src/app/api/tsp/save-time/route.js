// src/app/api/tsp/save-time/route.js
import { NextResponse } from 'next/server';
import db from '../../../lib/db';

export async function POST(request) {
  try {
    const data = await request.json();
    
    const {
      sessionId,      // Required: the session this algorithm ran for
      algorithmName,  // Required: e.g., "Nearest Neighbor (Greedy)"
      timeTaken,      // Required: time in milliseconds
      distanceFound,  // Required: distance result
      routeFound,     // Required: route string like "A → B → C → A"
      isOptimal,      // Optional: whether this is the optimal solution
      numCities       // Optional: for backward compatibility
    } = data;

    // Validate input
    if (!algorithmName || timeTaken === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields (algorithmName, timeTaken)' },
        { status: 400 }
      );
    }

    // If sessionId is provided, save to normalized structure
    if (sessionId) {
      // Get algorithm_id from tsp_algorithms table
      const algorithmResult = await db.query(
        'SELECT algorithm_id FROM tsp_algorithms WHERE algorithm_name = ?',
        [algorithmName]
      );

      if (algorithmResult.length === 0) {
        return NextResponse.json(
          { error: `Algorithm not found: ${algorithmName}` },
          { status: 400 }
        );
      }

      const algorithmId = algorithmResult[0].algorithm_id;

      // Check if this algorithm performance already exists for this session
      const existingPerf = await db.query(
        'SELECT performance_id FROM tsp_algorithm_performance WHERE session_id = ? AND algorithm_id = ?',
        [sessionId, algorithmId]
      );

      if (existingPerf.length > 0) {
        // Update existing record
        await db.execute(
          `UPDATE tsp_algorithm_performance 
           SET time_taken_ms = ?, distance_found = ?, route_found = ?, is_optimal_solution = ?
           WHERE session_id = ? AND algorithm_id = ?`,
          [timeTaken, distanceFound, routeFound, isOptimal ? 1 : 0, sessionId, algorithmId]
        );

        return NextResponse.json({
          success: true,
          message: 'Algorithm performance updated',
          performanceId: existingPerf[0].performance_id
        });
      } else {
        // Insert new record
        const result = await db.execute(
          `INSERT INTO tsp_algorithm_performance 
           (session_id, algorithm_id, time_taken_ms, distance_found, route_found, is_optimal_solution)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [sessionId, algorithmId, timeTaken, distanceFound || 0, routeFound || '', isOptimal ? 1 : 0]
        );

        return NextResponse.json({
          success: true,
          message: 'Algorithm performance saved',
          performanceId: result[0].insertId
        });
      }
    } 
    
    // Backward compatibility: If no sessionId, just log it
    // (This won't be saved to the new normalized structure)
    else {
      console.log('Algorithm time logged (no session):', {
        algorithmName,
        timeTaken,
        numCities
      });

      return NextResponse.json({
        success: true,
        message: 'Algorithm time logged (no persistent storage without sessionId)',
        warning: 'Provide sessionId to save to database'
      });
    }

  } catch (error) {
    console.error('Error saving algorithm time:', error);
    return NextResponse.json(
      { error: 'Failed to save time', details: error.message },
      { status: 500 }
    );
  }
}