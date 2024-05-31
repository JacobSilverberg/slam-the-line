import pool from '../config/db.js';

export const leagueRegistration = async (req, res) => {
  const { leagueId, userId } = req.params;
  const { league_role, team_name } = req.body;

  try {
    // Check if the user is already signed up for the league
    const [user] = await pool.query(
      'SELECT * FROM leagues_have_users WHERE user_id = ? AND league_id = ?',
      [userId, leagueId]
    );
    if (user.length > 0) {
      return res
        .status(400)
        .json({ msg: 'User is already signed up for the league' });
    }

    await pool.query(
      'INSERT INTO leagues_have_users (user_id, league_id, league_role, team_name) VALUES (?, ?, ?, ?)',
      [userId, leagueId, league_role, team_name]
    );

    res.json({ msg: 'User successfully signed up for the league' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send(`Server error: ${err.message}`);
  }
};
