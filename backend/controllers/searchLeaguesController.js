import pool from '../config/db.js';

export const searchLeagues = async (req, res) => {
  const { query } = req.query;

  if (!query) {
    return res.status(400).json({ msg: 'Query parameter is required' });
  }

  try {
    // Search for leagues where the name matches the query
    const [leagues] = await pool.query(
      'SELECT id, name FROM leagues WHERE name LIKE ? LIMIT 10',
      [`%${query}%`]
    );

    if (leagues.length === 0) {
      return res.status(404).json({ msg: 'No leagues found' });
    }

    res.json(leagues);
  } catch (err) {
    console.error(err.message);
    res.status(500).send(`Server error: ${err.message}`);
  }
};
