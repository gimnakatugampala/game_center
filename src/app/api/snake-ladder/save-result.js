// pages/api/game/save-result.js
import { query } from '../../../../lib/db'; // අපි 1වෙනි පියවරේ හදපු db helper එක

export default async function handler(req, res) {
  // POST request විතරයි
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  // Frontend එකෙන් එවන දත්ත
  const { 
    playerName, 
    correctAnswer, 
    boardSize, 
    timeTaken 
  } = req.body;

  // Validation (Exception Handling)
  if (!playerName || !correctAnswer || !boardSize || !timeTaken) {
    return res.status(400).json({ message: 'අවශ්‍ය දත්ත සියල්ල නොමැත.' });
  }

  try {
    // 1. 'player_scores' table එකට දිනපු කෙනාගේ data දාමු
    const savePlayerQuery = `
      INSERT INTO player_scores (player_name, correct_throws)
      VALUES (?, ?)
    `;
    await query({
      query: savePlayerQuery,
      values: [playerName, correctAnswer],
    });

    // 2. 'algorithm_performance' table එකට දත්ත දාමු
    // (එකම game round එකට අයිතියි කියලා අඳුරගන්න
    // අපි random game_round_id එකක් හදාගමු)
    const gameRoundId = `game_${Date.now()}`;

    const saveAlgoQuery = `
      INSERT INTO algorithm_performance 
        (board_size, algorithm_name, time_taken_ms, game_round_id)
      VALUES 
        (?, 'BFS', ?, ?),
        (?, 'Dijkstra', ?, ?)
    `;

    await query({
      query: saveAlgoQuery,
      values: [
        boardSize, timeTaken.bfs_ms, gameRoundId,
        boardSize, timeTaken.dijkstra_ms, gameRoundId
      ],
    });

    // හැමදේම හරි!
    return res.status(201).json({ success: true, message: 'ප්‍රතිඵල සාර්ථකව සටහන් විය.' });

  } catch (error) {
    // Database Error (Exception Handling)
    console.error('API Save Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Database එකේ දෝෂයක් ඇතිවිය: ' + error.message,
    });
  }
}