// src/app/api/tsp/save-player/route.js
import { NextResponse } from 'next/server';
import db from '../../../lib/db';

export async function POST(request) {
  try {
    const data = await request.json();
    
    const {
      playerName,
      timestamp
    } = data;

    // Validate input
    if (!playerName || !playerName.trim()) {
      return NextResponse.json(
        { error: 'Player name is required' },
        { status: 400 }
      );
    }

    if (playerName.trim().length < 2) {
      return NextResponse.json(
        { error: 'Player name must be at least 2 characters' },
        { status: 400 }
      );
    }

    // Insert player entry into database
    const query = `
      INSERT INTO tsp_players 
      (player_name, entry_timestamp)
      VALUES (?, ?)
    `;

    const result = await db.execute(query, [
      playerName.trim(),
      timestamp
    ]);

    return NextResponse.json({
      success: true,
      message: 'Player registered successfully',
      playerId: result.insertId,
      playerName: playerName.trim()
    });

  } catch (error) {
    console.error('Error saving player:', error);
    return NextResponse.json(
      { error: 'Failed to save player', details: error.message },
      { status: 500 }
    );
  }
}