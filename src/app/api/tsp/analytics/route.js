// src/app/api/tsp/analytics/route.js
// 🆕 NEW FILE - Comprehensive analytics endpoint

import { NextResponse } from 'next/server';
import db from '../../../lib/db';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'overview';

    let data;

    switch (type) {
      case 'overview':
        // Overall game statistics
        data = await db.query(`
          SELECT 
            COUNT(DISTINCT p.player_id) as total_players,
            COUNT(gs.session_id) as total_games,
            COUNT(DISTINCT DATE(gs.started_at)) as days_played,
            SUM(CASE WHEN tsp.is_optimal THEN 1 ELSE 0 END) as optimal_solutions,
            ROUND(AVG(CASE WHEN tsp.is_optimal THEN 1 ELSE 0 END) * 100, 2) as success_rate,
            ROUND(AVG(gs.session_duration_seconds), 0) as avg_duration,
            ROUND(AVG(tsp.num_cities), 1) as avg_cities,
            MAX(gs.started_at) as last_game_played
          FROM game_sessions gs
          JOIN games g ON gs.game_id = g.game_id
          JOIN players p ON gs.player_id = p.player_id
          JOIN tsp_game_details tsp ON gs.session_id = tsp.session_id
          WHERE g.game_code = 'tsp' AND gs.is_completed = TRUE
        `);
        break;

      case 'algorithm_comparison':
        // Algorithm performance comparison
        data = await db.query(`
          SELECT 
            a.algorithm_id,
            a.algorithm_name,
            a.algorithm_type,
            a.complexity,
            COUNT(ap.performance_id) as times_used,
            ROUND(AVG(ap.time_taken_ms), 4) as avg_time_ms,
            ROUND(MIN(ap.time_taken_ms), 4) as min_time_ms,
            ROUND(MAX(ap.time_taken_ms), 4) as max_time_ms,
            ROUND(STDDEV(ap.time_taken_ms), 4) as stddev_time_ms,
            ROUND(AVG(tsp.num_cities), 1) as avg_num_cities,
            SUM(CASE WHEN ap.is_optimal_solution THEN 1 ELSE 0 END) as optimal_solutions_found,
            ROUND(AVG(CASE WHEN ap.is_optimal_solution THEN 1 ELSE 0 END) * 100, 2) as optimal_percentage
          FROM tsp_algorithms a
          LEFT JOIN tsp_algorithm_performance ap ON a.algorithm_id = ap.algorithm_id
          LEFT JOIN tsp_game_details tsp ON ap.session_id = tsp.session_id
          GROUP BY a.algorithm_id, a.algorithm_name, a.algorithm_type, a.complexity
          ORDER BY times_used DESC
        `);
        break;

      case 'time_trends':
        // Algorithm performance trends by number of cities
        data = await db.query(`
          SELECT 
            a.algorithm_name,
            tsp.num_cities,
            COUNT(*) as sample_count,
            ROUND(AVG(ap.time_taken_ms), 4) as avg_time_ms,
            ROUND(MIN(ap.time_taken_ms), 4) as min_time_ms,
            ROUND(MAX(ap.time_taken_ms), 4) as max_time_ms,
            ROUND(STDDEV(ap.time_taken_ms), 4) as stddev_time_ms
          FROM tsp_algorithm_performance ap
          JOIN tsp_algorithms a ON ap.algorithm_id = a.algorithm_id
          JOIN tsp_game_details tsp ON ap.session_id = tsp.session_id
          GROUP BY a.algorithm_id, a.algorithm_name, tsp.num_cities
          HAVING sample_count >= 3
          ORDER BY tsp.num_cities, avg_time_ms
        `);
        break;

      case 'recent_games':
        const limit = parseInt(searchParams.get('limit')) || 20;
        data = await db.query(`
          SELECT 
            gs.session_id,
            p.player_name,
            tsp.home_city,
            tsp.num_cities,
            tsp.player_distance,
            tsp.optimal_distance,
            tsp.distance_difference,
            tsp.is_optimal,
            gs.started_at,
            gs.session_duration_seconds
          FROM game_sessions gs
          JOIN players p ON gs.player_id = p.player_id
          JOIN games g ON gs.game_id = g.game_id
          JOIN tsp_game_details tsp ON gs.session_id = tsp.session_id
          WHERE g.game_code = 'tsp' AND gs.is_completed = TRUE
          ORDER BY gs.started_at DESC
          LIMIT ?
        `, [limit]);
        break;

      case 'city_popularity':
        // Most frequently selected cities
        data = await db.query(`
          SELECT 
            tsc.city_name,
            COUNT(*) as times_selected,
            SUM(CASE WHEN tsc.is_home THEN 1 ELSE 0 END) as times_home,
            SUM(CASE WHEN tsc.is_home THEN 0 ELSE 1 END) as times_destination,
            ROUND(AVG(tsp.is_optimal), 2) * 100 as success_rate_with_city
          FROM tsp_selected_cities tsc
          JOIN tsp_game_details tsp ON tsc.session_id = tsp.session_id
          GROUP BY tsc.city_name
          ORDER BY times_selected DESC
        `);
        break;

      case 'difficulty_analysis':
        // Analysis by number of cities
        data = await db.query(`
          SELECT 
            tsp.num_cities,
            COUNT(*) as games_played,
            SUM(CASE WHEN tsp.is_optimal THEN 1 ELSE 0 END) as optimal_solutions,
            ROUND(AVG(CASE WHEN tsp.is_optimal THEN 1 ELSE 0 END) * 100, 2) as success_rate,
            ROUND(AVG(tsp.distance_difference), 2) as avg_error,
            ROUND(AVG(gs.session_duration_seconds), 0) as avg_duration
          FROM tsp_game_details tsp
          JOIN game_sessions gs ON tsp.session_id = gs.session_id
          WHERE gs.is_completed = TRUE
          GROUP BY tsp.num_cities
          ORDER BY tsp.num_cities
        `);
        break;

      case 'daily_activity':
        const days = parseInt(searchParams.get('days')) || 30;
        data = await db.query(`
          SELECT 
            DATE(gs.started_at) as game_date,
            COUNT(*) as games_played,
            COUNT(DISTINCT p.player_id) as unique_players,
            SUM(CASE WHEN tsp.is_optimal THEN 1 ELSE 0 END) as optimal_solutions,
            ROUND(AVG(gs.session_duration_seconds), 0) as avg_duration
          FROM game_sessions gs
          JOIN players p ON gs.player_id = p.player_id
          JOIN tsp_game_details tsp ON gs.session_id = tsp.session_id
          WHERE gs.started_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
            AND gs.is_completed = TRUE
          GROUP BY DATE(gs.started_at)
          ORDER BY game_date DESC
        `, [days]);
        break;

      case 'player_rankings':
        const minGames = parseInt(searchParams.get('minGames')) || 5;
        data = await db.query(`
          SELECT 
            p.player_name,
            COUNT(tsp.tsp_detail_id) as total_games,
            SUM(CASE WHEN tsp.is_optimal THEN 1 ELSE 0 END) as optimal_solutions,
            ROUND(AVG(CASE WHEN tsp.is_optimal THEN 1 ELSE 0 END) * 100, 2) as success_rate,
            ROUND(AVG(tsp.distance_difference), 2) as avg_error,
            ROUND(AVG(tsp.num_cities), 1) as avg_difficulty,
            RANK() OVER (ORDER BY SUM(CASE WHEN tsp.is_optimal THEN 1 ELSE 0 END) DESC) as ranking
          FROM players p
          JOIN game_sessions gs ON p.player_id = gs.player_id
          JOIN tsp_game_details tsp ON gs.session_id = tsp.session_id
          WHERE gs.is_completed = TRUE
          GROUP BY p.player_id, p.player_name
          HAVING total_games >= ?
          ORDER BY ranking
          LIMIT 50
        `, [minGames]);
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid analytics type. Valid types: overview, algorithm_comparison, time_trends, recent_games, city_popularity, difficulty_analysis, daily_activity, player_rankings' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      type: type,
      data: data
    });

  } catch (error) {
    console.error('Analytics API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics', details: error.message },
      { status: 500 }
    );
  }
}