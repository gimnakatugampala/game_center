// src/app/api/queens/clear-flags/route.js
import { NextResponse } from 'next/server';
import db from '../../../lib/db';

export async function POST(request) {
  try {
    // Clear all duplicate flags when all solutions have been found
    await db.execute(
      `UPDATE queens_found_solutions 
       SET is_duplicate = FALSE`
    );

    return NextResponse.json({
      success: true,
      message: 'Duplicate flags cleared successfully'
    });

  } catch (error) {
    console.error('Error clearing flags:', error);
    return NextResponse.json(
      { error: 'Failed to clear flags', details: error.message },
      { status: 500 }
    );
  }
}