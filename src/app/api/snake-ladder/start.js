// pages/api/game/start.js
import { runGameLogic } from '../../../lib/gameLogic';

export default function handler(req, res) {
  // මේ API එකට POST request විතරයි එන්න දෙන්නේ
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const { N } = req.body; // User එවපු N එක
    const boardSize = parseInt(N, 10);

    // Validation (පැවරුමට අනුව 6-12)
    if (!boardSize || boardSize < 6 || boardSize > 12) {
      return res.status(400).json({
        success: false,
        message: 'Board size (N) 6 සහ 12 අතර විය යුතුය.',
      });
    }

    // අපි හදපු logic එක run කරමු
    const gameData = runGameLogic(boardSize);

    // හැමදේම හරි, game දත්ත ටික frontend එකට යවමු
    return res.status(200).json({
      success: true,
      data: gameData,
    });
  } catch (error) {
    // Exception Handling (පැවරුමට අනුව)
    console.error('API Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server එකේ දෝෂයක් ඇතිවිය: ' + error.message,
    });
  }
}