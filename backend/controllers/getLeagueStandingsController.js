import pool from '../config/db.js';

export const getLeagueStandings = async (req, res) => {
  const leagueId = req.params.leagueId; // Assuming leagueId is passed as a parameter
  const query = `
    SELECT 
      uhs.user_id, 
      uhs.league_id, 
      SUM(uhs.points) AS total_points, 
      SUM(uhs.perfect) AS perfect_weeks,
      SUM(uhs.overdog_correct) AS overdog_correct,
      SUM(uhs.underdog_correct) AS underdog_correct,
      MAX(uhs.curr_streak) AS curr_streak,
      MAX(uhs.max_streak) AS max_streak,
      u.email AS user_email,
      l.name AS league_name,
      lhu.team_name AS team_name
    FROM users_have_scores uhs
    JOIN users u ON uhs.user_id = u.id
    JOIN leagues l ON uhs.league_id = l.id
    JOIN leagues_have_users lhu ON uhs.user_id = lhu.user_id AND uhs.league_id = lhu.league_id
    WHERE uhs.league_id = ?
    GROUP BY uhs.user_id, uhs.league_id, u.email, l.name, lhu.team_name
    ORDER BY total_points DESC;
  `;

  try {
    const [rows] = await pool.query(query, [leagueId]);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};
