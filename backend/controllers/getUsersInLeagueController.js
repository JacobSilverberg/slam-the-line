import pool from '../config/db.js';

export const getUsersInLeague = async (req, res) => {
  const { leagueId } = req.params; // Get leagueId from the request parameters
  const query = `
    SELECT lhu.user_id, lhu.team_name
    FROM leagues_have_users lhu
    WHERE lhu.league_id = ?;
  `;

  try {
    const [rows] = await pool.query(query, [leagueId]); // Use leagueId in the query
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};
