// src/app/api/tsp/save-time/route.js
import { NextResponse } from 'next/server';
import db from '../../../lib/db';

export async function POST(request) {
  try {
    const data = await request.json();
    
    const {
      algorithmName,
      timeTaken,
      numCities,
      timestamp
    } = data;

    // Validate input
    if (!algorithmName || timeTaken === undefined || !numCities) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Insert into database
    const query = `
      INSERT INTO tsp_algorithm_times 
      (algorithm_name, time_taken_ms, num_cities, timestamp)
      VALUES (?, ?, ?, ?)
    `;

    const result = await db.execute(query, [
      algorithmName,
      timeTaken,
      numCities,
      timestamp
    ]);

    return NextResponse.json({
      success: true,
      message: 'Algorithm time saved successfully',
      id: result.insertId
    });

  } catch (error) {
    console.error('Error saving algorithm time:', error);
    return NextResponse.json(
      { error: 'Failed to save time', details: error.message },
      { status: 500 }
    );
  }
}