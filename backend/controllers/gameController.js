import pool from '../config/db.js';

export const getGamesByWeek = async (req, res) => {
  const week = req.params.week;
  const query = `
    SELECT g.*, 
           ht.name AS home_team_name, 
           at.name AS away_team_name
    FROM games g
    JOIN teams ht ON g.home_team_id = ht.id
    JOIN teams at ON g.away_team_id = at.id
    WHERE g.week = ?
  `;

  try {
    const [rows] = await pool.query(query, [week]);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};
