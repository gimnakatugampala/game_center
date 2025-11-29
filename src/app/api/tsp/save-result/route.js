// src/app/api/tsp/save-result/route.js
import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function POST(request) {
  try {
    const data = await request.json();
    
    const {
      playerName,
      homeCity,
      selectedCities,
      shortestRoute,
      shortestDistance,
      playerRoute,
      playerDistance,
      isCorrect,
      timestamp
    } = data;

    // Validate input
    if (!playerName || !homeCity || !selectedCities) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Insert into database
    const query = `
      INSERT INTO tsp_results 
      (player_name, home_city, selected_cities, shortest_route, shortest_distance, 
       player_route, player_distance, is_correct, timestamp)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const result = await db.execute(query, [
      playerName,
      homeCity,
      selectedCities,
      shortestRoute,
      shortestDistance,
      playerRoute,
      playerDistance,
      isCorrect ? 1 : 0,
      timestamp
    ]);

    return NextResponse.json({
      success: true,
      message: 'Result saved successfully',
      id: result.insertId
    });

  } catch (error) {
    console.error('Error saving TSP result:', error);
    return NextResponse.json(
      { error: 'Failed to save result', details: error.message },
      { status: 500 }
    );
  }
}