const { getGameHistory } = require('../../../lib/db');

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const limit = parseInt(req.query.limit) || 10;
    const history = await getGameHistory(limit);
    return res.status(200).json({ history });
  } catch (error) {
    console.error('Error fetching game history:', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}

