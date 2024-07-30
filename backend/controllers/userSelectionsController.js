import pool from '../config/db.js';

export const userSelections = async (req, res) => {
  const { leagueId, userId } = req.params;

  try {
    const [league] = await pool.query('SELECT * FROM users_select_games WHERE league_id = ? AND user_id = ?', [
      leagueId, userId,
    ]);
    res.status(200).json({ league });
  } catch (err) {
    console.error(err.message);
    res.status(500).send(`Server error: ${err.message}`);
  }
};
