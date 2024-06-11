import pool from '../config/db.js';

export const getUserLeagues = async (req, res) => {
  const userId = req.params.userId;
  const query = `
        SELECT lhu.team_name, l.name AS league_name, l.id AS league_id
        FROM leagues_have_users lhu
        JOIN leagues l ON lhu.league_id = l.id
        WHERE lhu.user_id = ?;
    `;

  try {
    const [rows] = await pool.query(query, [userId]);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};
