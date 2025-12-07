// src/app/api/queens/save-player/route.js
import { NextResponse } from 'next/server';
import db from '../../../lib/db';

export async function POST(request) {
  try {
    const data = await request.json();
    const { playerName } = data;

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

    // Check if player already exists
    const existingPlayer = await db.query(
      'SELECT player_id, player_name FROM players WHERE player_name = ? LIMIT 1',
      [playerName.trim()]
    );

    if (existingPlayer.length > 0) {
      // Player exists, update last_active
      const playerId = existingPlayer[0].player_id;
      await db.execute(
        'UPDATE players SET last_active = CURRENT_TIMESTAMP WHERE player_id = ?',
        [playerId]
      );

      return NextResponse.json({
        success: true,
        message: 'Welcome back!',
        playerId: playerId,
        playerName: existingPlayer[0].player_name,
        isNewPlayer: false
      });
    }

    // Insert new player
    const result = await db.execute(
      `INSERT INTO players 
       (player_name, created_at, last_active)
       VALUES (?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
      [playerName.trim()]
    );

    return NextResponse.json({
      success: true,
      message: 'Player registered successfully',
      playerId: result.insertId,
      playerName: playerName.trim(),
      isNewPlayer: true
    });

  } catch (error) {
    console.error('Error saving player:', error);
    return NextResponse.json(
      { error: 'Failed to save player', details: error.message },
      { status: 500 }
    );
  }
}